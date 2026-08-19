#!/usr/bin/env node
// Smoke tests for scripts/hq.mjs.
//
// Each test builds a throwaway HQ in a temp directory, runs the real CLI against
// it as a subprocess, and asserts on the files it left behind. Nothing here
// touches the HQ you actually use.
//
//   node scripts/test.mjs
//
// Green is the bar for every change to hq.mjs. A capture tool that writes to the
// wrong file, or invents an entity from a typo, is worse than no tool at all.

import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CLI = join(dirname(fileURLToPath(import.meta.url)), 'hq.mjs');

let passed = 0;
const failures = [];

function test(name, fn) {
  const root = mkdtempSync(join(tmpdir(), 'hq-test-'));
  try {
    scaffold(root);
    fn(root);
    passed++;
    console.log(`  ok   ${name}`);
  } catch (err) {
    failures.push(name);
    console.log(`  FAIL ${name}`);
    console.log(`       ${err.message.split('\n').join('\n       ')}`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

// A minimal HQ: the shape AGENTS.md scaffolds, with three real entities.
function scaffold(root) {
  mkdirSync(join(root, 'memory'), { recursive: true });
  for (const p of ['projects/atlas', 'areas/people/dana', 'areas/northwind']) {
    mkdirSync(join(root, 'vault', p), { recursive: true });
    writeFileSync(join(root, 'vault', p, 'summary.md'), `# ${p.split('/').pop()}\n\nA real entity used by the tests.\n`);
    writeFileSync(join(root, 'vault', p, 'items.json'), '[]\n');
  }
  mkdirSync(join(root, 'vault/resources'), { recursive: true });
  mkdirSync(join(root, 'vault/archives'), { recursive: true });
  writeFileSync(join(root, 'vault/resources/pricing.md'), '# Pricing\n\nHow we think about pricing.\n');
  writeFileSync(join(root, 'USER.md'), '# USER: Test\n\n## Identity\n- Name: Test\n\n## Working style / communication preferences\n- Direct.\n\n## Hard lines\n- None.\n');
}

function run(root, args) {
  try {
    const stdout = execFileSync('node', [CLI, ...args], {
      env: { ...process.env, HQ_ROOT: root }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { code: 0, stdout, stderr: '' };
  } catch (err) {
    return { code: err.status ?? 1, stdout: err.stdout || '', stderr: err.stderr || '' };
  }
}

const facts = (root, p) => JSON.parse(readFileSync(join(root, 'vault', p, 'items.json'), 'utf8'));
const read = (root, p) => readFileSync(join(root, p), 'utf8');
const iso = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

console.log('\nhq.mjs smoke tests\n');

// ------------------------------------------------------------------------ now

test('now prints today and its derived dates', (root) => {
  const r = run(root, ['now']);
  assert(r.code === 0, `exit ${r.code}: ${r.stderr}`);
  assert(r.stdout.includes(iso()), 'output does not contain today');
  for (const label of ['yesterday', 'tomorrow', 'this week', 'in 30 days', 'end of month']) {
    assert(r.stdout.includes(label), `missing "${label}"`);
  }
  const dates = r.stdout.match(/\d{4}-\d{2}-\d{2}/g) || [];
  assert(dates.length >= 8, `expected several derived dates, got ${dates.length}`);
});

// ----------------------------------------------------------------- note: bare

test('a bare note lands in memory/YYYY-MM-DD.md', (root) => {
  const r = run(root, ['note', 'Decided to price the retainer monthly']);
  assert(r.code === 0, `exit ${r.code}: ${r.stderr}`);
  const file = join('memory', `${iso()}.md`);
  assert(existsSync(join(root, file)), `${file} was not created`);
  const text = read(root, file);
  assert(text.includes('Decided to price the retainer monthly'), 'note text missing from the file');
  assert(text.includes('## Notes'), 'no Notes section');
});

test('a second bare note appends rather than overwriting', (root) => {
  run(root, ['note', 'First thing']);
  run(root, ['note', 'Second thing']);
  const text = read(root, join('memory', `${iso()}.md`));
  assert(text.includes('First thing') && text.includes('Second thing'), 'one of the notes was lost');
  assert((text.match(/# \d{4}-\d{2}-\d{2}/g) || []).length === 1, 'the day header was written twice');
});

// ----------------------------------------------------------------- note: user

test('--user appends to USER.md under working style', (root) => {
  const r = run(root, ['note', 'Wants numbers, not adjectives', '--user']);
  assert(r.code === 0, `exit ${r.code}: ${r.stderr}`);
  const text = read(root, 'USER.md');
  assert(text.includes('Wants numbers, not adjectives'), 'the line is missing');
  const styleBlock = text.split('## Working style / communication preferences')[1].split('\n## ')[0];
  assert(styleBlock.includes('Wants numbers'), 'the line landed outside the working-style section');
  assert(text.includes('## Hard lines'), 'the rest of USER.md was damaged');
});

// --------------------------------------------------------------- note: entity

test('--entity writes a full fact record with an id', (root) => {
  const r = run(root, ['note', 'Runs the Tuesday standup', '--entity', 'dana',
    '--category', 'role', '--source', 'conversation']);
  assert(r.code === 0, `exit ${r.code}: ${r.stderr}`);
  const [f, ...rest] = facts(root, 'areas/people/dana');
  assert(rest.length === 0, 'expected exactly one fact');
  assert(f.id === 'dana-001', `id was ${f.id}`);
  assert(f.fact === 'Runs the Tuesday standup', 'fact text is wrong');
  assert(f.category === 'role' && f.source === 'conversation', 'category or source is wrong');
  assert(f.status === 'active' && f.supersededBy === null, 'status fields are wrong');
  assert(f.privacy === 'normal' && Array.isArray(f.relatedEntities), 'privacy or relatedEntities is wrong');
  assert(f.date === iso(), `date was ${f.date}`);
  assert(r.stdout.includes('dana-001'), 'the confirmation does not name the id');
});

test('ids increment per entity', (root) => {
  run(root, ['note', 'One', '--entity', 'dana']);
  run(root, ['note', 'Two', '--entity', 'dana']);
  run(root, ['note', 'Elsewhere', '--entity', 'atlas']);
  assert(facts(root, 'areas/people/dana').map((f) => f.id).join(',') === 'dana-001,dana-002', 'dana ids are wrong');
  assert(facts(root, 'projects/atlas')[0].id === 'atlas-001', 'atlas id is wrong');
});

test('a full vault path resolves too', (root) => {
  const r = run(root, ['note', 'Nested path works', '--entity', 'areas/people/dana']);
  assert(r.code === 0, `exit ${r.code}: ${r.stderr}`);
  assert(facts(root, 'areas/people/dana').length === 1, 'nothing was written');
});

test('a near-miss entity is refused and nothing is written', (root) => {
  const r = run(root, ['note', 'Should not land', '--entity', 'dan']);
  assert(r.code !== 0, 'the near miss was accepted');
  assert(r.stderr.includes('did you mean'), 'no candidate was printed');
  assert(r.stderr.includes('dana'), 'the candidate is not dana');
  assert(facts(root, 'areas/people/dana').length === 0, 'a fact was written anyway');
  assert(!existsSync(join(root, 'vault/areas/people/dan')), 'a phantom entity folder was created');
});

// A dropped letter leaves no substring to match on, so a substring-only search
// hands back an empty candidate list while the docs promise candidates.
test('a mistyped letter still gets a candidate', (root) => {
  const r = run(root, ['note', 'Should not land', '--entity', 'northwnd']);
  assert(r.code !== 0, 'the typo was accepted');
  assert(r.stderr.includes('did you mean'), 'no candidate was printed');
  assert(r.stderr.includes('areas/northwind'), `the candidate is not northwind:\n${r.stderr}`);
  assert(facts(root, 'areas/northwind').length === 0, 'a fact was written anyway');
});

test('a genuinely unrelated ref gets no candidates and still refuses', (root) => {
  const r = run(root, ['note', 'Should not land', '--entity', 'quarterly-taxes']);
  assert(r.code !== 0, 'an unknown entity was accepted');
  assert(!r.stderr.includes('did you mean'), `candidates were invented:\n${r.stderr}`);
});

test('an unresolvable --related is refused and nothing is written', (root) => {
  const r = run(root, ['note', 'Should not land', '--entity', 'dana', '--related', 'northwynd']);
  assert(r.code !== 0, 'the bad related ref was accepted');
  assert(facts(root, 'areas/people/dana').length === 0, 'a fact was written anyway');
});

test('a resolvable --related is stored as a vault path', (root) => {
  const r = run(root, ['note', 'Introduced by Northwind', '--entity', 'dana', '--related', 'northwind']);
  assert(r.code === 0, `exit ${r.code}: ${r.stderr}`);
  assert(facts(root, 'areas/people/dana')[0].relatedEntities[0] === 'areas/northwind', 'related path is wrong');
});

test('--dry writes nothing', (root) => {
  const r = run(root, ['note', 'Just looking', '--entity', 'dana', '--dry']);
  assert(r.code === 0, `exit ${r.code}: ${r.stderr}`);
  assert(facts(root, 'areas/people/dana').length === 0, 'the dry run wrote a fact');
});

test('an invalid privacy value is refused', (root) => {
  const r = run(root, ['note', 'Nope', '--entity', 'dana', '--privacy', 'secret']);
  assert(r.code !== 0, 'the bad privacy value was accepted');
  assert(facts(root, 'areas/people/dana').length === 0, 'a fact was written anyway');
});

test('a corrupt items.json is refused, not overwritten', (root) => {
  const p = join(root, 'vault/areas/people/dana/items.json');
  writeFileSync(p, '{ this is not json');
  const r = run(root, ['note', 'Nope', '--entity', 'dana']);
  assert(r.code !== 0, 'the corrupt file was accepted');
  assert(readFileSync(p, 'utf8') === '{ this is not json', 'the fact log was overwritten');
});

// ----------------------------------------------------------- note: supersede

test('supersede marks the old fact and appends the new one', (root) => {
  run(root, ['note', 'Ceiling is $4,500', '--entity', 'northwind', '--category', 'finance']);
  const r = run(root, ['note', 'supersede', 'northwind-001', '--with', 'Ceiling is $2,000']);
  assert(r.code === 0, `exit ${r.code}: ${r.stderr}`);
  const all = facts(root, 'areas/northwind');
  assert(all.length === 2, `expected 2 facts, got ${all.length}`);
  assert(all[0].status === 'superseded', 'the old fact is still active');
  assert(all[0].supersededBy === 'northwind-002', `supersededBy is ${all[0].supersededBy}`);
  assert(all[0].fact === 'Ceiling is $4,500', 'the old fact text was changed');
  assert(all[1].fact === 'Ceiling is $2,000', 'the new fact text is wrong');
  assert(all[1].category === 'finance', 'the category was not inherited');
});

test('supersede on an unknown id fails and changes nothing', (root) => {
  run(root, ['note', 'A fact', '--entity', 'northwind']);
  const r = run(root, ['note', 'supersede', 'northwind-099', '--with', 'Nope']);
  assert(r.code !== 0, 'an unknown id was accepted');
  const all = facts(root, 'areas/northwind');
  assert(all.length === 1 && all[0].status === 'active', 'the fact log was touched');
});

// ---------------------------------------------------------------------- index

test('index writes a row per entity with a stats footer', (root) => {
  const r = run(root, ['index']);
  assert(r.code === 0, `exit ${r.code}: ${r.stderr}`);
  const text = read(root, 'vault/index.md');
  for (const link of ['projects/atlas/summary.md', 'areas/people/dana/summary.md',
    'areas/northwind/summary.md', 'resources/pricing.md']) {
    assert(text.includes(`(${link})`), `missing a row for ${link}`);
  }
  for (const section of ['## Projects', '## Areas', '## Resources', '## Archives']) {
    assert(text.includes(section), `missing ${section}`);
  }
  assert(/\*\*Stats:\*\* 4 entities/.test(text), 'the stats footer is wrong');
  assert(text.includes('200 entities'), 'the search-index trigger is missing');
});

test('index preserves hand-written descriptions', (root) => {
  run(root, ['index']);
  const p = join(root, 'vault/index.md');
  const edited = readFileSync(p, 'utf8').replace(
    /^(\| Dana \| \[summary\]\(areas\/people\/dana\/summary\.md\) \|).*\|$/m,
    '$1 The one who runs the standup |');
  writeFileSync(p, edited);
  run(root, ['index']);
  assert(readFileSync(p, 'utf8').includes('The one who runs the standup'), 'the description was eaten');
});

test('index picks up an entity added after the last run', (root) => {
  run(root, ['index']);
  mkdirSync(join(root, 'vault/projects/beacon'), { recursive: true });
  writeFileSync(join(root, 'vault/projects/beacon/summary.md'), '# Beacon\n\nA second project.\n');
  run(root, ['index']);
  const text = read(root, 'vault/index.md');
  assert(text.includes('projects/beacon/summary.md'), 'the new entity is missing');
  assert(text.includes('A second project.'), 'no description was derived');
  assert(/\*\*Stats:\*\* 5 entities/.test(text), 'the count did not update');
});

// vault/resources/memory-architecture.md, seeded by the bootstrap, opens with a
// lead-in that ends in a colon. Derived verbatim it becomes a description that
// stops mid-thought.
test('a derived description does not end on a lead-in', (root) => {
  writeFileSync(join(root, 'vault/resources/why-files.md'),
    '# Why files\n\nHQ stores memory as plain files in git, not a hosted database, because:\n\n- you can read them\n');
  mkdirSync(join(root, 'vault/areas/ops'), { recursive: true });
  writeFileSync(join(root, 'vault/areas/ops/summary.md'),
    '# Ops\n\nDana runs ops. She owns the following:\n\n- billing\n');
  run(root, ['index']);
  const rows = read(root, 'vault/index.md').split('\n').filter((l) => l.startsWith('| '));
  const cell = (link) => rows.find((l) => l.includes(`(${link})`)).split('|')[3].trim();
  const files = cell('resources/why-files.md');
  assert(!/[:,;]$/.test(files), `the description ends on punctuation: "${files}"`);
  assert(!/\bbecause$/.test(files), `the description ends on a dangling connector: "${files}"`);
  assert(files.startsWith('HQ stores memory as plain files in git'), `the description was gutted: "${files}"`);
  assert(cell('areas/ops/summary.md') === 'Dana runs ops.', `expected the first sentence, got "${cell('areas/ops/summary.md')}"`);
});

test('index handles a non-PARA bucket the user added', (root) => {
  mkdirSync(join(root, 'vault/writing/essay-drafts'), { recursive: true });
  writeFileSync(join(root, 'vault/writing/essay-drafts/summary.md'), '# Drafts\n\nEssays in progress.\n');
  const r = run(root, ['index']);
  assert(r.code === 0, `exit ${r.code}: ${r.stderr}`);
  const text = read(root, 'vault/index.md');
  assert(text.includes('## Writing'), 'the extra bucket got no section');
  assert(text.indexOf('## Projects') < text.indexOf('## Writing'), 'PARA buckets lost their order');
});

// ----------------------------------------------------------------- interface

test('help and note --help print without touching anything', (root) => {
  const h = run(root, ['help']);
  assert(h.code === 0 && h.stdout.includes('hq index'), 'help is broken');
  const nh = run(root, ['note', '--help']);
  assert(nh.code === 0 && nh.stdout.includes('FACT SCHEMA'), 'note --help is broken');
});

test('an unknown verb fails loudly', (root) => {
  const r = run(root, ['sync']);
  assert(r.code !== 0, 'an unknown verb exited 0');
  assert(r.stderr.includes('now'), 'the error does not list the real verbs');
});

// No `hq` binary is installed anywhere. Any output telling the reader to run one
// sends them to a command not found, so the help text spells the real call.
test('nothing tells the reader to run a bare hq command', (root) => {
  const texts = [
    run(root, ['help']).stdout,
    run(root, ['note', '--help']).stdout,
    run(root, ['sync']).stderr,
  ];
  for (const t of texts) {
    assert(!/\bhq help\b/.test(t), `an instruction sends the reader to "hq help":\n${t}`);
    assert(!/\bRun `hq\b/.test(t), `an instruction says to run a bare hq command:\n${t}`);
  }
  assert(texts[0].includes('node scripts/hq.mjs'), 'help does not spell the real invocation');
  assert(texts[0].includes('no `hq` binary'), 'help does not say the short spelling is an alias');
  assert(texts[2].includes('node scripts/hq.mjs help'), 'the unknown-verb error does not spell the real invocation');
});

// The bootstrap procedure's templates are copied verbatim into a real HQ, so a
// bare `hq note` written here becomes a command not found in someone's manual.
// The alias step is the one place allowed to spell the short form, and every
// line that does so names the alias.
test('the bootstrap procedure never writes a bare hq command', () => {
  const doc = join(dirname(CLI), '..', 'AGENTS.md');
  if (!existsSync(doc)) return;
  const text = readFileSync(doc, 'utf8');
  if (!text.includes('HQ Bootstrap Procedure')) return; // an HQ's own manual, not the starter's
  const offenders = text.split('\n')
    .map((line, i) => [i + 1, line])
    .filter(([, line]) => /`hq (now|note|index|help)\b/.test(line) && !line.includes('alias'));
  assert(offenders.length === 0,
    `AGENTS.md spells a bare hq command:\n${offenders.map(([n, l]) => `  ${n}: ${l.trim()}`).join('\n')}`);
});

console.log(`\n${passed} passed, ${failures.length} failed\n`);
if (failures.length) {
  for (const f of failures) console.log(`  failed: ${f}`);
  process.exit(1);
}

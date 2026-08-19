#!/usr/bin/env node
// hq: the HQ memory CLI.
//
// One file, Node 18+, no dependencies, so it can be copied into an HQ and run
// with nothing installed. Three verbs:
//
//   hq now              the date, the time, and every date derived from them
//   hq note "<fact>"    capture, routed by flag, validated, read back from disk
//   hq index            regenerate vault/index.md from the vault tree
//
// Why a write path first, before any search: the failure that costs a vault its
// trust is a fact written to the wrong place, or an entity quietly invented by a
// typo. Grep already reads the vault well at this size. Nothing read it wrong;
// things got written wrong. So the first tool validates writes.
//
// Root resolution: HQ_ROOT if set, otherwise the parent of this script's folder,
// which is the HQ root whenever this lives at <hq>/scripts/hq.mjs.

import {
  existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.HQ_ROOT || dirname(HERE);
const VAULT = join(ROOT, 'vault');

// ------------------------------------------------------------------ arguments

const argv = process.argv.slice(2);

// A bare word is positional unless the token before it is a value-taking flag.
const VALUELESS = new Set(['--user', '--dry', '--help']);
const positional = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith('--')) continue;
  const prev = argv[i - 1];
  if (prev && prev.startsWith('--') && !prev.includes('=') && !VALUELESS.has(prev)) continue;
  positional.push(a);
}

function flag(name) {
  const eq = argv.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.slice(name.length + 3);
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return null;
  const next = argv[i + 1];
  return next && !next.startsWith('--') ? next : '';
}

function flags(name) {
  const out = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === `--${name}` && argv[i + 1] && !argv[i + 1].startsWith('--')) out.push(argv[i + 1]);
    else if (argv[i].startsWith(`--${name}=`)) out.push(argv[i].slice(name.length + 3));
  }
  return out;
}

const has = (name) => argv.includes(`--${name}`) || argv.some((a) => a.startsWith(`--${name}=`));

function die(lines) {
  for (const line of [].concat(lines)) console.error(line);
  process.exit(1);
}

// ---------------------------------------------------------------------- dates

const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => iso(new Date());
const shift = (d, days) => { const x = new Date(d); x.setDate(x.getDate() + days); return x; };
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function cmdNow() {
  const d = new Date();
  const dow = d.getDay();
  const monday = shift(d, dow === 0 ? -6 : 1 - dow);
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const abbr = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
    .formatToParts(d).find((p) => p.type === 'timeZoneName')?.value || '';
  const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);

  const rows = [
    ['date', `${today()} (${DAYS[dow]})`],
    ['time', `${pad(d.getHours())}:${pad(d.getMinutes())} ${abbr} · ${zone}`],
    ['', ''],
    ['yesterday', iso(shift(d, -1))],
    ['tomorrow', iso(shift(d, 1))],
    ['this week', `${iso(monday)} Mon … ${iso(shift(monday, 6))} Sun`],
    ['next week', `${iso(shift(monday, 7))} Mon … ${iso(shift(monday, 13))} Sun`],
    ['in 7 days', iso(shift(d, 7))],
    ['in 14 days', iso(shift(d, 14))],
    ['in 30 days', iso(shift(d, 30))],
    ['end of month', iso(endOfMonth)],
  ];
  for (const [k, v] of rows) console.log(k ? `  ${k.padEnd(14)}${v}` : '');
  console.log('\n  Use these. Never compute a date in your head, and never write a relative one.');
}

// ------------------------------------------------------------------- entities

// An entity is a folder under vault/ carrying summary.md or items.json, or a
// bare .md file sitting directly in a bucket.
function allEntities() {
  const out = [];
  const scan = (dir, depth) => {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir).sort()) {
      if (name.startsWith('.')) continue;
      const p = join(dir, name);
      const rel = p.slice(VAULT.length + 1);
      if (statSync(p).isDirectory()) {
        if (existsSync(join(p, 'summary.md')) || existsSync(join(p, 'items.json'))) {
          out.push({ name, path: rel, folder: true });
        }
        if (depth < 4) scan(p, depth + 1);
      } else if (name.endsWith('.md') && depth >= 1 && name !== 'index.md' && name !== 'summary.md' && name !== 'README.md') {
        out.push({ name: name.replace(/\.md$/, ''), path: rel.replace(/\.md$/, ''), folder: false });
      }
    }
  };
  scan(VAULT, 0);
  return out;
}

// Levenshtein distance, used only to build the suggestion list. Entity counts
// are in the dozens, so the simple O(n*m) version costs nothing.
function distance(a, b) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 3) return 99;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = row;
  }
  return prev[b.length];
}

// Exact match or nothing. A near miss prints its candidates and refuses, so a
// typo can never quietly become a second entity.
function resolveEntity(ref) {
  const want = String(ref || '').replace(/^vault\//, '').replace(/\/$/, '').toLowerCase();
  const ents = allEntities();
  const exact = ents.filter((e) => e.path.toLowerCase() === want || e.name.toLowerCase() === want);
  if (exact.length === 1) return { ok: true, entity: exact[0] };
  if (exact.length > 1) {
    return { ok: false, why: `"${ref}" matches ${exact.length} entities`, candidates: exact.map((e) => e.path) };
  }
  // Substrings catch a truncation ("dan" for "dana"). A dropped or swapped
  // letter leaves no substring to match on, so edit distance catches the rest:
  // "dot-fenimore" still suggests "dot-fennimore" rather than nothing at all.
  const near = ents
    .filter((e) => {
      const name = e.name.toLowerCase();
      const path = e.path.toLowerCase();
      if (path.includes(want) || want.includes(name) || name.includes(want)) return true;
      const budget = want.length <= 4 ? 1 : 2;
      return distance(want, name) <= budget || distance(want, path) <= budget;
    })
    .map((e) => e.path);
  return { ok: false, why: `"${ref}" did not resolve to an entity`, candidates: near };
}

const itemsPath = (ent) => join(VAULT, ent.path, 'items.json');

function loadFacts(ent) {
  const p = itemsPath(ent);
  if (!existsSync(p)) return [];
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(p, 'utf8') || '[]');
  } catch (err) {
    die([`\n✗ nothing written. vault/${ent.path}/items.json is not valid JSON:`, `    ${err.message}`,
      '  Fix the file by hand first. Overwriting it here would destroy the fact log.']);
  }
  if (!Array.isArray(parsed)) {
    die([`\n✗ nothing written. vault/${ent.path}/items.json is a ${typeof parsed}, and the fact log must be an array.`]);
  }
  return parsed;
}

function saveFacts(ent, facts) {
  mkdirSync(join(VAULT, ent.path), { recursive: true });
  writeFileSync(itemsPath(ent), `${JSON.stringify(facts, null, 2)}\n`);
}

function nextId(ent, facts) {
  const slug = ent.path.split('/').pop();
  let max = 0;
  for (const f of facts) {
    const m = String(f.id || '').match(/-(\d+)$/);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `${slug}-${String(max + 1).padStart(3, '0')}`;
}

const PRIVACY = ['normal', 'sensitive'];
const STATUS = ['active', 'superseded'];

function validate(rec, facts) {
  const errs = [];
  if (!rec.fact || !rec.fact.trim()) errs.push('fact is empty');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(rec.date)) errs.push(`date "${rec.date}" is not YYYY-MM-DD`);
  if (!rec.category || !rec.category.trim()) errs.push('category is empty');
  if (!rec.source || !rec.source.trim()) errs.push('source is empty');
  if (!STATUS.includes(rec.status)) errs.push(`status must be one of: ${STATUS.join(', ')}`);
  if (!PRIVACY.includes(rec.privacy)) errs.push(`privacy must be one of: ${PRIVACY.join(', ')}`);
  if (!Array.isArray(rec.relatedEntities)) errs.push('relatedEntities must be an array');
  if (facts.some((f) => f.id === rec.id)) errs.push(`id ${rec.id} is already taken in this file`);
  return errs;
}

// --------------------------------------------------------------------- note

function appendMemory(text, date) {
  const p = join(ROOT, 'memory', `${date}.md`);
  mkdirSync(dirname(p), { recursive: true });
  const d = new Date();
  const body = `\n- **${pad(d.getHours())}:${pad(d.getMinutes())}** ${text.trim()}\n`;
  if (!existsSync(p)) {
    writeFileSync(p, `# ${date}\n\n## Notes\n${body}`);
  } else {
    const cur = readFileSync(p, 'utf8');
    writeFileSync(p, cur.includes('\n## Notes')
      ? cur.replace('\n## Notes\n', `\n## Notes\n${body}`)
      : `${cur.replace(/\s*$/, '')}\n\n## Notes\n${body}`);
  }
  return p;
}

function appendUser(text, date) {
  const p = join(ROOT, 'USER.md');
  const line = `- ${text.trim()} (learned ${date})`;
  const heading = '## Working style / communication preferences';
  if (!existsSync(p)) {
    writeFileSync(p, `# USER\n\n${heading}\n${line}\n`);
    return p;
  }
  const cur = readFileSync(p, 'utf8');
  const m = cur.match(/^## Working style.*$/m);
  if (!m) {
    writeFileSync(p, `${cur.replace(/\s*$/, '')}\n\n${heading}\n${line}\n`);
    return p;
  }
  const start = cur.indexOf(m[0]) + m[0].length;
  const next = cur.indexOf('\n## ', start);
  const end = next === -1 ? cur.length : next;
  writeFileSync(p, `${cur.slice(0, end).replace(/\s*$/, '')}\n${line}\n${cur.slice(end)}`);
  return p;
}

function resolveRelated(refs) {
  const out = [];
  for (const ref of refs) {
    const r = resolveEntity(ref);
    if (!r.ok) {
      die(['\n✗ nothing written. ' + r.why + '.',
        ...(r.candidates.length ? [`    did you mean: ${r.candidates.join(', ')}`] : []),
        '  A related entity that only fuzzy-matches is refused rather than invented.']);
    }
    out.push(r.entity.path);
  }
  return out;
}

function cmdNote() {
  if (positional[1] === 'supersede') return noteSupersede(positional[2]);
  if (has('help') || positional.length < 2) return noteHelp();

  const text = positional.slice(1).join(' ');
  const date = flag('date') || today();

  // Routing is a flag, never a judgment made fresh each time.
  if (!has('entity') && !has('user')) {
    if (has('dry')) return console.log(`(dry) memory/${date}.md\n  ${text}`);
    const p = appendMemory(text, date);
    console.log(`\n✓ appended to ${p.slice(ROOT.length + 1)}\n\n  ${text}`);
    return;
  }
  if (has('user')) {
    if (has('dry')) return console.log(`(dry) USER.md\n  ${text}`);
    appendUser(text, date);
    console.log(`\n✓ appended to USER.md\n\n  ${text}`);
    return;
  }

  const r = resolveEntity(flag('entity'));
  if (!r.ok) {
    die(['\n✗ nothing written. ' + r.why + '.',
      ...(r.candidates.length ? [`    did you mean: ${r.candidates.join(', ')}`] : []),
      '  Create the entity by hand (summary.md + items.json) if it genuinely is new.']);
  }
  const ent = r.entity;
  if (!ent.folder) {
    die([`\n✗ nothing written. vault/${ent.path}.md is a single-file entity and has no items.json.`,
      '  Give it a folder (summary.md + items.json) first, or write the fact into the file by hand.']);
  }

  const facts = loadFacts(ent);
  const rec = {
    id: nextId(ent, facts),
    date,
    category: flag('category') || 'context',
    fact: text,
    source: flag('source') || 'conversation',
    relatedEntities: resolveRelated(flags('related')),
    status: 'active',
    supersededBy: null,
    privacy: flag('privacy') || 'normal',
  };

  const errs = validate(rec, facts);
  if (errs.length) die(['\n✗ nothing written:', ...errs.map((e) => `    ${e}`)]);
  if (has('dry')) return console.log(`(dry) vault/${ent.path}/items.json\n${JSON.stringify(rec, null, 2)}`);

  facts.push(rec);
  saveFacts(ent, facts);
  printFact(ent, rec.id);
}

// The confirmation is built by re-reading the file, so a write that silently
// failed cannot report success.
function printFact(ent, id) {
  const after = loadFacts(ent);
  const f = after.find((x) => x.id === id);
  if (!f) die(`✗ wrote ${id} but could not read it back from vault/${ent.path}/items.json`);
  const active = after.filter((x) => x.status === 'active').length;
  console.log(`\n✓ ${f.id} written, re-read from vault/${ent.path}/items.json\n`);
  console.log(`  fact       ${f.fact}`);
  console.log(`  category   ${f.category}`);
  console.log(`  source     ${f.source}`);
  console.log(`  related    ${f.relatedEntities.length ? f.relatedEntities.join(', ') : '(none)'}`);
  console.log(`  status     ${f.status} · privacy ${f.privacy} · date ${f.date}`);
  console.log(`\n  entity now holds ${after.length} fact${after.length === 1 ? '' : 's'} (${active} active, ${after.length - active} superseded)`);
  console.log('  If this changes current state, edit summary.md too.');
}

function noteSupersede(id) {
  const replacement = flag('with');
  if (!id || !replacement) die('hq note supersede <fact-id> --with "<the corrected fact>" [--category C] [--source S]');
  for (const ent of allEntities()) {
    if (!ent.folder || !existsSync(itemsPath(ent))) continue;
    const facts = loadFacts(ent);
    const old = facts.find((x) => x.id === id);
    if (!old) continue;

    const rec = {
      id: nextId(ent, facts),
      date: flag('date') || today(),
      category: flag('category') || old.category || 'context',
      fact: replacement,
      source: flag('source') || 'correction',
      relatedEntities: has('related') ? resolveRelated(flags('related')) : (old.relatedEntities || []),
      status: 'active',
      supersededBy: null,
      privacy: flag('privacy') || old.privacy || 'normal',
    };
    const errs = validate(rec, facts);
    if (errs.length) die(['\n✗ nothing written:', ...errs.map((e) => `    ${e}`)]);
    if (has('dry')) return console.log(`(dry) ${old.id} → superseded by ${rec.id}\n${JSON.stringify(rec, null, 2)}`);

    old.status = 'superseded';
    old.supersededBy = rec.id;
    facts.push(rec);
    saveFacts(ent, facts);
    console.log(`\n  ${old.id} → superseded, supersededBy ${rec.id}`);
    printFact(ent, rec.id);
    return;
  }
  die(`no fact with id "${id}" anywhere in vault/. Grep for the fact text to find its id.`);
}

function noteHelp() {
  console.log(`hq note: capture something so it survives the session.

  hq note "<fact>" --entity <ref>   a durable fact about a person, project, or company
                                    → vault/<entity>/items.json
  hq note "<fact>" --user           how the user operates
                                    → USER.md
  hq note "<what happened>"         a timeline event or a decision
                                    → memory/YYYY-MM-DD.md

  hq note supersede <id> --with "<the corrected fact>"
                                    marks the old fact superseded and appends the new one.
                                    Nothing is ever deleted.

FLAGS
  --entity <ref>     entity folder name or vault path. Exact match required.
  --user             route to USER.md instead.
  --category <c>     e.g. role, preference, decision, relationship, event. Default: context.
  --source <s>       conversation | email | document | inference, or a path. Default: conversation.
  --related <ref>    another entity this fact involves. Repeatable. Must resolve exactly.
  --privacy <p>      normal | sensitive. Default: normal.
  --date <d>         override the date (YYYY-MM-DD). Default: today.
  --dry              print what would be written and write nothing.

FACT SCHEMA (vault/<entity>/items.json, an append-only JSON array)
  id                 <entity-slug>-NNN, sequenced from the file. The address for superseding.
  date               when the fact was recorded.
  category           what kind of fact this is.
  fact               one atomic claim. If it needs an "and", it is two facts.
  source             where it came from, so its reliability can be judged later.
  relatedEntities    other entity paths this fact involves. Each one must resolve.
  status             active | superseded.
  supersededBy       id of the fact that replaced this one, or null.
  privacy            normal | sensitive.

A --entity or --related that only fuzzy-matches refuses the write and prints the candidates.
Hand-editing items.json skips all of this. Use the command.`);
}

// --------------------------------------------------------------------- index

const BUCKET_ORDER = ['projects', 'areas', 'resources', 'archives'];

const titleCase = (s) => s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// Descriptions are hand-written and better than anything derivable, so a
// regeneration preserves them, matched on the link path.
function existingDescriptions() {
  const p = join(VAULT, 'index.md');
  if (!existsSync(p)) return {};
  const out = {};
  const rows = readFileSync(p, 'utf8').matchAll(/^\|([^|]*)\|[^|]*\(([^)]+)\)[^|]*\|([^|]*)\|\s*$/gm);
  for (const m of rows) out[m[2].trim()] = m[3].trim();
  return out;
}

// A summary that opens with a lead-in ("…, not a database, because:") derives a
// description ending mid-thought. Prefer the last complete sentence; failing
// that, drop the colon and whatever connector it left dangling.
const DANGLING = /(?:[,;]\s*)?\b(?:because|since|such as|including|like|as|and|or|but|so|with|for|that|which|to|of|in|on|by|from|about|into|namely)$/i;

function tidyDescription(text) {
  let out = text.replace(/[\s:;,]+$/, '');
  if (/[:;,]$/.test(text) || DANGLING.test(out)) {
    const sentence = out.match(/^.*[.!?](?=\s)/);
    if (sentence && sentence[0].trim().length >= 12) return sentence[0].trim();
  }
  let prev = null;
  while (out !== prev) {
    prev = out;
    out = out.replace(DANGLING, '').replace(/[\s:;,]+$/, '');
  }
  return out;
}

function describe(ent) {
  const file = ent.folder ? join(VAULT, ent.path, 'summary.md') : join(VAULT, `${ent.path}.md`);
  if (!existsSync(file)) return '';
  const text = readFileSync(file, 'utf8').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  const para = [];
  for (const line of text.split('\n')) {
    const l = line.trim();
    if (!l) { if (para.length) break; continue; }
    if (para.length) { if (/^[-*#>|]/.test(l)) break; para.push(l); continue; }
    if (/^[#>]|^---/.test(l)) continue;
    para.push(l);
  }
  const clean = tidyDescription(para.join(' ').replace(/\s+/g, ' ').replace(/\|/g, '\\|').trim());
  return clean.length > 140 ? `${clean.slice(0, 137).replace(/\s\S*$/, '')}…` : clean;
}

function cmdIndex() {
  if (!existsSync(VAULT)) die(`no vault/ at ${ROOT}. Run this from inside an HQ, or set HQ_ROOT.`);

  const kept = existingDescriptions();
  const ents = allEntities();
  const buckets = new Map();
  for (const e of ents) {
    const bucket = e.path.split('/')[0];
    if (!buckets.has(bucket)) buckets.set(bucket, []);
    buckets.get(bucket).push(e);
  }
  for (const dir of readdirSync(VAULT).sort()) {
    if (dir.startsWith('.') || !statSync(join(VAULT, dir)).isDirectory()) continue;
    if (!buckets.has(dir)) buckets.set(dir, []);
  }

  const order = [...BUCKET_ORDER.filter((b) => buckets.has(b)),
    ...[...buckets.keys()].filter((b) => !BUCKET_ORDER.includes(b)).sort()];

  const out = [
    '# vault/index.md: index of everything',
    '',
    'Read this first. Narrow into a bucket, then grep, then read summary.md.',
    '',
    'Generated by `node scripts/hq.mjs index`. Structure comes from the vault tree;',
    'the Description column is hand-written and preserved across regenerations.',
    'Edit a description here, add an entity on disk, then run the command again.',
    '',
  ];

  const counts = [];
  for (const bucket of order) {
    const rows = buckets.get(bucket).slice().sort((a, b) => a.path.localeCompare(b.path));
    counts.push(`${bucket} ${rows.length}`);
    out.push(`## ${titleCase(bucket)}`, '', '| Entity | Summary | Description |', '|---|---|---|');
    for (const e of rows) {
      const link = e.folder ? `${e.path}/summary.md` : `${e.path}.md`;
      const desc = kept[link] || describe(e);
      out.push(`| ${titleCase(e.name)} | [summary](${link}) | ${desc} |`);
    }
    out.push('');
  }

  out.push('---', '',
    `**Stats:** ${ents.length} entities · ${counts.join(' · ')} · regenerated ${today()}.`,
    '',
    'Past roughly 200 entities, or once grep starts missing concept-level matches,',
    'this is the point where a real search index earns its keep. Not before.',
    '');

  const p = join(VAULT, 'index.md');
  writeFileSync(p, out.join('\n'));
  console.log(`✓ vault/index.md regenerated: ${ents.length} entities · ${counts.join(' · ')}`);
  const blank = ents.filter((e) => !(kept[e.folder ? `${e.path}/summary.md` : `${e.path}.md`] || describe(e))).length;
  if (blank) console.log(`  ${blank} entities have no description. Write one in index.md; it will be preserved.`);
}

// ----------------------------------------------------------------------- main

function help() {
  console.log(`hq: the HQ memory CLI. Node 18+, no dependencies.

  hq now                  the date, the time, and every date derived from them.
                          Read a date here, never compute one.
  hq note "<text>"        capture a fact, a decision, or how the user works.
                          hq note --help for routing, flags, and the fact schema.
  hq index                regenerate vault/index.md from the vault tree.

Run it as \`node scripts/hq.mjs <verb>\` from the HQ root, or set HQ_ROOT to point
it at an HQ elsewhere. There is no \`hq\` binary; the short spelling above is what
a shell alias gives you (\`alias hq='node <hq>/scripts/hq.mjs'\`), and every doc
writes the long form so it works before the alias exists.`);
}

const verb = positional[0];
if (verb === 'now') cmdNow();
else if (verb === 'note') cmdNote();
else if (verb === 'index') cmdIndex();
else if (!verb || verb === 'help' || has('help')) help();
else die([`unknown verb "${verb}".`, '', 'Verbs: now · note · index. Run `node scripts/hq.mjs help`.']);

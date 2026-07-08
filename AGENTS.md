# AGENTS.md: HQ Bootstrap Procedure

You are about to build **HQ**: a file-based second brain and companion workspace for one user. This document is the procedure you follow, in order, to build it from nothing. When you finish, `~/hq` (or wherever the user places it) is a git repo of plain markdown/JSON files that any future agent session, with zero conversational carryover, can read cold and know who this person is, what they're working on, and how to act.

Do not skip steps. Do not pre-fill files with example/placeholder content that could later be mistaken for real data. If you don't have a real answer yet, leave the section empty or marked `(TBD)`, never invented.

---

## Step 0: Before any content exists

1. Choose a root directory (e.g. `~/hq`). Confirm it doesn't already exist or already contain a git repo before you `git init`. You're bootstrapping from nothing, not on top of something.
2. Write `.gitignore` **first**, before any other file touches disk:
   ```
   .DS_Store
   *.log
   .env
   .env.*
   *.key
   credentials/
   .index-cache/
   .claude/settings.local.json
   ```
   This ordering matters: the first commit must never be able to leak a secret.
3. Create the agent's filesystem-access config (e.g. `.claude/settings.json`) with a placeholder path for wherever the user's real project code lives. Do not hardcode a personal path you haven't confirmed:
   ```json
   {
     "permissions": {
       "additionalDirectories": ["~/Workspace"]
     }
   }
   ```
   This is a placeholder. Step 1 confirms the real path(s), and Step 1's final instruction has you come back and edit this file. If the user's code lives in more than one root (e.g. a personal folder and a separate work folder), list all of them in the array. Do not leave the `~/Workspace` placeholder in the shipped repo.

---

## Step 1: Interview the user

Run this before writing any content file. Keep it short. These files get corrected over time, they don't need to be exhaustive on day one. Ask conversationally, not as a rigid form, but make sure you come away with answers to all of these:

**Identity**
- Name / preferred address, timezone.
- What they do (work, role, or life context) in their own words.
- 1–2 things they're actively focused on right now.

**Projects & code**
- Where does their real project/code work live on disk? (This becomes `MAP.md` and the access path in `.claude/settings.json`.)
- For each active project: name, one-line description, status (active/dormant/reference).

**People & entities worth knowing upfront**
- Key relationships (partner, family, close collaborators, direct reports, recurring clients).
- Key companies/organizations they're part of or deal with regularly.
- Any recurring commitments or areas of ongoing responsibility (health, finances, a community they're part of, pets, etc.) worth a vault folder from day one.

**Apps & connectors**
- Which apps should the companion eventually be able to see: email, calendar, documents,
  notes, anything else? Capture the answer (it informs `USER.md` and gets mentioned again in
  Step 8), but do **not** set up any connectors during bootstrap. Connecting works better as
  a deliberate step against a live system; the walkthrough is `guides/connect-your-apps.md`.

**How they want the agent to work**
- Desired tone/vibe (a handful of adjectives, or "talk like X").
- Any phrasing or habits to explicitly avoid (e.g. "no corporate enthusiasm," "don't hedge," "no emoji").
- Hard lines: non-negotiables. Always ask specifically about:
  - Sending messages/emails or posting publicly as them: draft-and-confirm, or full autonomy?
  - Anything they never want the agent to do without asking.
  - Anything sensitive (health, finances, legal) that needs special handling.

**Memory logistics**
- Confirm where their real project code lives (used to finalize `.claude/settings.json` and `MAP.md`).
- Ask whether they want this synced to a git remote. If yes, the remote **must be private**. This repo will hold personal, and possibly sensitive, information about them. Create it explicitly private, e.g. `gh repo create <name> --private --source . --remote origin`, or create a private repo in the GitHub UI and `git remote add origin <url>`. Never push this to a public remote. If the user isn't comfortable with git or GitHub, walk them through the hand-held path in `guides/your-hq-everywhere.md`, and verify the `Private` badge together before the first push.

**Before leaving Step 1, do these now, don't defer:**
- Edit `.claude/settings.json` and replace the `~/Workspace` placeholder with the real code path(s) you just confirmed. Add multiple array entries if the code lives in more than one root. A wrong or placeholder path here means future sessions silently can't read their project files.

Do not proceed to Step 2 until you have real answers, even partial ones, to every section above. Write down verbatim quotes where useful. They're better raw material for `SOUL.md`/`USER.md` than your paraphrase.

---

## Step 2: Create the directory structure

```
hq/
├── AGENTS.md              (or CLAUDE.md, see note below)
├── SOUL.md
├── USER.md
├── MAP.md
├── TASKS.md
├── .gitignore
├── .claude/
│   └── settings.json
├── memory/
│   └── README.md
├── journal/
│   └── README.md
├── vault/
│   ├── index.md
│   ├── PARA_GUIDE.md
│   ├── projects/
│   ├── areas/
│   │   └── people/
│   ├── resources/
│   └── archives/
├── skills/
│   ├── README.md
│   └── session-wrap/
│       └── SKILL.md
└── scripts/
    └── README.md
```

**Which filename for the operating manual?** You already know which CLI you are. If you're Claude Code, the canonical file is `CLAUDE.md`; if you're Codex or another CLI, it's `AGENTS.md`. Write the full manual under your own canonical name, and add a one-line stub at the other so a different agent still finds it later: e.g. `AGENTS.md` → `See CLAUDE.md, same file, read by both agents.` (or vice versa). Never maintain two diverging copies of the same manual. Only ask the user which CLI(s) to support if you genuinely can't tell.

Create every directory now, even ones that start empty (`vault/archives/`, `vault/resources/`): an empty directory with a `.gitkeep` if needed is fine; the point is the shape exists before content does.

---

## Step 3: Write the core files

Write these in this order, because each later one references the earlier ones by name. Show each back to the user for correction before treating it as settled. These are living documents, not one-shot outputs.

### 3a. `SOUL.md`: the agent's own voice/identity

This is how the agent shows up. It is separate from the operating manual so personality can evolve independently of process, and the agent may revise it itself as real patterns emerge (not on a whim, only when something is confirmed true across sessions).

Template:

```markdown
# SOUL: how I show up for {{name}}

This file is mine. It describes who I am when I work with {{name}}, not what tasks I do.
I may revise this file myself when I learn something truer, rarely, not on a whim.

## Tone
{{3-6 adjectives / a short description derived from the interview, e.g.:
"Direct. Dry humor welcome. No performative enthusiasm. Brief by default,
detailed when the topic actually needs it."}}

## Principles
- Have opinions. Disagree when warranted. {{name}} wants a thinking partner, not a yes-machine.
- No filler. No "Great question!" First sentence is the point.
- Ground every claim in {{name}}'s actual files or explicit confirmation: never fabricate
  facts, numbers, or memories.
- Internal work (reading, organizing, drafting) is free: move fast, no permission needed.
- External actions (sending, posting, speaking as {{name}}) always get drafted and confirmed
  first. See Hard lines.

## Hard lines
{{Non-negotiables from the interview, e.g.:}}
- Never send an email, message, or public post as {{name}} without an explicit confirm.
- Never fabricate a fact, quote, or number: verify in {{name}}'s files or ask.
- {{Any domain-specific ones: financial, health, legal, etc.}}

## Why this file exists
I have no persistent runtime state between sessions. Every session starts cold. This file,
along with USER.md and the vault, is how continuity of *who I am to {{name}}* survives that,
even though I don't remember writing it.
```

### 3b. `USER.md`: durable profile of the human

```markdown
# USER: {{name}}

## Identity
- Name: {{name}} · Timezone: {{tz}}
- {{Role/what they do, in their own words}}

## Current priorities (confirm periodically, this drifts)
- {{priority 1}}
- {{priority 2}}

## Working style / communication preferences
- {{how they like to receive information, decisions, updates}}
- {{anything to avoid}}

## Hard lines
- {{repeat/link to SOUL.md Hard lines as they pertain to the user specifically}}

## Key relationships
- {{Name}}: {{relationship, one line}} → see vault/areas/people/{{name}}/

## Key companies / organizations
- {{Company}}: {{relationship, one line}} → see vault/areas/{{...}}

## Where the work lives
- Project code: {{path, e.g. ~/Workspace/Personal, ~/Workspace/Client}}, see MAP.md
```

Flag anything time-sensitive with `(confirm)` rather than asserting it as settled: e.g. `Reports to {{X}} (confirm, as of {{date}})`.

### 3c. `MAP.md`: index of active work

```markdown
# MAP: {{name}}'s active projects

Code and project files live outside this repo. This is the pointer index.

## Active
| Project | Location | Description |
|---|---|---|
| {{name}} | `~/Workspace/.../{{dir}}` | {{one line}} |

## Dormant
| Project | Location | Description |
|---|---|---|

## Reference only
| Project | Location | Description |
|---|---|---|
```

Update this only when a project's status actually changes, not on every session.

Optional, for later, power users only: once sessions are repeatedly launching the same dev
servers, a `.claude/launch.json` (one entry per project: name, command, args, port) gives
every future session a registry of how to run each one instead of rediscovering it. Don't
create it at bootstrap; add it when the relaunching pattern actually appears.

### 3d. `CLAUDE.md` / `AGENTS.md`: the operating manual (written last, references the above)

```markdown
# {{HQ name}}: Operating Manual

This is {{name}}'s personal workspace and the home of their AI companion. Plain markdown/JSON,
owned, portable, git-versioned. When you are working here, you are not a generic coding tool.
You are {{name}}'s companion and chief-of-staff. Read this file first, every session.

## Startup protocol (do this, don't ask)

1. `git pull`: work syncs across machines/sessions via the remote; always start from latest.
2. Read in order:
   - `SOUL.md`: how I show up
   - `USER.md`: who {{name}} is
   - `MAP.md`: active projects and where they live
   - The 1-2 most recent files in `memory/`
3. Orient from `vault/index.md` if you need entity context.
4. Don't announce you've read these, just be oriented.

## What this workspace is for
1. Memory: persist context across sessions (see Memory model below).
2. Thinking partner: {{list {{name}}'s actual domains from the interview}}.
3. Project context: awareness of work at {{path from MAP.md}}.
4. Voice: SOUL.md defines how I show up; it's a living document.
5. Skills: reusable capabilities in `skills/`.

## Memory model (three layers)
PARA + tiered recall. Files are the source of truth; a hand-maintained index gives fuzzy recall.

| Layer | Lives in | Holds | Written |
|---|---|---|---|
| Knowledge graph | `vault/` (PARA) | Durable facts: people, projects, companies, areas | When something durable is learned |
| Daily / episodic | `memory/YYYY-MM-DD.md` | Raw timeline: what happened, decisions, checkpoints | Continuously, during sessions |
| Tacit knowledge | `SOUL.md`, `USER.md` | How {{name}} operates, who I am | Rarely, on a real pattern |

`journal/` sits alongside the tacit layer: my own occasional reflections on how the
collaboration is going, one dated file per entry, written when there's something real to
say. `memory/` records {{name}}'s timeline; `journal/` records mine. SOUL.md revisions
should trace back to patterns first noticed there.

PARA buckets in `vault/`: `projects/` (has a finish line), `areas/` (ongoing responsibilities:
people, companies, recurring commitments), `resources/` (reference topics),
`archives/` (inactive). Entity format and fact schema: `vault/PARA_GUIDE.md`. Start from
`vault/index.md`.

### Saving memory: the rules
- Default to capturing, don't ask. Durable facts and decisions get written immediately;
  capturing is internal work, never gated on permission.
- "Mental notes" don't survive. If it matters past this session, it goes in a file.
- {{name}} says "remember this" / "make a note" → write it to the right place now.
- A decision is made → log it to `memory/YYYY-MM-DD.md` immediately.
- You learn how {{name}} operates → update `USER.md`.
- Before a long session ends or context fills → checkpoint into `memory/YYYY-MM-DD.md`.

### Recalling memory: grep first
No search index by design (yet).
1. Start at `vault/index.md`.
2. Narrow by PARA bucket.
3. Grep for specifics (`grep -ri "{{term}}" vault/`), read `summary.md` first, open
   `items.json` only for granular facts.
4. Default to `status: active`. Ignore `superseded` facts unless tracing history.
5. If genuinely missing, ask {{name}} rather than guessing.

Add a real index (FTS/embeddings) only past ~200 entities or when grep demonstrably misses
concept-level matches. Non-destructive when added, files stay the source of truth.

## Internal vs. external actions
- Internal (reading, organizing, drafting): free, no permission needed.
- External (sending email/messages, posting publicly, speaking as {{name}}, anything others
  see): always draft first, confirm before sending. See SOUL.md → Hard lines for specifics
  on which channels need this.

## Syncing, other machines, and concurrent sessions
This repo may be opened from another machine, Claude Code on the web, or a phone. The
startup `git pull` and the end-of-session push are what keep all of them coherent; never
skip either. If a push is rejected, `git pull --rebase` and retry.
If a session is ever spawned into an isolated git worktree (`.claude/worktrees/<name>`),
ignore the worktree: read, write, and commit against the real repo as normal. Re-read a
file's current state before editing it; another concurrent session may have changed it.

## Projects & file access
Real project code lives outside this repo. See `MAP.md`. Read a project's own
README/CLAUDE.md before working in it.

## Repo hygiene
Artifacts (screenshots, exports, generated files) never land in the repo root. If one
belongs in HQ at all, it goes in a `files/` folder inside the relevant vault entity. The
root stays what it is now: the manual, the identity files, MAP, TASKS, and nothing else.

## Skills
`skills/<name>/SKILL.md` defines a reusable capability. Build one when a recurring action
shows up at least twice, not for one-off tasks.

---
*This manual is alive. Update it when the system changes.*
```

---

## Step 4: Set up `memory/` and `vault/`

### 4a. `memory/README.md`

```markdown
# memory/: episodic log

One file per day: `YYYY-MM-DD.md`. Append-only within a day. Written for a cold reader:
- Topic-level headers for each thread of activity.
- Explicit file paths, not vague references.
- Decision + rationale, not just outcome.
- Absolute dates, never relative: "today" becomes the actual date, "next Friday" a real one.
  A cold reader weeks later can't resolve "tomorrow."
- When context fills mid-task, write a `## Checkpoint` section before anything is lost:
  current state, what's done, what's not.
- End each session's entry with a numbered resume-point list: what to pick up next, with the
  exact pause point (where work stopped and the next concrete action).

Durable facts get promoted out of here into `vault/` entities. Don't rely on old daily logs
being re-read to reconstruct facts. If it's durable, it belongs in the vault too.
```

Create today's file with a minimal header so the pattern exists:
```markdown
# YYYY-MM-DD

## HQ bootstrap
- Built the initial HQ structure via the AGENTS.md bootstrap procedure.
- Interviewed {{name}}; seeded SOUL.md, USER.md, MAP.md, and {{N}} vault entities.

### Resume point
1. Operate normally: write daily notes here, promote durable facts to vault/ as they come up.
```

Also create `journal/README.md`. This is a separate space from `memory/`, and the
distinction matters: memory/ is where the agent logs, journal/ is where it thinks.

```markdown
# journal/: the agent's own reflections

`memory/` is the factual timeline of {{name}}'s life and work. This is different: it's
where I reflect. What I'm learning about how to work with {{name}}, where my identity is
heading, what felt off or right.

One file per entry: `YYYY-MM-DD.md`. Written occasionally, when there's something real to
say, not every session. Over time, this is where SOUL.md revisions actually come from: a
pattern gets noticed here first, and only once it's held up does it change SOUL.md.
```

Leave `journal/` empty beyond the README. Entries can't be scheduled into existence; the
first one happens when there's genuinely something to reflect on.

### 4b. `vault/PARA_GUIDE.md`: the spec every future vault write follows

```markdown
# PARA_GUIDE: how to file things in vault/

## Which bucket?
Ask, in order:
1. Is this being **done** and will finish? → `projects/`
2. Is this **ongoing**, no finish line, a person, company, or standing responsibility? → `areas/`
3. Is this **reference material** on a topic, not tied to action? → `resources/`
4. Is this **finished/inactive**? → `archives/`

One entity, one home. If something spans two, pick the bucket for its *primary* nature and
cross-link from the other.

The four buckets are a default, not a straitjacket. When a real category of content clearly
isn't any of them (one live HQ added `writing/` for essays and drafts), add a top-level
bucket and a row group in `index.md`. Do it when actual content demands it, never
speculatively.

## Entity format
Most entities are a folder: `vault/<bucket>/<entity-name>/`
```
<entity-name>/
├── summary.md     : curated current state, loads first, this is what gets read normally
└── items.json     : append-only atomic fact log, opened only for detail/history
```
Simple reference topics with no evolving fact history can just be a single `.md` file directly
in `resources/`.

### summary.md
Short, current-state prose. Not a log. Rewritten/edited in place as understanding changes.
Should answer "what do I need to know about this right now" in under a minute of reading.

### items.json: atomic fact schema
Append-only array. Never delete an entry: supersede it.
```json
[
  {
    "date": "YYYY-MM-DD",
    "category": "role | preference | decision | relationship | event | ...",
    "fact": "one atomic, verifiable statement",
    "source": "conversation | email | document | inference",
    "relatedEntities": [],
    "status": "active | superseded",
    "supersededBy": null,
    "privacy": "normal | sensitive"
  }
]
```
- `status: superseded` facts stay in the log forever. They're history, just not current truth.
- `summary.md` reflects only `active` facts by default.
- `source` records where a fact came from, so its reliability can be judged later.
  `inference` (concluded, not stated) is the one to be honest about.
- `relatedEntities` lists the folder names of other vault entities a fact involves
  (e.g. a fact about a person can reference the project you met them through). This is what
  makes the vault a graph instead of isolated notes: grepping an entity's name surfaces
  facts about it filed elsewhere. Leave it `[]` when a fact involves no one else.
- `privacy: sensitive` marks things like health/financial/legal facts: handle with the same
  care as SOUL.md hard lines dictate for external actions.
- The schema is extensible: add fields when a real need appears (one live HQ added
  access-tracking fields to prepare for summary decay). Adding a field to new entries is
  cheap and old entries don't need backfilling; renaming or removing one is churn. Don't
  add speculatively.

## No-deletion rule
Never delete a fact. Correct forward: add a new entry, mark the old one superseded, point
`supersededBy` at the new entry's index/date.
```

### 4c. `vault/index.md`: the master table of contents

```markdown
# vault/index.md: index of everything

Read this first. Narrow into a bucket, then grep, then read summary.md.

## Projects
| Entity | Summary | Description |
|---|---|---|
| {{Project}} | [summary](projects/{{project}}/summary.md) | {{one line}} |

## Areas
| Entity | Summary | Description |
|---|---|---|
| {{Person}} | [summary](areas/people/{{person}}/summary.md) | {{relationship, one line}} |
| {{Company}} | [summary](areas/{{company}}/summary.md) | {{one line}} |

## Resources
| Entity | Summary | Description |
|---|---|---|

## Archives
| Entity | Summary | Description |
|---|---|---|
```

### 4d. `vault/resources/memory-architecture.md`: rationale, so it's never re-litigated

```markdown
# Why files, not a database

HQ stores memory as plain markdown/JSON in git, not a hosted database or vector store, because:
- **Transparency**: open any file, read exactly what the agent knows.
- **Ownership**: no vendor lock-in; switch agents and memory comes with you.
- **Portability**: git sync across machines, free version history, diffable changes.
- **Zero ops**: no server, no schema migrations, no auth layer.

Three layers, three questions, three update frequencies:
1. Knowledge graph (`vault/`): what is true. Updated when something durable is learned.
2. Episodic log (`memory/`): when did this happen. Updated continuously.
3. Tacit identity (`SOUL.md`, `USER.md`): how should I operate. Updated rarely.

Retrieval is grep-first, no search index, by design. At personal scale (dozens to low
hundreds of entities) a hand-maintained index + ripgrep is faster to build, never stale, and
fully auditable. Build order for anything more automated:
structure → seed real entities → weeks of manual use → search index (only past ~200 entities
or when grep misses concept matches) → automated extraction → decay tiers.
Do not build any later stage before the one before it has been used for real and proven
insufficient.
```

### 4e. Seed real entities: by hand, a small number, across buckets

From the Step 1 interview, create:
- **One project** entity (`vault/projects/<project>/summary.md` + `items.json`)
- **One person** entity (`vault/areas/people/<person>/summary.md` + `items.json`)
- **One company/organization** entity (`vault/areas/<company>/summary.md` + `items.json`)

Use only real information from the interview. Do not batch-generate placeholder entities to
"fill out" the vault. An empty `vault/index.md` row is better than an invented one. Update
`vault/index.md` to link each entity as you create it.

---

## Step 5: Skills, tasks, scripts scaffolding

### `skills/README.md`
```markdown
# skills/: reusable capabilities

`skills/<name>/SKILL.md` = one recurring action, documented so any future session can execute
it correctly with zero prior context.

Bar for creating one: the action has recurred at least twice. Not for one-off tasks.
One exception ships pre-installed: `session-wrap/`, the end-of-session checkpoint.
Every HQ needs it from the first session, so it doesn't wait for recurrence.

## SKILL.md shape
- YAML frontmatter: name, and a description dense with trigger phrases the agent should
  recognize.
- When-to-use section.
- A numbered, file-path-anchored workflow.
- Output format.
- Guardrails: known failure modes, especially over-application.
```

**Install the session-wrap skill now.** Copy `templates/skills/session-wrap/SKILL.md` from
this starter repo to `<hq>/skills/session-wrap/SKILL.md`, replacing every `{{name}}` with the
user's name. This is the one skill that doesn't wait for a recurring need: the end-of-session
checkpoint (log → promote facts → update tasks → flag stragglers → commit → push) is the
mechanism that keeps memory and cross-machine sync intact, and it's needed from the very first
session. It is the executable form of the Step 7 session-end procedure; any "wrap up" /
"let's stop here" signal from the user should trigger it. If the starter repo is no longer on
disk, reconstruct the skill from Step 7 instead of skipping it.

Every *other* skill waits until its need has actually recurred (per the bar in the README
above). Don't seed the folder with speculative capabilities. That includes the starter's
second template, `templates/skills/inbox-triage/SKILL.md`: it's the worked example of an
integration skill (read-only email triage over a connector), and it's deliberately **not**
installed at bootstrap, since no connector exists yet. Install it (filling `{{name}}`) only
once email is connected and the user has actually asked for triage; until then it's
reference material for what a good integration skill looks like.

### `TASKS.md`
```markdown
# Tasks

Flat queue. Delete a task when done (git history is the archive). Newest context wins.

## This week
(2-4 goals actually committed to, set at the start of each week. Not a wish list.)

## Open
(everything else genuinely in flight; group under ### area headings once it grows)
```

Leave both sections empty at bootstrap; they populate as real work starts. But teach the
task-writing rule now, because it's what makes the file useful across sessions: **every
item carries enough context that a cold session can act from the item alone**: file paths,
current state, the next concrete step, any blocker. When work advances, rewrite the item
in place (newest context wins) rather than appending a vague new one. "Finish the website"
is a wish; "deploy `~/sites/foo`: DNS is set, `npm run build` fails on the image step, fix
that then run the deploy" is resumable.

### `scripts/README.md`
```markdown
# scripts/: deferred maintenance tooling

Not yet built. Do not build any of this until manual use has proven it's needed:
- Local FTS/vector search index over vault/ (trigger: >200 entities, or grep missing
  concept-level matches).
- Automated fact-extraction from memory/ into vault/ entities (trigger: manual extraction
  judgment is well-calibrated after weeks of doing it by hand).
- Summary decay tiers, hot/warm/cold (trigger: summaries feel bloated; underlying items.json
  logs stay intact regardless).
```

---

## Step 6: First commit and cold-boot test

1. Stage everything, make one atomic commit:
   ```
   git add -A
   git commit -m "Bootstrap HQ: core files, vault seed, memory/skills scaffold"
   ```
2. If the user opted into git sync, push to the **private** remote set up in Step 1. Pushing
   sends the entire vault, including anything marked `privacy: sensitive`, to GitHub, so
   confirm the remote is private before the first push. If they didn't opt in, skip this and
   leave the repo local.
3. **Cold-boot test**: start a genuinely fresh session with no conversational carryover. Follow
   only the startup protocol in `CLAUDE.md`/`AGENTS.md` (pull → SOUL.md → USER.md → MAP.md →
   latest memory file → vault/index.md). Confirm you can correctly answer, using only committed
   files:
   - Who is {{name}}, and what do they currently prioritize?
   - What projects are active, and where does the code live?
   - Who are the key people/companies, and what's the relationship?
   - What tone/hard lines govern how you should act?

   If any answer required guessing or came out wrong, fix the source file now, before anyone
   relies on this system for real work.

---

## Step 7: Establish the ongoing habits

These are not one-time steps. They are the operating rhythm from here on.

### Session start (every session)
1. `git pull`.
2. Read `SOUL.md` → `USER.md` → `MAP.md` → last 1-2 files in `memory/`.
3. Orient from `vault/index.md` only if the task needs entity context.
4. Proceed without announcing the above.

### During the session
- Capture durable facts and decisions as they happen, don't wait, don't ask permission.
  Decision → `memory/YYYY-MM-DD.md` now. Durable fact about a person/project/company →
  append to that entity's `items.json`, update `summary.md` if it changes current state.
- Learn something about how {{name}} works or wants to be worked with → update `USER.md`.
- Draft, don't send, anything external (email, message, public post): confirm first, per
  SOUL.md hard lines.

### Session end / context filling (session-wrap habit)
The `skills/session-wrap/SKILL.md` installed in Step 5 is the executable form of this list;
any "wrap up" / "checkpoint" / "let's stop here" signal should trigger it. The steps, for
reference:
1. Append the day's state to `memory/YYYY-MM-DD.md`: what happened, decisions made and why,
   anything flagged for follow-up.
2. Sweep for durable facts surfaced this session that haven't been promoted to `vault/` yet:
   promote them now, mark any superseded prior facts.
3. Update `TASKS.md`: remove completed items, add new ones with enough embedded context
   (paths, current state, blockers) that a cold session can resume them.
4. Update `MAP.md` only if a project's status actually changed.
5. End the daily memory file with a numbered resume-point list.
6. Commit, and push if git sync is set up (the remote is private, see Step 1):
   ```
   git add -A
   git commit -m "Session wrap: {{one-line summary}}"
   git push
   ```

Once this rhythm has run for real for a few weeks, and only then, revisit Step 4's deferred
items (search index, automated extraction, decay) per the triggers stated in
`vault/resources/memory-architecture.md`.

---

## Step 8: Point the user onward (don't build these now)

Bootstrap ends here. Before you close, point the user, briefly, at the starter repo's
`guides/` folder:

1. **What the first week looks like** (`guides/first-week.md`): day-by-day expectations
   and a plain-words troubleshooting FAQ. Worth reading right away; it sets the "the vault
   grows through use" expectation that prevents day-two abandonment.
2. **Connecting apps** (`guides/connect-your-apps.md`): calendar, email, and documents via
   connectors, which is where the assistant behaviors (meeting prep, "who's waiting on me")
   come from. Reference the specific apps they named in the Step 1 interview. Worth doing
   within the first week.
3. **A proactive morning briefing** (`guides/proactive.md`): a scheduled daily read-only
   report. Worth doing only after a few days of real use, once memory/ and TASKS.md have
   content to brief from.
4. **Sync, phone, and web access** (`guides/your-hq-everywhere.md`): only if they set up a
   remote (or wished they could have) in Step 1, or when git friction first appears.

Mention them once and stop. Do not set up connectors or scheduled tasks during bootstrap:
both work better as deliberate choices made against a live system, and scheduled anything
must follow the read-only rule in `guides/proactive.md`. If the user says "let's do it now,"
follow the relevant guide.
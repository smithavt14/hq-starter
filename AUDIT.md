# HQ Starter — Gap Audit (2026-07-08)

**Question:** what is `hq-starter` not giving its audience?

**Audience assumption:** mixed technical comfort. The core path must work for someone who
can install Claude Code and paste commands but isn't a developer; power-user material
gets layered on top, not mixed in. The audience's real goal is to replicate what a
personal agent service (an OpenClaw-style companion) gives them — memory, proactivity,
app connections, always-there-ness — inside their own Claude Code setup.

**Benchmark:** the live HQ this starter was extracted from, after ~5 weeks of real
operation (79 vault entities, 28 daily memory files, 2 skills, a scheduled morning
standup, multi-machine sync several times a day). The live system is the proof of what
the starter's output actually grows into — and what it needed that the starter never
mentions.

---

## Verdict in one paragraph

The starter teaches the **memory system** well — arguably better than the live repo
documents it, since AGENTS.md was written with hindsight. What it barely touches is
everything that makes the result feel like a *companion* rather than a filing cabinet:
no session-wrap ritual shipped as a skill, no proactive/scheduled behavior at all, no
app integrations (email, calendar), and a single line ("git pull") standing in for the
entire multi-device story. Those four are exactly the features the audience is coming
here to replicate. Separately, the whole bootstrap assumes terminal comfort with no
on-ramp for the nervous half of the audience.

---

## What's already strong (don't touch)

- **The three-layer memory model** and its rationale doc. Clear, correct, matches what
  survived five weeks of live use.
- **Interview-first bootstrap** with the anti-placeholder rule ("an empty index row is
  better than an invented one"). The live vault's health traces directly to this.
- **Security ordering**: `.gitignore` before any file, private-remote insistence,
  `privacy` field on facts. Keep and slightly strengthen (see Gap 5).
- **The defer-tooling philosophy** (scripts/README, the build order, the ~200-entity
  index threshold). Live evidence: after 5 weeks and 79 entities, `scripts/` is still
  empty and grep-first retrieval still works. This restraint is a feature; the starter
  documents it well.
- **The cold-boot test** (Step 6). This is the single best step in the file — it's the
  only point where the user *verifies* the system works. Consider making it even more
  prominent.

---

## Gap 1 — Session hygiene is described, not shipped ⚠ highest priority

The live system's continuity hinges on one thing: the **session-wrap** skill. Pull →
log to memory/ → promote vault facts → rewrite TASKS.md with a cold resume point →
flag anything outside git (unsaved artifacts, secrets, unsent drafts) → commit → push.
Every live commit is a "Session wrap" checkpoint; it runs multiple times a day.

The starter describes this habit in prose (Step 7) but ships no skill, and its
skills/README actively tells the agent to wait: *"write one real example skill only
once a recurring need actually appears."* That rule is right for everything **except**
session-wrap — five weeks of live use prove every HQ needs it from day one, and a
nontechnical user will never reverse-engineer it from Step 7's prose. Without it, the
first forgotten push silently forks their memory across machines.

**Recommendation:** ship a generalized `skills/session-wrap/SKILL.md` template in the
starter (or have the bootstrap generate it in Step 5 from the live version, with
personal specifics templated out). Include the trigger-phrase list ("wrap up," "let's
stop here," "checkpoint"), the cold-reader principle, the rebase-and-retry push logic,
and the "flag what's outside the commit" security sweep. Keep the wait-for-recurrence
rule for all *other* skills.

Related, smaller:

- **journal/ doesn't exist in the starter.** The live system added a fourth space —
  the agent's own reflections, distinct from the factual timeline, framed as "where
  SOUL.md actually evolves from." It costs one directory and a 10-line README. Worth
  adding to Step 2/4 even though the live one has zero entries yet — the *distinction*
  (memory/ = about the user's life; journal/ = about the working relationship) is the
  valuable part, and it's subtle enough that no user will invent it.
- **TASKS.md guidance is a one-line stub.** The live file evolved a definite shape:
  a "This week" section with a small number of committed goals, an `## Open` backlog
  grouped by area, delete-when-done (git is the archive), and — most importantly —
  **context-loaded items**: every task carries file paths, current state, next concrete
  step, and blockers, so a cold session can act from the task alone. The starter should
  teach that shape in the TASKS.md stub or in the operating-manual template. This is
  learnable only by weeks of trial and error otherwise.
- **memory/ file conventions**: the live files converged on `## Checkpoint` / pause-point
  sections and "convert relative dates to absolute" as load-bearing habits. The starter's
  memory/README has the resume-point list; add these two.

## Gap 2 — Proactive / scheduled behavior: zero coverage ⚠ highest differentiator

Nothing in the starter mentions that the companion can act *unprompted*. The live
system's most companion-like feature is a **morning standup** — a scheduled task that
runs daily at 7:30 AM and produces: emails awaiting reply, today's calendar with prep,
yesterday's roundup from memory/ + git log, a prioritized docket from TASKS.md, and a
few news headlines. Read-only, never sends anything, skips empty sections.

This is precisely the "OpenClaw-replica" feature the audience wants most, and the
starter is silent on it. Notably, it lives *outside* the repo (in the user's global
Claude config as a scheduled task), which is exactly why a repo-only starter misses it
— and why users won't discover it exists.

**Recommendation:** add a **"Making it proactive"** section (a new doc or a Step 8),
layered:

- **Core path:** a morning-briefing recipe — what to include (calendar, inbox summary,
  yesterday's memory, today's TASKS.md docket), how to set it up as a Claude Code
  scheduled task / Routine, and the honest caveat from live experience: local scheduled
  tasks only fire while the app is running; true unattended automation needs a
  cloud-side mechanism (Claude Code on the web sessions, or CI like GitHub Actions).
- **Safety framing:** first automations should be **read-only**. The live system's own
  history includes the agent declining to install unattended automation without
  explicit consent — encode that as a rule: no scheduled task that *sends or posts*
  anything, ever, without a standing, written authorization in SOUL.md's hard lines.
- **Power layer:** pointers for cron-like Routines, self-check-ins, and the planned
  "heartbeat" (nightly fact-promotion from memory/ → vault/) as a later-stage
  automation per the existing build-order doc.

## Gap 3 — Integrations & skills: the "companion does things" half is missing

The starter's skills section teaches the *convention* (SKILL.md shape, when to create
one) but never says what a skill is *for* in practice, and never mentions **MCP
connectors** — which is how a nontechnical user's HQ gains eyes and hands: Gmail,
Google Calendar, Drive, Notion, messaging. In the live system, the deliberate design
is: connectors provide the raw capability, and a skill is a *documented recipe over
connectors* (e.g. "send an article to my Kindle," "check what emails need replies").
That framing appears nowhere in the starter.

**Recommendation:**

- Add a **"Connecting your apps"** doc: what MCP connectors are in plain language, how
  to add the common ones (claude.ai connectors directory / `claude mcp add`), and the
  rule that already exists in the SOUL.md template — external actions are always
  draft-and-confirm — restated here where it becomes operational.
- Ship **one worked integration-skill example** so the SKILL.md shape isn't abstract.
  A good candidate: "inbox triage" (read-only: list threads awaiting my reply, draft
  responses, never send) — it exercises a connector, respects the hard lines, and is
  useful to literally everyone. (The live writing-check skill is the other proven
  pattern, but it's calibrated to one person's voice; a generic version is a P2.)
- In the interview (Step 1), add one question: *"Which apps should your companion be
  able to see? (email, calendar, notes, …)"* — so connector setup becomes part of
  bootstrap rather than something discovered weeks later.

## Gap 4 — Multi-device & sync: one line where users need a chapter

The starter's entire multi-device story is "run `git pull`" plus "push to a private
remote." Live experience says this area carries the most hidden failure modes:

- **Conflict handling.** The live session-wrap encodes `git pull --rebase` first, and
  rebase-and-retry on rejected push. The starter never mentions what to do when two
  sessions (or two machines) both wrote memory. For a git-novice this is the moment
  the whole system "breaks."
- **Claude Code on the web / mobile.** Nothing tells the user their HQ can be opened
  from the web app or phone once it's on GitHub — which is the single easiest way to
  get the "companion in my pocket" experience the audience wants. Also nothing about
  the implications: web sessions clone fresh (so push discipline matters even more),
  and sessions may land in an isolated worktree — the live CLAUDE.md carries an
  explicit worktree escape-hatch note the starter's manual template lacks.
- **Private repo creation is the scariest step for nontechnical users** and gets one
  parenthetical (`gh repo create … --private`). It deserves a short hand-held path:
  let the agent run it, or click-through instructions for the GitHub UI, plus how to
  verify the repo is actually private.

**Recommendation:** a **"Your HQ everywhere"** doc covering: private-remote setup
(hand-held), the pull-first/push-always rhythm (enforced by the shipped session-wrap
skill from Gap 1), conflict recovery in plain language ("if push is rejected, say
'pull and rebase, then push again' — or literally ask the agent to fix it"), web/mobile
sessions, and the worktree note added to the operating-manual template.

## Gap 5 — No on-ramp for the nontechnical half of the audience

The README is well-written but assumes: you can clone a repo, you know what a terminal
is, you're comfortable with git as a concept. For "mixed — layered" positioning:

- **Add a "Never used a terminal?" quickstart** (before or alongside "How to use this
  repo"): install Claude Code (desktop app counts), open a folder, paste one sentence
  ("Read AGENTS.md and set up my HQ"), answer questions. Emphasize that the agent runs
  every git command — the user never has to.
- **A plain-language glossary sidebar**: repo, commit, push/pull, remote, MCP — five
  terms, one sentence each. That's all the git literacy the core path actually needs.
- **Set expectations for week one.** The README says "it won't be complete after setup"
  — good — but a short **"Your first week"** section would land better: day 1 bootstrap
  and cold-boot test, days 2–3 just talk to it and watch memory/ fill, end of week run
  your first session-wrap and check the vault grew. The live system's index went from
  a handful of seeded entities to 79 in five weeks purely through use; telling users
  that curve exists prevents day-2 abandonment.
- **A short troubleshooting/FAQ**: "the agent didn't read its files at session start"
  (say: *read your CLAUDE.md and follow the startup protocol*), "context filled
  mid-task" (say: *checkpoint*), "it invented a fact" (correct it; the no-deletion rule
  means supersede), "push rejected" (see Gap 4).

## Gap 6 — Smaller inconsistencies and polish

- **Fact-schema drift.** AGENTS.md's items.json schema (`date`, `category`, `fact`,
  `status`, `supersededBy`, `privacy: normal|sensitive`) differs from the live
  PARA_GUIDE (`id`, `timestamp`, `source`, `relatedEntities` wiki-links,
  `lastAccessed`/`accessCount`, `privacy: public|private|owner-only`). The starter's
  simpler schema is the right call for newcomers, but two fields from live are worth
  adopting because they're cheap now and painful to retrofit: `source` (where a fact
  came from) and `relatedEntities` (what makes the vault a graph rather than notes).
  Decide deliberately; document that the schema is extensible.
- **Bucket flexibility.** The live vault grew a `writing/` bucket beyond P-A-R-A. One
  line in PARA_GUIDE — "add a bucket when a category of content clearly isn't any of
  the four" — prevents users treating PARA as a straitjacket.
- **Repo hygiene warning.** The live repo has a stray screenshot committed at root.
  Add one line to the manual template: artifacts (images, exports, generated files) go
  in a `files/` or per-entity folder, never the repo root.
- **`.claude/launch.json` pattern** (registry of how to launch each of the user's
  projects) — a nice power-user note for MAP.md's section, P2.
- **Commit-message convention** ("Session wrap MM/DD: summary") is worth one line in
  the session-wrap skill — it makes `git log` a readable session index for free.

---

## Prioritized roadmap

> **Status 2026-07-08:** the four P0 items shipped in a first pass. Session-wrap skill:
> `templates/skills/session-wrap/SKILL.md`, installed by AGENTS.md Step 5. Proactive doc:
> `guides/proactive.md`. Connectors doc: `guides/connect-your-apps.md`. Nontechnical
> quickstart + glossary: README, plus a new AGENTS.md Step 8 pointing users at the guides.
>
> **Status 2026-07-08 (second pass):** the five P1 items shipped. Sync guide:
> `guides/your-hq-everywhere.md`, plus a "Syncing, other machines, and concurrent sessions"
> section (worktree escape hatch, re-read-before-edit) in the operating-manual template and
> a hand-held-remote pointer in Step 1. TASKS.md format guidance: Step 5 template now
> teaches This-week/Open, delete-when-done, and context-loaded items. journal/ layer: Step 2
> tree, Step 4a README template, and a note in the manual template's memory model. Interview
> addition: "Apps & connectors" block in Step 1, referenced by Step 8. First-week +
> troubleshooting FAQ: `guides/first-week.md`, linked first from the README's After-setup
> section. Remaining open items are the P2 row.

| P | Item | Dimension | Effort |
|---|---|---|---|
| **P0** | Ship generalized `session-wrap` skill in the starter | Session hygiene, sync | S |
| **P0** | "Making it proactive" doc: morning briefing + read-only safety rule | Proactive | M |
| **P0** | "Connecting your apps" doc: MCP connectors in plain language | Integrations | M |
| **P0** | Nontechnical quickstart + glossary in README | On-ramp | S |
| **P1** | "Your HQ everywhere" doc: private repo hand-holding, conflicts, web/mobile, worktree note | Sync | M |
| **P1** | TASKS.md format guidance (context-loaded items, This-week/Open/delete-when-done) | Session hygiene | S |
| **P1** | Add `journal/` layer to structure + docs | Memory | S |
| **P1** | Interview additions: "which apps should I see?" | Integrations | XS |
| **P1** | "Your first week" expectations + troubleshooting FAQ | On-ramp | S |
| **P2** | Worked integration-skill example (read-only inbox triage) | Integrations | M |
| **P2** | Schema polish: add `source` + `relatedEntities`; extensibility note | Memory | S |
| **P2** | memory/ checkpoint conventions; bucket flexibility; artifact hygiene; launch.json note | Polish | S |

## What NOT to add (explicit non-goals)

- **No search index, extraction scripts, or decay tooling in the starter.** Live
  evidence confirms the defer-until-proven rule works; shipping tooling would invert
  the starter's best design decision.
- **No pre-built vault entities or example people/projects.** The anti-placeholder rule
  is load-bearing.
- **No write-capable automations by default.** Proactive features ship read-only; the
  user opts into anything that sends.
- **No hosted anything.** The "it's a folder you control" property is the product.

# HQ

HQ is a file-based personal memory system for a coding agent, Claude Code, Codex, or anything similar. Point the agent at this repo, answer some questions about yourself, and you get an agent that remembers who you are, what you're working on, and how you like to work, across sessions, without a database, a hosted service, or an app to maintain.

Under the hood it's just markdown and JSON files in a git repo.

## Contents

Three ways in, depending on who you are:

- **"Just set me up."** Go straight to [Quick start](#quick-start). It's one pasted prompt, and it's written so that someone who has never opened a terminal can follow it.
- **"Convince me first."** Read [What this gets you](#what-this-gets-you), and if you're weighing HQ against something specific (Obsidian, ChatGPT's memory, OpenClaw, Hermes), see [guides/comparisons.md](guides/comparisons.md). The reasoning behind the design is in [How it works](#how-it-works).
- **"I already set it up."** Head to [After setup](#after-setup) for the first-week guide and the upgrades: apps, proactivity, phone access.

All sections:

1. [What this gets you](#what-this-gets-you): why bother, in terms of things you can actually ask for
2. [Quick start](#quick-start): three steps, one pasted prompt
   - [If you've never used a terminal](#if-youve-never-used-a-terminal): reassurance and a five-term glossary
3. [What setup creates](#what-setup-creates): the folder you end up with, file by file
4. [After setup](#after-setup): the guides, from first week to apps, proactivity, and phone access
5. [How it works](#how-it-works): the three-layer design and why it's files instead of a database
6. [Honest caveats](#honest-caveats): what this is not

## What this gets you

A regular Claude or ChatGPT conversation starts over every time, and the built-in "memory" features hold a short list of facts that the vendor's system decides to keep. An HQ changes what you can actually ask for:

- **"What's on my plate today?"** answered from your real task list, your calendar, and yesterday's notes, not from you re-explaining your life at the top of every chat.
- **"What did we decide about the pricing page last month, and why?"** answered from a written decision log, with the reasoning.
- **"Prep me for my 2pm with Dana."** Calendar entry + who Dana is + where things left off, pulled together without you assembling it.
- **Drafts in your voice, with context.** An email to a client it already knows, informed by the history of that relationship, not a generic template.
- **Pick up cold, weeks later.** Open a session after a month away and the agent knows where every project stopped and what the next step was.
- **It compounds.** Every session leaves the files a little richer, and anything you ask for twice can become a repeatable skill. A chat, by contrast, is worth the same on day 300 as on day 1.

The one-line version: a chatbot is a very good conversation; this is a very good colleague. Chat memory is a feature the vendor runs; this is a system you can read, correct, and take with you.

Comparing it to something specific you already use or have heard of? [guides/comparisons.md](guides/comparisons.md) takes the alternatives one at a time (bare Claude Code, app memory, Obsidian, OpenClaw, Hermes, and more), honestly, including what each does better.

## Quick start

No cloning or downloading required. The whole setup is: open your agent, turn on auto mode, paste one prompt.

1. **Open Claude Code or Cowork** (Codex and others work too; any agent that can read URLs and write files).
2. **Turn on auto mode first.** The setup creates a few dozen files, and without auto mode you'll be asked to approve every single one. Each prompt looks scarier than it is, and denying them breaks the flow. In Claude Code, press Shift+Tab until the mode line says edits are auto-accepted; in Cowork, choose the "always allow" style option when the first permission prompt appears. You can turn it back off the moment setup is done.
3. **Paste this** (swap in your fork's URL if you forked):

   > Set up my HQ: a private, file-based memory system for you and me, in a new folder at ~/hq. The instructions live in the repo at https://github.com/smithavt14/hq-starter. Fetch and read https://raw.githubusercontent.com/smithavt14/hq-starter/main/AGENTS.md and follow it start to finish. When it references template files in the starter repo (templates/...), fetch those from the same repo. Interview me before writing anything, exactly as the instructions say.

4. **Answer its questions.** Short, direct things: your name, timezone, what you're working on, how you like to be talked to, anything off-limits, a few people or projects worth knowing upfront.

   *Already use Claude (or ChatGPT) with memory turned on?* There's a shortcut: ask the setup agent to "give me the full interview as one block of questions I can paste elsewhere," paste that block into the chat that already knows you, then paste its answers back. You'll confirm and correct rather than typing your life story from scratch. The setup agent knows to treat those answers as drafts, since another assistant's memory of you can be stale or wrong.

5. It scaffolds the rest: an identity file, a user profile, a project map, an empty vault ready for real entities, and a first commit.

That's it. No config file to hand-edit first, no accounts to create. The interview is intentionally short. These files are meant to be corrected over time, not gotten right on day one.

(The traditional route still works if you prefer it: clone or download this repo, open the folder in your agent, and say "Read AGENTS.md and set up my HQ.")

### If you've never used a terminal

You don't need to be a developer for any of this, and you never have to touch a raw terminal window: the [Claude Code](https://claude.com/claude-code) desktop app or Cowork counts. Install it, do the steps above, and the agent does every technical step itself: creating folders, writing files, running git. Your job is answering questions about your life, and saying yes or no. If anything ever looks broken, describe what you see in plain words ("it says the push was rejected") and ask the agent to fix it. That is a normal and correct way to operate this system, not a workaround.

Five terms you'll see, so nothing reads as magic:

- **Repo**: a folder whose entire history is tracked. Your HQ is one.
- **Commit**: a saved snapshot of that folder, with a note about what changed.
- **Push / pull**: send your snapshots to an online copy / fetch snapshots made elsewhere. This is how your HQ syncs across machines.
- **Remote**: that online copy, typically a *private* GitHub repository. (No GitHub account? You don't need one to set up; you'll want a free one later for backup and phone access. [guides/your-hq-everywhere.md](guides/your-hq-everywhere.md) explains what GitHub is and walks through the two-minute signup.)
- **Connector (MCP)**: a plug that lets the agent see one of your apps, like email or calendar. See [guides/connect-your-apps.md](guides/connect-your-apps.md).

## What setup creates

A git repo that looks roughly like this:

```
AGENTS.md          : operating manual the agent reads first, every session
SOUL.md             : the agent's voice and hard limits, living, agent-editable
USER.md             : who you are, corrected over time, not written once
MAP.md              : where your actual project code lives
vault/              : durable facts about people, projects, companies, areas of life
memory/             : one file per day, a raw timeline of what happened
journal/            : the agent's own occasional reflections, where its voice evolves from
skills/             : reusable recipes for things you ask the agent to do repeatedly
                      (a session-wrap checkpoint skill is installed from day one)
TASKS.md            : what's actually in flight right now
```

Start a new session cold, weeks later, with no conversation history, and the agent should still know who you are, what you're mid-project on, and how you like to work, because it read the files instead of relying on you to re-explain.

It won't be complete after setup. The vault starts with a handful of real entities, not your whole life pre-loaded. You build it out by using the thing, the same way you'd build out any notes system. That's on purpose. Guessing your whole world upfront produces plausible-sounding filler; using it for real produces facts you actually meant to record.

## After setup

Each guide is written in plain language and marked with when to read it:

| Guide | What it covers | When to read it |
|---|---|---|
| [Your first week](guides/first-week.md) | Day-by-day expectations, how to tell it's working, plain-words fixes for everything that commonly looks broken | Right after setup |
| [Connect your apps](guides/connect-your-apps.md) | Calendar, email, and documents via connectors, and the rule that keeps it safe (seeing is free, acting needs your confirmation) | Within the first week |
| [Make it proactive](guides/proactive.md) | A daily morning briefing, how to schedule it, its honest limits, and the read-only rule for anything scheduled | After a few days of real use |
| [Your HQ everywhere](guides/your-hq-everywhere.md) | What GitHub is, the private remote, the pull/push rhythm, what to say when git complains, web and phone access | When you want backup or phone access, or when git first complains |
| [Comparisons](guides/comparisons.md) | HQ against Obsidian, app memory, OpenClaw, Hermes, bare Claude Code, and the rest | Anytime, especially before committing |

None of these are required. They're where the "companion" part starts to show.

## How it works

Coding agents are already good at one thing: reading and writing files. So instead of bolting on a memory feature (a vector store, a hosted API, a "memory" toggle you have to trust), HQ just uses the agent's native strength. Your memory lives as plain text you can open in any editor, `grep`, diff, and read yourself, which means it inherits everything plain files are already good at:

- **You can read it.** Nothing is stored in a format only the agent can query. Open any file and you see exactly what it "knows" about you.
- **You own it.** Switch from Claude Code to Codex, or to whatever comes next, and your memory comes with you. No export, no migration.
- **It's versioned for free.** Every fact ever written has a git history. Bad edit? Roll it back. Want to know when you decided something? `git log` it.
- **There's nothing to run.** No server, no schema, no auth layer, no bill. It's a folder.

The tradeoff is that it doesn't scale to a team, and it's not trying to. This is a memory system for one person and their agent.

Inside the folder, memory splits into three layers because they answer three different questions and change at three different speeds:

1. **A knowledge graph** (`vault/`): durable facts about people, projects, companies, and areas of your life, organized PARA-style. Answers "what's true." Updated when something durable is learned.
2. **A daily log** (`memory/YYYY-MM-DD.md`): a raw timeline of what happened in each session. Answers "when did this happen." Updated continuously.
3. **Identity files** (an agent voice/behavior file, a user profile file): answer "how should the agent operate, and who is it operating for." Updated rarely, only when a real pattern shows up.

Retrieval is deliberately grep-first: one index file (`vault/index.md`) pointing to entity folders, then `grep` for specifics. No embeddings, no search infra. At the scale of one person's life, a well-organized set of files beats a search index that can go stale or return confidently wrong results. Wire up real search later if you ever actually need it. The full reasoning is in `vault/resources/memory-architecture.md`, seeded when you set up.

Everything else in the repo (the operating manual, the task list, the skills convention) exists to keep those three layers accurate and cheap to read, session after session, for an agent that starts every session with no memory of the last one.

## Honest caveats

- This is a personal tool, not a product. There's no support contract, no roadmap promise, no guarantee it fits how you work.
- It assumes you're comfortable with your agent reading and writing files on your machine, and with git as your backup and sync mechanism.
- It's opinionated about structure (PARA folders, a specific fact schema, grep-first retrieval). If you want something looser or stricter, fork it and change the rules in `AGENTS.md`. The whole point is that you own it.
- Nothing here is private by any mechanism stronger than "it's a folder you control." Don't put anything in it you wouldn't want in a git repo.

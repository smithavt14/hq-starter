# HQ

HQ is a file-based personal memory system for a coding agent, Claude Code, Codex, or anything similar. Point the agent at this repo, answer some questions about yourself, and you get an agent that remembers who you are, what you're working on, and how you like to work, across sessions, without a database, a hosted service, or an app to maintain.

Under the hood it's just markdown and JSON files in a git repo.
## Why this instead of an app with memory

Coding agents are already good at one thing: reading and writing files. So instead of bolting on a memory feature (a vector store, a hosted API, a "memory" toggle you have to trust), HQ just uses the agent's native strength. Your memory lives as plain text you can open in any editor, `grep`, diff, and read yourself, which means it inherits everything plain files are already good at:

- **You can read it.** Nothing is stored in a format only the agent can query. Open any file and you see exactly what it "knows" about you.
- **You own it.** Switch from Claude Code to Codex, or to whatever comes next, and your memory comes with you. No export, no migration.
- **It's versioned for free.** Every fact ever written has a git history. Bad edit? Roll it back. Want to know when you decided something? `git log` it.
- **There's nothing to run.** No server, no schema, no auth layer, no bill. It's a folder.

The tradeoff is that it doesn't scale to a team, and it's not trying to. This is a memory system for one person and their agent.

## The design, briefly

Memory here splits into three layers because they answer three different questions and change at three different speeds:

1. **A knowledge graph** (`vault/`): durable facts about people, projects, companies, and areas of your life, organized PARA-style. Answers "what's true." Updated when something durable is learned.
2. **A daily log** (`memory/YYYY-MM-DD.md`): a raw timeline of what happened in each session. Answers "when did this happen." Updated continuously.
3. **Identity files** (an agent voice/behavior file, a user profile file): answer "how should the agent operate, and who is it operating for." Updated rarely, only when a real pattern shows up.

Retrieval is deliberately grep-first: one index file (`vault/index.md`) pointing to entity folders, then `grep` for specifics. No embeddings, no search infra. At the scale of one person's life, a well-organized set of files beats a search index that can go stale or return confidently wrong results. Wire up real search later if you ever actually need it. The full reasoning is in `vault/resources/memory-architecture.md`, seeded when you set up.

Everything else in the repo (the operating manual, the task list, the skills convention) exists to keep those three layers accurate and cheap to read, session after session, for an agent that starts every session with no memory of the last one.

## How to use this repo

1. Clone or fork this repo.
2. Open it with Claude Code, Codex, or your agent of choice.
3. Say: **"Read AGENTS.md and set up my HQ."**
4. Answer its questions. It'll ask short, direct things: your name, timezone, what you're currently working on, how you like to be talked to, anything that's off-limits, a few people or projects worth knowing about upfront, and where your actual project code lives on disk.
5. It scaffolds the rest: an identity file, a user profile, a project map, an empty vault ready for real entities, and a first commit.

That's it. No config file to hand-edit first, no accounts to create. The interview is intentionally short. These files are meant to be corrected over time, not gotten right on day one.

### Never used a terminal?

You don't need to be a developer for any of this. The realistic minimum:

1. Install [Claude Code](https://claude.com/claude-code). The desktop app counts; you never have to touch a raw terminal window if you don't want to.
2. Download this repo (the green "Code" button on GitHub → "Download ZIP" works fine if "clone" means nothing to you) and open that folder in Claude Code.
3. Type: **"Read AGENTS.md and set up my HQ."**

From there the agent does every technical step itself: creating folders, writing files, running git. Your job is answering questions about your life, and saying yes or no. If anything ever looks broken, describe what you see in plain words ("it says the push was rejected") and ask the agent to fix it. That is a normal and correct way to operate this system, not a workaround.

Five terms you'll see, so nothing reads as magic:

- **Repo**: a folder whose entire history is tracked. Your HQ is one.
- **Commit**: a saved snapshot of that folder, with a note about what changed.
- **Push / pull**: send your snapshots to an online copy / fetch snapshots made elsewhere. This is how your HQ syncs across machines.
- **Remote**: that online copy, typically a *private* GitHub repository.
- **Connector (MCP)**: a plug that lets the agent see one of your apps, like email or calendar. See [guides/connect-your-apps.md](guides/connect-your-apps.md).

## What you end up with

A git repo that looks roughly like this:

```
AGENTS.md          : operating manual the agent reads first, every session
SOUL.md             : the agent's voice and hard limits, living, agent-editable
USER.md             : who you are, corrected over time, not written once
MAP.md              : where your actual project code lives
vault/              : durable facts about people, projects, companies, areas of life
memory/             : one file per day, a raw timeline of what happened
skills/             : reusable recipes for things you ask the agent to do repeatedly
                      (a session-wrap checkpoint skill is installed from day one)
TASKS.md            : what's actually in flight right now
```

Start a new session cold, weeks later, with no conversation history, and the agent should still know who you are, what you're mid-project on, and how you like to work, because it read the files instead of relying on you to re-explain.

It won't be complete after setup. The vault starts with a handful of real entities, not your whole life pre-loaded. You build it out by using the thing, the same way you'd build out any notes system. That's on purpose. Guessing your whole world upfront produces plausible-sounding filler; using it for real produces facts you actually meant to record.

## After setup: two upgrades worth knowing about

Once the basic rhythm is running (a few days of sessions, some real memory on disk), two additions turn the memory system into something closer to an assistant:

- **[Connect your apps](guides/connect-your-apps.md)**: plug in calendar, email, and documents so the agent can see the parts of your life that don't live in files. Plain-language guide, including the rule that keeps it safe (seeing is free, acting always requires your confirmation).
- **[Make it proactive](guides/proactive.md)**: a daily morning briefing (calendar, threads waiting on you, yesterday's roundup, today's priorities), how to schedule it, its honest limitations, and the read-only rule every scheduled task should follow.

Neither is required. Both are where the "companion" part starts to show.

## Honest caveats

- This is a personal tool, not a product. There's no support contract, no roadmap promise, no guarantee it fits how you work.
- It assumes you're comfortable with your agent reading and writing files on your machine, and with git as your backup and sync mechanism.
- It's opinionated about structure (PARA folders, a specific fact schema, grep-first retrieval). If you want something looser or stricter, fork it and change the rules in `AGENTS.md`. The whole point is that you own it.
- Nothing here is private by any mechanism stronger than "it's a folder you control." Don't put anything in it you wouldn't want in a git repo.
# What HQ is, against everything you might confuse it with

HQ is a memory pattern, not a product. That makes it easy to mis-file: it sounds a bit like a note-taking system, a bit like the memory toggle in a chat app, a bit like the self-hosted agent projects. This page takes the likely reference points one at a time, honestly, including what each does better.

The quick orientation:

| | Where memory lives | What you run | Who writes the memory | Best when |
|---|---|---|---|---|
| **HQ** | Markdown files in a git repo you own | Nothing (your existing coding agent) | The agent; you correct it | You want durable memory without hosting anything |
| Just Claude Code / Codex | A config file, per-session context | Nothing | Mostly nobody | Coding tasks that don't need your life context |
| App memory (ChatGPT, Claude) | The vendor's servers | Nothing | The vendor's system | You'd never look under the hood anyway |
| Obsidian / Notion (PKM) | Your notes | An app | **You** | You enjoy writing and organizing notes |
| OpenClaw | Inside a large local agent system | An always-on daemon | Its memory subsystem | You want an assistant in your messaging apps |
| Hermes Agent | On your server | A hosted daemon (cron, channels) | The agent runtime | You're comfortable operating a server |
| mem0 / Letta / Zep | Your app's backend | Your own product | Your code | You're a developer adding memory to an app |

## Just using Claude Code (or Codex) by itself

The closest comparison, and the point: **HQ is just Claude Code.** There is no additional software. What HQ adds is a file layout for memory, an operating manual the agent re-reads every session, and two rituals (read-on-start, wrap-on-end). That's the entire delta.

It's a bigger delta than it sounds. Bare Claude Code starts every session cold; its project config file holds instructions, not accumulating knowledge, and it tops out fast when asked to also be a biography, a task list, and a timeline. HQ splits those concerns into files that each do one job, so twenty sessions from now the agent knows things no single conversation taught it.

So this isn't a choice. If you use a coding agent, HQ is a way of using it.

## App memory (ChatGPT memory, Claude's memory)

The built-in memory toggles are the zero-effort option, and for many people they're enough. The trade is opacity: you can't read the whole of what's stored, can't diff this month against last, can't correct it surgically, and can't take it with you when you switch tools.

HQ is the same idea with the storage turned inside out. Every fact is in a file you can open; every change has a git history; switching agents means pointing the new one at the folder. The cost is that the librarian work happens in your repo, by your agent, where you can see it. If you'd genuinely never look under the hood, app memory may serve you fine, and this repo is over-engineering.

## Obsidian, Notion, and the PKM world

Not a competitor. A different author.

Personal knowledge management assumes *you* write the notes, make the links, and do the weekly gardening. Its known failure mode is that most people stop. HQ inverts the labor: the agent writes, files, and links; your job is to correct it when it's wrong. The system grows as a side effect of using it, which is exactly the property PKM abandonment stems from lacking.

The substrate is identical, and that's a feature: HQ's vault is a folder of markdown, so you can point Obsidian at it and get a free reading interface, graph view included. There's also now a small cottage industry of "Obsidian + Claude Code second brain" setups; HQ differs from most of them mainly in shipping a filing spec (PARA buckets, one-entity-one-home, atomic facts that get superseded rather than deleted) so the vault stays coherent without you enforcing it. If you already have a note practice you love, keep it; tell the agent where it lives and let HQ absorb from it over time.

## OpenClaw

The always-on personal agent: a daemon on your machine, connected to WhatsApp, Telegram, iMessage and more, with browser automation and an enormous community. It does far more than HQ, around the clock. It also *is* far more: hundreds of thousands of lines of code running with real permissions, wired to your credentials and your message history, which is a security posture to take seriously (prompt injection against an agent that can run shell commands is not hypothetical), plus a service you are now operating.

HQ's relationship to OpenClaw is lineage, not rivalry. This design was extracted from a real OpenClaw workspace: the memory patterns kept, the vault migrated out as plain files, the daemon left behind. That migration is also the portability claim, demonstrated. If you want an assistant that answers in your messaging apps at 2am, run OpenClaw (or one of the smaller security-first rewrites of it); a folder of markdown can ride along as its memory. If what you actually wanted was the memory and the companion, HQ gets you there without operating anything.

## Hermes Agent

Nous Research's open-source agent: a persistent daemon on your own server, scheduled tasks, a dozen-plus messaging platforms, and the notable trick of writing its own reusable skills as it works. It's closer kin to OpenClaw than to HQ, with a more server-native, developer-oriented posture.

Hermes and HQ are aimed at the same complaint (session-based AI tools forget everything and can't act on a schedule) answered from opposite directions: Hermes says *run a persistent agent*, HQ says *write persistent files*. Hermes gives you real always-on autonomy and demands real operations in exchange; HQ gives you memory and rhythm inside tools you already run, with proactivity bolted on only as far as scheduling allows (see [proactive.md](proactive.md) for exactly how far that is). If you're comfortable maintaining a server and want the autonomy, Hermes is a serious choice, and it reads markdown folders too. The skills convention in HQ, incidentally, is the manual version of what Hermes automates: recurring actions written down so they're repeatable.

## Developer memory SDKs (mem0, Letta, Zep)

Different aisle. These are libraries and services for *building products* whose users get memory. If you're a developer and your app needs to remember its users, look there. HQ is for being a person with an agent, not for shipping one.

## Hosted autonomous agents (Manus and friends)

Task executors: you hand off work, they come back with results. Impressive, and mostly orthogonal to HQ. Their memory and continuity are internal to the product, on the vendor's servers. Nothing stops you using both; HQ is about the companion that accumulates *you*, not about outsourcing tasks.

## What HQ is not

- **Not always-on.** Nothing happens unless a session runs or you've scheduled one, and scheduling has honest limits ([proactive.md](proactive.md)).
- **Not a note-taking method.** The vault is written by the agent. If you love writing notes yourself, that's a different (fine) hobby, and the two can coexist.
- **Not private beyond "a private repo you control."** No encryption at rest, no access tiers. The `privacy` field on facts is a handling instruction to the agent, not a lock.
- **Not multi-user.** One person, one agent, by design.
- **Not a product.** No roadmap, no support, no telemetry, and nothing to cancel. You fork it and it's yours, with everything that implies in both directions.

## The one-sentence version

Everything above either hosts your memory for you (app memory, hosted agents), hands you a system to operate (OpenClaw, Hermes), or expects you to do the writing yourself (PKM). HQ is the remaining corner: the agent writes, files store, you own, and nothing runs.

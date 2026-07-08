# Making your HQ proactive

Everything in the bootstrap happens when you start a session: you show up, the agent reads its files, you work. A companion gets noticeably more useful when it also shows up on its own. This guide covers the first and best version of that, a **morning briefing**, plus the safety rule that governs everything scheduled.

Read this after your HQ has been running for a few days, not on day one. A briefing built on an empty memory/ and an empty task list has nothing to brief.

## The morning briefing

One scheduled run, early each day, that leaves a short report waiting for you. A good one includes, in this order:

1. **Today's calendar**, with a line of prep for anything that needs it *(requires a connected calendar, see [connect-your-apps.md](connect-your-apps.md))*.
2. **Emails waiting on a reply from you**, at the thread level, not a full inbox dump *(requires connected email)*.
3. **Yesterday's roundup**: what happened, pulled from `memory/` and the HQ git log.
4. **Today's docket**: a recommended priority order pulled from `TASKS.md`.
5. Optionally, **3 to 5 headlines** on topics you care about, via web search.

Two rules make it pleasant instead of noisy: skip any section that's empty, and keep the whole thing readable in under two minutes.

### Setting it up

Tell your agent, in a session inside your HQ:

> Set up a daily morning briefing for me at 7:30. It should be strictly read-only. Include: my calendar for today with prep notes, email threads waiting on my reply, a roundup of yesterday from memory/ and the git log, and a prioritized docket from TASKS.md. Skip empty sections. Never send, reply to, or modify anything.

The agent will create it as a scheduled task or routine in your Claude setup. If you haven't connected email or calendar yet, it will still work with what it has (memory, git log, tasks); connect the rest later and ask it to add those sections.

### The honest caveat

A task scheduled on your machine only fires while the Claude app is actually running there. If your laptop is asleep at 7:30, no briefing. Your options, in increasing order of effort:

- **Don't schedule it at all.** Save the briefing as a skill and just say "morning briefing" when you sit down. You lose nothing except the ceremony of it being pre-generated, and it always works. This is the right starting point for most people.
- **Accept the limitation.** If your machine is usually awake and the app usually open, local scheduling is fine.
- **Move it to the cloud.** If your HQ is synced to GitHub, Claude Code on the web can run sessions (and scheduled routines) server-side, machine asleep or not. This is the "it just appears every morning" experience, and it's the strongest reason to set up the private git remote from the bootstrap.

## The safety rule: read-only first

Your first automations should only **read and summarize**. Nothing that runs on a schedule should send, reply, post, delete, or spend, unless you have personally written a standing authorization for that exact action into `SOUL.md`'s hard lines.

The reasoning: when you're in a session, the draft-and-confirm rule protects you, because you're there to confirm. A scheduled task runs while you're not there. "The agent replies to routine emails for me every morning" might eventually be a fine choice, but it's a choice to make awake and in writing, never a default, and never something the agent should offer to enable in passing.

A good hard line to add to `SOUL.md` when you set up your first scheduled task:

> Scheduled/unattended runs are read-only. They may read anything and write only to memory/. Any external action (send, post, reply, delete, purchase) requires me, live, in a session.

## Later, once the rhythm is real

Things worth adding after weeks of use, not days. Each follows the same build-order philosophy as the rest of HQ: do it manually until the manual version proves what the automated one should do.

- **A weekly review.** End of week, the agent drafts a summary of the week from memory/ and proposes next week's "This week" section in `TASKS.md`. You edit, it commits.
- **The heartbeat.** A nightly pass that promotes durable facts from memory/ into vault/ entities. Deferred on purpose: doing this by hand inside the session-wrap ritual is what teaches you (and the agent) what "durable" means for you. Automate it only when your manual judgment is consistent, per `vault/resources/memory-architecture.md`.
- **Self check-ins.** For long-running work, the agent schedules its own reminder to re-check something later (a deploy, an inbox, a deadline) instead of you remembering to ask.

# Connecting your apps

Out of the box, your HQ agent can read and write its own files. That's the memory. The companion part arrives when it can also see the apps your life actually runs through: email, calendar, documents, notes. This guide is the plain-language version of how that works.

## What a connector is

A **connector** (the technical name is an MCP server) is a plug between your agent and one of your apps. Connect Gmail and the agent can search and read your email. Connect Google Calendar and it can see your schedule. Each connection is something you approve once, through the app's own sign-in screen, and can disconnect whenever you want. The agent never learns your password; it gets a revocable permission slip.

No connectors is a perfectly valid way to run HQ. But most of what people want from a "personal assistant" (what's on today, who's waiting on me, prep me for this meeting) needs at least the first two below.

## Which to connect, in order of payoff

1. **Calendar.** Immediately makes "what does my day look like" and meeting prep possible.
2. **Email.** Unlocks the single most-wanted assistant feature: "which threads are waiting on a reply from me?"
3. **Documents/notes** (Google Drive, Notion, etc.). Lets the agent pull real context when you're working on something instead of asking you to paste it.

Everything else (project tools, messaging, music, fitness apps) can wait until a real need shows up. Connecting ten apps on day one just adds noise.

## How to connect

The easy path: **ask your agent.** In a session, say "help me connect my Gmail and calendar." It will point you at the right place for your setup, typically the Connectors section of the Claude app's settings (or claude.ai/settings), where connecting is a couple of clicks and a sign-in.

The power-user path: Claude Code can also add connectors from the command line (`claude mcp add`), including community-built ones for niche apps. If that sentence means nothing to you, you don't need it; the settings screen covers the common cases.

## The rule that makes this safe

**Seeing is free. Acting is gated.**

Your `SOUL.md` already carries this as a hard line from the bootstrap interview, and connectors are exactly where it earns its keep:

- The agent may **read** freely: search email, check the calendar, open documents. That's internal work, same as reading its own files.
- The agent never **acts** externally without you: no sending email, no accepting invites, no editing shared documents, no posting, until it has shown you exactly what it's about to do and you've said yes.

If you ever want to loosen this for a specific case ("you can accept calendar invites from my team without asking"), write that exception into `SOUL.md`'s hard lines yourself, narrowly. Never loosen it in general, and be extra strict about anything that runs on a schedule (see [proactive.md](proactive.md)).

## Connectors and skills

A connector is a capability; a **skill** is a written recipe for using it the same way every time. The first one most people end up wanting is inbox triage: "go through my email, list the threads waiting on me, draft replies for the routine ones, send nothing." Once you've asked for something like that twice, have the agent write it down as `skills/inbox-triage/SKILL.md` per your skills/README, and from then on "do my email" means the same reliable thing in every session.

That's the pattern for every app you connect: use it conversationally first, and when a request becomes a repeat, make it a skill.

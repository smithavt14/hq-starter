# Your first week

The bootstrap leaves you with a skeleton: identity files, a handful of real vault entities, an empty task list. What turns it into a second brain is nothing more exotic than using it. This is what the first week should look like, and how to tell it's working.

For calibration: one real HQ went from a handful of seeded entities to about eighty in five weeks, purely through normal use. Nobody sat down and "filled in" the vault. If yours feels thin on day two, that isn't failure, it's the starting line.

## Day 0: bootstrap and the cold-boot test

Run the setup (`"Read AGENTS.md and set up my HQ"`), answer the interview, and don't skip the cold-boot test at the end: a fresh session, no history, that has to answer who you are, what you're working on, and how it should behave, from files alone. If it stumbles, fix the file it stumbled on now.

## Days 1–2: just talk to it

Use it for real things: think through a decision, draft something, plan your week. Don't perform "memory testing"; just work. Two things to watch:

- **`memory/` should be filling up.** After each session, glance at today's file. If a decision you made isn't in there, say "log that to memory" and, if it keeps happening, "capturing should be automatic; check the operating manual."
- **Correct the identity files early.** When a reply's tone is off or a fact about you is wrong, say so plainly ("too formal," "I don't work there anymore"). Those corrections land in `SOUL.md`/`USER.md` and compound; the first week is when most of them happen.

## Days 3–4: close the loop

- **End a session with "wrap up."** Watch what the session-wrap skill produces: memory logged, tasks updated, a resume point, a push. Then open a fresh session and see it pick up exactly where you left off. This loop is the whole system; once you've seen it work, you'll trust it enough to rely on it.
- **Connect calendar and email** if you haven't ([connect-your-apps.md](connect-your-apps.md)). This is the point where "what's my day look like" starts working.
- **Put real tasks in `TASKS.md`.** Not a life backlog; the three or four things actually in flight this week.

## Days 5–7: notice the patterns

- **Vault check.** Ask: "what's in the vault so far?" People and projects you've talked about should be showing up as entities. If someone you've mentioned repeatedly isn't there, say "make a vault entry for them."
- **First skill.** If you've asked for the same kind of thing twice ("summarize this article," "prep me for this meeting"), have the agent write it down as a skill so it's repeatable.
- **Maybe a briefing.** With a few days of memory and a connected calendar, the morning briefing from [proactive.md](proactive.md) has something to say. Before that it doesn't.

**How to tell it's working:** start a session and ask about something from three days ago without re-explaining anything. If the answer comes from the files, correctly, the system works. That's the entire test.

## When something looks broken

None of these need technical intervention; each has a plain-words fix.

**It started the session cold, like it doesn't know me.**
It skipped its startup reading. Say: "Read CLAUDE.md and follow the startup protocol." If it recurs, ask it to check that the operating manual is in the repo root where the agent actually looks.

**It's asking permission to save notes or memory.**
Capturing is internal work and should be automatic. Say: "Capturing memory never needs permission; that's in the operating manual, re-read the saving rules."

**It stated something about me that's wrong.**
Correct it in the moment ("that's wrong, it's X"). The agent should fix `USER.md` or the vault entity, marking the old fact superseded rather than deleting it. That's by design; history stays, current truth changes.

**The conversation got long and it's getting forgetful.**
Context is filling. Say: "checkpoint" or "wrap up." State gets written to files, and a fresh session resumes from the pin. Losing an overlong conversation costs nothing once the wrap has run.

**It says the push was rejected, or mentions a conflict.**
Sync friction between two sessions; both are routine. See [your-hq-everywhere.md](your-hq-everywhere.md); the short version is "pull and rebase, then push again."

**The vault still feels empty.**
See the calibration note at the top. Entities appear when things recur, not when the system is installed. If a week of real use has produced nothing, the more likely problem is that sessions aren't being wrapped, so nothing is being promoted; check that.

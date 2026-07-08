---
name: session-wrap
description: |
  Run the end-of-session checkpoint so nothing learned this session is lost and the
  next session, possibly on another machine with zero memory of this one, can resume
  cold. Use whenever {{name}} signals stopping or wants state saved: "wrap up,"
  "let's end here," "put a pin in this," "checkpoint," "save state," "push
  everything," "that's it for today," "let's stop here." Captures decisions to
  memory/, promotes durable facts to vault/, updates TASKS.md with a clean resume
  point, flags anything the commit won't capture, then commits and pushes HQ.
  Produces a short report ending with the exact pick-up point.
---

# Session Wrap

The closing ritual for an HQ session. Goal: nothing learned this session is lost, and the next session (possibly on another machine, with no memory of this one) can resume from a clean, well-described pin. Then push, so it syncs.

This operationalizes the "Saving memory" rules in the operating manual. Run it at the end instead of re-explaining the steps each time.

## When to use

Any "we're done / pausing" signal from {{name}}: "wrap up," "put a pin in it," "let's end here," "checkpoint this," "save state," "that's it for today." Also run it proactively when context is about to fill mid-task, so compaction doesn't lose state.

## The principle

Write for a cold reader. The next session has no context. A good wrap leaves a resume point so specific that picking up means reading three files, not reconstructing a conversation. Capturing is internal work: never ask permission, just do it. Convert relative dates to absolute ("today" becomes the actual date, "next Friday" becomes a real date).

## Workflow

1. **`git pull --rebase` first.** HQ syncs across machines and sessions via the remote; start the wrap from latest so the push doesn't get rejected. (No remote set up? Skip this and step 7's push, and just commit locally.)

2. **Log to `memory/YYYY-MM-DD.md`.** Append to today's file, don't overwrite it. Capture: what happened, every decision made *and why*, dead ends (so they aren't retried), and the pause point: exactly where work stopped and the next concrete action. Reference file paths, not vibes.

3. **Promote durable facts to `vault/`.** If something lasting was learned about an entity (a person, project, company, area), update its `summary.md` / `items.json` per `vault/PARA_GUIDE.md`, superseding any facts it replaces. Skip if nothing durable changed. Don't duplicate the timeline here: vault holds lasting facts, memory/ holds the episodic record.

4. **Update `TASKS.md`.** Remove completed items (git history is the archive). Add or rewrite open tasks so each carries enough context to act on cold: file paths, current state, the next step, blockers. Newest context wins; expand the relevant existing task rather than appending a vague new one.

5. **Update `USER.md` / `SOUL.md` only if a real pattern emerged** about how {{name}} operates or how the companion should show up. Rare. Most sessions don't touch these.

6. **Flag what's outside the commit.** Before pushing, surface anything an HQ push won't capture:
   - Work living outside the HQ folder that isn't version-controlled: name the path, offer to put it under git later, don't silently leave it as the only copy of something important.
   - Other repos with uncommitted changes that are {{name}}'s own unrelated work: mention them and leave them alone, do not commit them.
   - Security items: API keys or secrets pasted in chat or written anywhere, anything to rotate or restrict.
   - Pending external actions (drafts unsent, posts unposted): list them, don't perform them as part of the wrap.

7. **Commit and push.** From the HQ root: `git add -A`, commit with a session-checkpoint message (`Session wrap: {{one-line summary}}`; this convention makes `git log` a readable session index for free), then push. If the push is rejected, `git pull --rebase` and retry. Never commit secrets; they don't belong in HQ at all.

## Output format

A short report, not a narration of each step:

- **Pushed:** the commit range and one line on what landed.
- **State captured:** where memory/, TASKS.md, and vault/ were updated.
- **Resume point (the pin):** the single exact next action for the next session.
- **Needs your attention:** external artifacts not in git, secrets to rotate, pending external actions. Only if any exist.

Keep it tight. The resume point is the most important line: make it unambiguous.

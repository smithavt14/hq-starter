---
name: inbox-triage
description: |
  Go through {{name}}'s email and report what actually needs attention, without touching
  anything. Use on: "do my email," "check my inbox," "triage my email," "what's waiting
  on me," "anything I need to reply to?" Requires a connected email connector. Strictly
  read-only: lists threads awaiting a reply, drafts responses for the routine ones, and
  never sends, archives, deletes, or marks anything read.
---

# Inbox Triage

Turn "I should check my email" into a two-minute read. The output is a short report of what's waiting, grouped by what kind of attention it needs, with drafts ready for the routine replies.

This is also the worked example of an integration skill: a connector (email) provides the capability, and this file pins down the recipe so "do my email" means the same reliable thing in every session.

## Requires

A connected email connector (see the starter's `guides/connect-your-apps.md`). If email isn't connected, say so and stop; don't improvise from memory.

## The rule

**Read-only, no exceptions.** This skill never sends a message, never archives, deletes, or marks anything read, and never changes labels. Its only outputs are the report and, where the connector supports it, messages saved to the drafts folder. Sending is a separate, live decision {{name}} makes per message, per the hard lines in `SOUL.md`.

Because it's read-only, this skill is safe to run as a section of a scheduled briefing (see `guides/proactive.md`).

## Workflow

1. **Find candidate threads.** Search recent mail (default: the last 7 days; widen if {{name}} asks) for threads where the latest message is *to* {{name}}, isn't from {{name}}, and plausibly expects a reply. Skip obvious bulk mail.

2. **Classify each thread**, into exactly one of:
   - **Needs {{name}} personally**: judgment, relationships, money, anything where a wrong reply costs something. No draft; state in one line what the decision actually is.
   - **Routine, draftable**: scheduling, confirmations, simple answers, polite declines. Write a draft.
   - **FYI**: no reply expected. One line each, batched.
   - **Noise**: newsletters, notifications, cold outreach. A single count, not a list.

3. **Write the routine drafts.** In {{name}}'s register (check `USER.md` and any writing guidance in the vault), short by default. Save to the email drafts folder if the connector can create drafts; otherwise include them in the report. Never invent commitments, dates, or facts to make a draft complete: if a draft needs information you don't have, leave a marked gap (`[when works for you?]`) instead of guessing.

4. **Report.** Oldest-waiting first within each group:
   - **Needs you** (one line each: who, what they're asking, since when)
   - **Drafted, ready to review** (who, gist of the draft, where the draft is)
   - **FYI** (one line each)
   - **Noise**: count only.
   End with the single most overdue item called out.

## Guardrails

- **Sensitive threads** (health, legal, financial, conflict): flag under "Needs you," never draft, keep the one-line description factual and minimal.
- **Volume cap**: if more than ~20 threads qualify, triage the 20 most recent, and say how many were left untriaged rather than silently truncating.
- **Don't over-trigger**: "did X ever reply?" is a search, not a triage; just answer the question.
- **Don't escalate scope**: being asked to triage is not permission to send. Even "just send the easy ones" gets a per-message confirmation showing each final draft.

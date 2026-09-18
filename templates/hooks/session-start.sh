#!/bin/bash
# SessionStart hook: load the standing context, every session, without being asked.
#
# The startup protocol used to be numbered prose asking the agent to remember to
# read four files. Prose describing a procedure drifts from the procedure; a hook
# cannot. Everything this prints lands in the session's context before the first
# turn, so the agent is oriented instead of being told to get oriented.
#
# Loaded in full: SOUL.md, USER.md, MAP.md. They are small and relevant every
# session. From memory/, only the newest dated file, since those run long; the
# day before is named so the agent can open it when it needs more history.
# vault/index.md and the entities stay on demand, reached by grep.
#
# Registered in .claude/settings.json (SessionStart) and .codex/hooks.json.

ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$ROOT" 2>/dev/null || exit 0

# Start from latest: HQ syncs across machines and sessions through the remote.
# Fast-forward only, and silent when there is no remote at all. The
# `pull --autostash` this replaced could leave conflict markers inside files
# with exit 0 and no output, so an HQ wedged mid-merge looked like a normal
# morning (found 2026-09-18). A fast-forward cannot write a marker. When it
# cannot fast-forward, it says so in one line, and the ask that fixes it is
# in the line.
if git rev-parse --abbrev-ref '@{u}' >/dev/null 2>&1; then
  git fetch -q 2>/dev/null
  git merge -q --ff-only '@{u}' >/dev/null 2>&1 ||
    printf '\n===== git =====\nHQ could not fast-forward to the remote (local and remote both changed). Ask: "pull and merge whatever diverged, keep both sides, then push."\n'
fi

# A cloud session (Claude Code on the web) that wrapped without landing on main
# leaves its work on a claude/<name> branch, which the pull above never sees.
# Name any such branch so the agent can merge it in rather than miss it.
git fetch -q --prune origin 2>/dev/null
stray=$(git branch -r --no-merged HEAD 2>/dev/null | grep 'origin/claude/' | sed 's/^ *//')
[ -n "$stray" ] && printf '\nRemote branches with commits not on this branch (cloud sessions that never landed on main; merge them in):\n%s\n' "$stray"

emit() { [ -n "$1" ] && [ -f "$1" ] && { printf '\n===== %s =====\n' "$1"; cat "$1"; }; }

emit SOUL.md
emit USER.md
emit MAP.md

# Dated files only. A plain `ls | tail` picks up README.md, which is how "the
# newest file in memory/" quietly means the wrong thing.
latest=$(ls -1 memory/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9].md 2>/dev/null | sort -r | head -1)
prev=$(ls -1 memory/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9].md 2>/dev/null | sort -r | sed -n 2p)
emit "$latest"
[ -n "$prev" ] && printf '\nPrevious day, open it if you need more history: %s\n' "$prev"

exit 0

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
# Quiet and non-fatal, since plenty of HQs have no remote at all.
git pull -q --no-rebase --autostash 2>/dev/null

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

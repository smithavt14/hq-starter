#!/bin/bash
# PostToolUse (Edit|Write): put the house prose rules back in front of the model
# whenever it writes something a person will read.
#
# A hook cannot edit the draft or run a check for the agent. It injects one line
# of context and the model does the rest, which is enough, because the failure
# mode is forgetting the rules rather than disagreeing with them.
#
# Fires once per file per session, so a file edited eight times nudges once.
# Reads the hook payload with sed instead of a JSON parser: this has to run on a
# machine with no Node and no Python.
#
# The nudge is printed as a JSON object, not as a bare line. A PostToolUse hook
# that exits 0 has its plain stdout written to the debug log and never shown to
# the model, so a bare `echo` here reaches nobody. The structured fields are
# still parsed on exit 0, and `hookSpecificOutput.additionalContext` is the one
# that reaches the model. Codex reads the same shape.
# https://code.claude.com/docs/en/hooks
#
# Registered in .claude/settings.json (PostToolUse) and .codex/hooks.json.

INPUT=$(cat | tr -d '\n')

field() {
  printf '%s' "$INPUT" | sed -n "s/.*\"$1\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\".*/\1/p" | head -1
}

FILE=$(field file_path)
SESSION=$(field session_id)
[ -z "$FILE" ] && exit 0

# Internal machinery: the manual, the identity files, the fact logs, the task
# list. These follow the house style too, and nudging on every capture would
# make the hook noise instead of a reminder.
case "$FILE" in
  */memory/*|*/journal/*|*/.claude/*|*/.codex/*|*/skills/*|*/scripts/*) exit 0 ;;
  *CLAUDE.md|*AGENTS.md|*SOUL.md|*USER.md|*TASKS.md|*MAP.md|*items.json|*.json) exit 0 ;;
esac

# Outward-facing prose: posts, drafts, emails, proposals, copy, docs.
BASE=$(basename "$FILE" | tr '[:upper:]' '[:lower:]')
MATCH=0
case "$FILE" in
  *.mdx|*/posts/*.md|*/drafts/*.md) MATCH=1 ;;
esac
case "$BASE" in
  *draft*|*post*|*email*|*letter*|*proposal*|*copy*|*announcement*|*newsletter*|*script*|readme.md) MATCH=1 ;;
esac
[ "$MATCH" = "0" ] && exit 0

hash_of() {
  if command -v md5 >/dev/null 2>&1; then printf '%s' "$1" | md5 -q
  elif command -v md5sum >/dev/null 2>&1; then printf '%s' "$1" | md5sum | cut -d' ' -f1
  else printf '%s' "$1" | tr -c 'A-Za-z0-9' '-'
  fi
}

MARKER="${TMPDIR:-/tmp}/hq-prose-nudge-$(hash_of "$SESSION$FILE")"
[ -f "$MARKER" ] && exit 0
touch "$MARKER"

# The payload is JSON, so anything interpolated into it gets stripped down to
# characters that cannot break the object. A filename is the only variable part.
SAFE=$(printf '%s' "$BASE" | tr -cd 'A-Za-z0-9._-')

printf '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"Prose someone will read was just written (%s). House style, from the manual: no em dashes; plain verbs; state the positive claim rather than a negation of its opposite; keep the articles and function words; no filler or signposting; specifics over adjectives. Re-read it against those before it goes out."}}\n' "$SAFE"
exit 0

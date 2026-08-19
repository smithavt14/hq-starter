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

echo "Prose someone will read was just written ($BASE). House style, from the manual: no em dashes; plain verbs; state the positive claim rather than \"not X, it's Y\"; keep the articles and function words; no filler or signposting; specifics over adjectives. Re-read it against those before it goes out."
exit 0

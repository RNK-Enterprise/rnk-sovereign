#!/usr/bin/env bash
# install-cron.sh — idempotent installer for rnk-sovereign's cron jobs.
#
# For every deploy/crontab-<job> fragment there must be a deploy/<job>.sh.
# For each pair it:
#   1. syncs the script into ~/bin/ (repo copy wins),
#   2. merges the fragment's cron entry into the user's crontab, deduping on
#      the stable command path ($HOME/bin/<job>.sh) so legacy hand-installed
#      entries are recognized rather than duplicated,
#   3. leaves every unrelated crontab line (env vars, other jobs) untouched.
#
# Idempotent: safe to run repeatedly. Adding a new job = drop a
# crontab-<job> fragment plus <job>.sh in this directory and re-run.

set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"

shopt -s nullglob
fragments=("$DIR"/crontab-*)
[ ${#fragments[@]} -gt 0 ] || { echo "no crontab-* fragments in $DIR" >&2; exit 1; }

current="$(crontab -l 2>/dev/null || true)"
changed=0

for frag in "${fragments[@]}"; do
  job="$(basename "$frag")"
  job="${job#crontab-}"
  script="$DIR/$job.sh"
  cmd_key="\$HOME/bin/$job.sh"

  [ -f "$script" ] || { echo "missing $script for fragment $frag" >&2; exit 1; }

  mkdir -p "$HOME/bin"
  install -m 755 "$script" "$HOME/bin/$job.sh"
  echo "synced $HOME/bin/$job.sh"

  if printf '%s\n' "$current" | grep -qF "$cmd_key"; then
    echo "  cron entry already present — nothing to do"
  else
    tmp="$(mktemp)"
    {
      printf '%s\n' "$current" | grep -vF "$cmd_key" || true
      cat "$frag"   # fragment carries its own managed-by comment
    } > "$tmp"
    crontab "$tmp"
    rm -f "$tmp"
    entry="$(grep -v '^[[:space:]]*#' "$frag" | grep -v '^[[:space:]]*$' | head -1)"
    echo "  cron entry installed: $entry"
    current="$(crontab -l)"
    changed=$((changed + 1))
  fi
done

echo "done ($changed entry(ies) added)"

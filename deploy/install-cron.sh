#!/usr/bin/env bash
# install-cron.sh — self-contained installer for the portfolio health check.
#
# Idempotent: safe to run repeatedly. It
#   1. syncs portfolio-health.sh into ~/bin/ (repo copy wins),
#   2. merges the cron entry from crontab-portfolio-health into the user's
#      crontab, deduping on the stable command path (~/bin/portfolio-health.sh)
#      so legacy hand-installed entries are replaced, not duplicated,
#   3. leaves every unrelated crontab line (env vars, other jobs) untouched.
#
# Usage (from the repo):  bash deploy/install-cron.sh

set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
FRAG="$DIR/crontab-portfolio-health"
CMD_KEY="\$HOME/bin/portfolio-health.sh"

[ -f "$FRAG" ] || { echo "missing $FRAG" >&2; exit 1; }
[ -f "$DIR/portfolio-health.sh" ] || { echo "missing $DIR/portfolio-health.sh" >&2; exit 1; }

# 1. sync the script itself
mkdir -p "$HOME/bin"
install -m 755 "$DIR/portfolio-health.sh" "$HOME/bin/portfolio-health.sh"
echo "synced $HOME/bin/portfolio-health.sh"

# 2. merge the cron entry
current="$(crontab -l 2>/dev/null || true)"
frag_cmd="$(grep -v '^#' "$FRAG" | grep -v '^[[:space:]]*$' | head -1)"

if printf '%s\n' "$current" | grep -qF "$CMD_KEY"; then
  echo "cron entry already present — nothing to do"
  exit 0
fi

tmp="$(mktemp)"
{
  printf '%s\n' "$current" | grep -vF "$CMD_KEY" || true
  cat "$FRAG"   # fragment carries its own managed-by comment
} > "$tmp"
crontab "$tmp"
rm -f "$tmp"

echo "cron entry installed:"
crontab -l | grep -F "$CMD_KEY"

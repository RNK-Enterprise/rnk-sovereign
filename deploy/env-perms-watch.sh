#!/usr/bin/env bash
# env-perms-watch.sh — verify no .env-family file under $HOME is group- or
# world-readable. Placeholder templates (*.example) are deliberately 644 and
# excluded, as are node_modules and .git trees.
#
# With --fix, loose files are chmod 600 and the run exits 0 if that succeeds;
# without it, the run only reports and exits 1 so cron/monitoring picks it up.
# Either way an ALERT.txt is written whenever loose files are found, so the
# event is visible even without cron mail.
#
# Install (on box):  bash deploy/install-cron.sh  (syncs this script to ~/bin
#                     and merges the cron entry — idempotent)

set -u
FIX=0
[ "${1:-}" = "--fix" ] && FIX=1

DIR="$HOME/env-perms-watch"
STATE="$DIR/last-report.txt"
ALERT="$DIR/ALERT.txt"
mkdir -p "$DIR"
now="$(date '+%Y-%m-%d %H:%M %Z')"

loose="$(find "$HOME" \( -path "*/node_modules" -o -path "*/.git" \) -prune -o \
  -type f -name ".env*" -print 2>/dev/null | while IFS= read -r f; do
    case "$f" in *.example) continue ;; esac
    m=$(stat -c "%a" "$f" 2>/dev/null) || continue
    case "$m" in
      ??[4-7]) echo "$m $f" ;;
    esac
done)"

if [ -z "$loose" ]; then
  rm -f "$ALERT"
  printf '%s OK: no group/world-readable .env files\n' "$now" > "$STATE"
  echo "$now OK: no group/world-readable .env files"
  exit 0
fi

# --- found loose files ---
{
  echo "$now PROBLEM: group/world-readable .env files found:"
  sed 's/^/  /' <<< "$loose"
} | tee "$STATE"
printf '%s\n' "$now" > "$ALERT"
cat "$STATE" >> "$ALERT"

if [ "$FIX" -eq 1 ]; then
  echo "--fix: chmod 600 offenders"
  fixed=0; failed=0
  while IFS= read -r line; do
    f=${line#* }   # strip leading mode column
    if chmod 600 "$f" 2>/dev/null; then
      fixed=$((fixed + 1))
    else
      echo "  chmod failed: $f"; failed=$((failed + 1))
    fi
  done <<< "$loose"
  echo "fixed: $fixed, failed: $failed"
  if [ "$failed" -eq 0 ]; then
    rm -f "$ALERT"
    exit 0
  fi
fi

exit 1

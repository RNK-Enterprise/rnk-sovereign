#!/usr/bin/env bash
# portfolio-health.sh — daily portfolio health check for the atlas box.
#
# Checks: pm2 app status + restart counters, local service ports, public
# tunnel hostnames, SHA-256 of deployed server files (drift/tamper detect),
# and disk usage. Reports only *deltas* vs the previous run; a full snapshot
# lands in ~/portfolio-health/latest.txt. Any failure writes ALERT.txt and
# exits 1 so cron mail picks it up.
#
# Install (on box):  ~/bin/portfolio-health.sh            # one-shot
# Cron:              15 7 * * * $HOME/bin/portfolio-health.sh >> $HOME/portfolio-health/cron.log 2>&1

set -u
DIR="$HOME/portfolio-health"
STATE="$DIR/state.env"      # previous run's values: O[key]='value'
LATEST="$DIR/latest.txt"
HISTORY="$DIR/history.log"
ALERT="$DIR/ALERT.txt"
mkdir -p "$DIR"

now="$(date '+%Y-%m-%d %H:%M %Z')"
declare -A O=()
declare -A C=()
problems=()

# ---------- load previous state ----------
if [ -f "$STATE" ]; then
  # shellcheck disable=SC1090
  . "$STATE"
fi

set_check() { # set_check <key> <value>
  C["$1"]="$2"
}

fail() { # fail <key> <detail>
  problems+=("$1: $2")
}

# ---------- 1. pm2 ----------
if pm2_out=$(pm2 jlist 2>/dev/null | python3 -c '
import json, sys
apps = json.load(sys.stdin)
for a in apps:
    env = a["pm2_env"]
    key = "restarts_" + "".join(ch if ch.isalnum() else "_" for ch in a["name"])
    print("set_check %s %s %s" % (key, env["status"], env["restart_time"]))
' 2>/dev/null); then
  # lines: set_check restarts_<name> <status> <restarts> — fold into state vars
  offline=""
  while read -r _ key status restarts; do
    [ -n "$key" ] || continue   # skip blank lines (empty jlist → empty heredoc)
    set_check "$key" "$restarts"
    if [ "$status" != "online" ]; then
      offline="$offline${offline:+,}$key"
    fi
  done <<EOF2
$pm2_out
EOF2
  total=$(printf '%s\n' "$pm2_out" | grep -c . )
  online=$(printf '%s\n' "$pm2_out" | grep -c " online ")
  if [ "$total" -eq 0 ]; then
    fail "pm2" "jlist reported no apps"
    set_check pm2_online 0
    set_check pm2_total 0
    set_check pm2_offline "none-reported"
  else
    set_check pm2_online "$online"
    set_check pm2_total "$total"
    set_check pm2_offline "${offline:-none}"
  fi
else
  fail "pm2" "jlist query failed"
  set_check pm2_online "?"
  set_check pm2_total "?"
  set_check pm2_offline "query-failed"
fi

[ "${C[pm2_offline]:-x}" = "none" ] || fail "pm2" "offline apps: ${C[pm2_offline]:-unset}"

# ---------- 2. local service ports ----------
for p in 3005 3013 3003; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://127.0.0.1:$p/" 2>/dev/null)
  set_check "port_$p" "${code:-000}"
  [ "$code" = "200" ] || fail "port_$p" "got ${code:-no response}, expected 200"
done

# ---------- 3. public tunnel hostnames ----------
for h in rnkstudios.uk gift.rnkstudios.uk nueron.rnkstudios.uk adapt.rnkstudios.uk classic.rnkstudios.uk; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://$h" 2>/dev/null)
  key="pub_${h//./_}"
  set_check "$key" "${code:-000}"
  [ "$code" = "200" ] || fail "$key" "got ${code:-no response}, expected 200"
done

# ---------- 4. deployed-file checksums (drift / accidental edits) ----------
sumfile() { # sumfile <key> <path>
  if [ -f "$2" ]; then
    set_check "$1" "$(sha256sum "$2" | cut -d" " -f1)"
  else
    set_check "$1" "MISSING"
    fail "$1" "deployed file missing: $2"
  fi
}
sumfile sha_rate_limit      "$HOME/rnk-sovereign/server/rate-limit.ts"
sumfile sha_chat_mw         "$HOME/rnk-sovereign/server/chat-middleware.ts"
sumfile sha_signup_mw       "$HOME/rnk-sovereign/server/signup-middleware.ts"
sumfile sha_sovereign_pkg   "$HOME/rnk-sovereign/package.json"
sumfile sha_site_server     "$HOME/rnkstudios-site/server.js"
sumfile sha_site_ecosystem  "$HOME/rnkstudios-site/ecosystem.config.js"

# ---------- 5. disk ----------
pct=$(df --output=pcent / | tail -1 | tr -dc "0-9")
set_check disk_pct "${pct:-?}"
[ "${pct:-100}" -lt 90 ] 2>/dev/null || fail "disk" "root filesystem at ${pct}%"

# ---------- delta report ----------
snapshot="$DIR/.snap.$$"
{
  echo "== Portfolio health — $now =="
  if [ -f "$STATE" ]; then
    deltas=0
    for k in "${!C[@]}"; do
      old="${O[$k]:-<new>}"
      if [ "$old" != "${C[$k]}" ]; then
        # restarts churn constantly on reloads; only flag big jumps as deltas
        case "$k" in restarts_*)
          if [[ "${old:-}" =~ ^[0-9]+$ && "${C[$k]:-}" =~ ^[0-9]+$ ]]; then
            case $(( C[$k] - old )) in
              [0-2]|-[0-2]) continue ;;
            esac
          fi ;;
        esac
        echo "  Δ $k: $old → ${C[$k]}"
        deltas=$((deltas + 1))
      fi
    done
    if [ "$deltas" -eq 0 ]; then
      echo "  no changes since last run"
    fi
  else
    echo "  first run — recording baseline"
  fi
  if [ "${#problems[@]}" -gt 0 ]; then
    echo "  PROBLEMS:"
    for pr in "${problems[@]}"; do echo "    ✗ $pr"; done
  else
    echo "  all checks pass"
  fi
  echo "  summary: pm2 ${C[pm2_online]:-?}/${C[pm2_total]:-?} online · disk ${C[disk_pct]:-?}%"
} | tee "$snapshot"

cp "$snapshot" "$LATEST"
rm -f "$snapshot"

# ---------- persist new state ----------
: > "$STATE"
for k in "${!C[@]}"; do
  printf "O[%q]=%q\n" "$k" "${C[$k]}" >> "$STATE"
done

# ---------- history + alert ----------
if [ "${#problems[@]}" -gt 0 ]; then
  echo "$now FAIL (${#problems[@]} problems)" >> "$HISTORY"
  cp "$LATEST" "$ALERT"
  exit 1
else
  echo "$now OK" >> "$HISTORY"
  rm -f "$ALERT"
  exit 0
fi

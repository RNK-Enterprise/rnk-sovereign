#!/usr/bin/env bash
# Run on atlas (rnk@192.168.1.202), from ~/rnk-sovereign, to redeploy after a
# git pull or rsync. pm2 keeps the process alive; the rnkstudios-uk tunnel
# connector on this box publishes :3005 as rnkstudios.uk.
set -euo pipefail

npm ci
npm run build
pm2 reload rnk-sovereign || pm2 start ecosystem.config.cjs
pm2 save

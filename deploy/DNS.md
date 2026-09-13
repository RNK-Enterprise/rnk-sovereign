# rnkstudios.uk — tunnel & subdomain guide (atlas)

State as of 2026-09-12. The old `rnkstudios-uk-tunnel` (`9147422f…`) was
deleted in the Cloudflare dashboard, which is what produced Cloudflare
Error 1033. The canonical tunnel is now **`rnkstudios-web`**
(id `40fe8256-ae3d-43c0-98d8-5dbf9a70a083`), whose connector runs on
**atlas** (`rnk@192.168.1.202`) under pm2 as `rnkstudios-web-tunnel`,
with ingress from `deploy/rnkstudios-web.yml` (local config file — the
hostname→service mapping lives in that file, **not** in the dashboard).

## What runs where (all on atlas)

| pm2 name | what | port |
|---|---|---|
| `rnk-sovereign` | the hub (Sovereign/prototype) | **3005** |
| `rnk-enterprise-website` | RNK Enterprise site — **leave alone** | 3003 |
| `rnkstudios-web-tunnel` | tunnel connector for all five hostnames | — |
| `foundry-demo2` / `foundry-demo2-tunnel` / `rnk-demo-portal` / `livekit` | existing work, unaffected | — |

Not deployed yet (ingress already points at their ports for when they are):

| hostname | future service | port |
|---|---|---|
| `adapt.rnkstudios.uk` | Curator web (`hosted-server/web.js`) | 8785 |
| `nueron.rnkstudios.uk` | Nueron `server.py` (see `Nueron 3D/deploy/HOSTING.md`) | 8765 |
| `gift.rnkstudios.uk` | The Gift `server.py` (see `The Gift/deploy/HOSTING.md`) | 8770 |

## Why the CLI cannot create the DNS records

`cloudflared login` was last run on **both** this desktop and atlas against
the **rnk-enterprise.us** zone, so `cert.pem` is zone-scoped there. Running
`cloudflared tunnel route dns rnkstudios-web rnkstudios.uk` therefore
creates a record named `rnkstudios.uk.rnk-enterprise.us` — in the wrong
zone. That already happened: **five bogus CNAMEs now exist in the
rnk-enterprise.us zone** (apex, www, adapt, nueron, gift — each with the
`.rnk-enterprise.us` suffix, all routing to tunnel `40fe8256…`). Delete
them from the dashboard, or re-scope a cert, or use an API token.

To fix the scoping properly (either one works):

```bash
cloudflared login          # pick rnkstudios.uk — rewrites cert.pem for that zone
# or create an API token with Zone.DNS Edit on rnkstudios.uk and export
#   CF_API_TOKEN=…   — newer cloudflared can use it for route dns
```

## Dashboard checklist (rnkstudios.uk zone → DNS)

Five CNAME records, all **proxied** (orange cloud), all pointing at the
same tunnel:

| Type | Name | Target |
|---|---|---|
| CNAME | `rnkstudios.uk` (@) | `40fe8256-ae3d-43c0-98d8-5dbf9a70a083.cfargotunnel.com` |
| CNAME | `www` | `40fe8256-ae3d-43c0-98d8-5dbf9a70a083.cfargotunnel.com` |
| CNAME | `adapt` | `40fe8256-ae3d-43c0-98d8-5dbf9a70a083.cfargotunnel.com` |
| CNAME | `nueron` | `40fe8256-ae3d-43c0-98d8-5dbf9a70a083.cfargotunnel.com` |
| CNAME | `gift` | `40fe8256-ae3d-43c0-98d8-5dbf9a70a083.cfargotunnel.com` |

No Public Hostnames need to exist on the tunnel — the connector uses the
local `rnkstudios-web.yml` ingress file, so the CNAMEs alone are enough.

## Verify (from anywhere)

```bash
dig +short rnkstudios.uk CNAME          # → 40fe8256….cfargotunnel.com
curl -s https://rnkstudios.uk | grep -o "<title>[^<]*"
curl -s https://www.rnkstudios.uk -o /dev/null -w "%{http_code}\n"
curl -s https://nueron.rnkstudios.uk/api/health 2>/dev/null || true
curl -s https://adapt.rnkstudios.uk/api/healthz   # → {"ok":true}
curl -s https://gift.rnkstudios.uk -o /dev/null -w "%{http_code}\n"
```

All five live as of 2026-09-12. Services on atlas under pm2:
`rnk-sovereign` :3005 · `rnk-adapt` :8785 · `nueron` :8765 ·
`the-gift` :8770 (plus `rnkstudios-web-tunnel`).

## Redeploy

```bash
# hub code: rsync → on atlas:
ssh rnk@192.168.1.202 'cd ~/rnk-sovereign && ./deploy/deploy.sh'
# tunnel ingress changes: edit deploy/rnkstudios-web.yml, scp to
#   rnk@192.168.1.202:.cloudflared/rnkstudios-web.yml
# then: pm2 reload rnkstudios-web-tunnel   (on atlas)
```

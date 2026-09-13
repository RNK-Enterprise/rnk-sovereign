# RNK Studios — company door prototype

Prototype of the public company site for [rnkstudios.uk](https://rnkstudios.uk). Art RPG / Minecraft / store stay off this root.

```bash
cd prototype
npm install
npm run dev
```

Opens at `http://localhost:5173`.

| Route | What it is |
|---|---|
| `/` | Company door |
| `/offers` | Three offers |
| `/offers/site` `/room` `/operator` | Offer sheets |
| `/work` `/work/jenn` | Civilian proof |
| `/family` | The family: live + dormant doors |
| `/podcast` | Resilience Never Kneels — weekly, Fridays 9 AM |
| `/feed.xml` | iTunes-style RSS feed for the podcast |
| `/process` | Scope → keep |
| `/contact` | Form (local only, plus mailto) |
| `/privacy` `/terms` | Prototype legal shape |

Contact does not post to a server. After submit it offers `mailto:hello@rnkstudios.uk`.

## Podcast feed

`GET /feed.xml` serves an iTunes-style RSS feed generated from `src/podcast.ts`
(same episode data the page renders — edit one file, both update). Drops are
pinned to **09:00 Europe/London** on consecutive Fridays.

The full chain was proven 2026-09-12 with a labeled 30s stand-in MP3 for
episode 1 (enclosure, byte-identical public download, range requests all
verified). The stand-in is currently live in the feed — replace it with the
real recording:

```bash
scp real-episode-1.mp3 rnk@192.168.1.202:~/rnk-audio/ep1.mp3
```

The feed picks it up on its next request (≤15 min cache) — no redeploy. Or
delete the file to drop the enclosure until the episode is ready.

To launch on Apple Podcasts / Spotify: record the episode, name it
`ep<N>.mp3` (or `.m4a`) — e.g. `ep1.mp3` for episode 1 — and drop it into
`~/rnk-audio/` on atlas. The feed detects it on its next request and the
enclosure appears automatically (`https://rnkstudios.uk/audio/ep1.mp3`, true
byte size, correct MIME) — no redeploy, no code edit. Removing the file
removes the enclosure. (For off-dir or differently-named audio, set
`audioUrl: { url, bytes }` on the episode in `src/podcast.ts` — that takes
priority.) Then submit `https://rnkstudios.uk/feed.xml` in Apple's Podcasts
Connect and Spotify's submission form; both directories mirror the feed.

On atlas, the app itself serves `/audio/` from `~/rnk-audio` (override with
`RNK_AUDIO_DIR`) with byte-range support for seeking — drop files there and
they are live, no restart. Launch-notification signups POST to `/api/signup`
and append to `~/rnk-data/podcast-signups.jsonl` (one JSON object per line,
0600; override the dir with `RNK_DATA_DIR`).

Studio chat (`/api/chat`) notifies the paired handset and, if `RNK_SMS_TO` is set in `.env` (never `VITE_`), sends SMS through that phone. The number is not in the client. Copy `.env.example` to `.env`.

## Production

`vite dev`/`vite preview` only run the API middleware while the Vite process itself is alive — that's fine for local work but isn't a production server. `server/prod.ts` is a small Express app that serves the built `dist/` and mounts the same API middleware, meant to run as a long-lived process:

```bash
npm run build
npm run start   # node --env-file=.env server/prod.ts, defaults to :4000
```

Deployed on **atlas** (`rnk@192.168.1.202`, `~/rnk-sovereign`) under **pm2** as
`rnk-sovereign` on port **3005** (3003 on that box is the RNK Enterprise site —
do not reuse it). `deploy/deploy.sh` is the redeploy step (`npm ci` → build →
`pm2 reload`).

Public routing is via the **`rnkstudios-web`** Cloudflare Tunnel
(`40fe8256-ae3d-43c0-98d8-5dbf9a70a083`), whose connector runs on atlas under
pm2 (`rnkstudios-web-tunnel`) with a local ingress file —
`deploy/rnkstudios-web.yml`, synced to `~/.cloudflared/` on atlas. See
`deploy/DNS.md` for the full hostname map.

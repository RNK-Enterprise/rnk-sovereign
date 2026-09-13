import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import {
  EPISODE_LENGTH_MIN,
  PODCAST_TAGLINE,
  UPCOMING_EPISODES,
  ARCHIVE_EPISODES,
  getNextFridays,
  type Episode,
} from "../src/podcast.ts";

// Podcast identity used by the feed (Apple/Spotify directory fields).
const SHOW = {
  title: "Resilience Never Kneels",
  author: "RNK Studios",
  ownerEmail: "hello@rnkstudios.uk",
  link: "https://rnkstudios.uk/podcast",
  feedUrl: "https://rnkstudios.uk/feed.xml",
  cover: "https://rnkstudios.uk/images/podcast-cover.png",
  category: "Technology",
  subcategories: ["Tech News", "How To"],
  explicit: "false",
};

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Offset (minutes) of a timeZone at the given instant.
function tzOffsetMinutes(d: Date, tz: string) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const p: Record<string, number> = {};
  for (const part of dtf.formatToParts(d)) {
    if (part.type !== "literal") p[part.type] = Number(part.value);
  }
  const asUTC = Date.UTC(
    p.year,
    p.month - 1,
    p.day,
    p.hour % 24,
    p.minute,
    p.second
  );
  return (asUTC - d.getTime()) / 60000;
}

// A wall-clock time in a timeZone, as a real UTC instant. Drops are pinned to
// 09:00 Europe/London so the Friday morning promise holds regardless of where
// the server happens to sit.
function zonedDrop(friday: Date, hour: number, tz = "Europe/London") {
  const guess = Date.UTC(
    friday.getFullYear(),
    friday.getMonth(),
    friday.getDate(),
    hour
  );
  return new Date(guess - tzOffsetMinutes(new Date(guess), tz) * 60000);
}

function rfc822(d: Date) {
  return d.toUTCString();
}

// Where episode audio is looked for — same resolution as the /audio/ static
// middleware (RNK_AUDIO_DIR, else ~/rnk-audio).
const audioDir =
  process.env.RNK_AUDIO_DIR ||
  join(process.env.HOME || process.cwd(), "rnk-audio");

// Public base for enclosure URLs.
const audioBaseUrl =
  process.env.RNK_AUDIO_BASE_URL || "https://rnkstudios.uk/audio";

const AUDIO_EXT = new Set([
  ".mp3",
  ".m4a",
  ".mp4",
  ".wav",
]);

const MIME: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".m4a": "audio/x-m4a",
  ".mp4": "audio/mp4",
  ".wav": "audio/wav",
};

// Drop a file named ep<N>.<ext> into ~/rnk-audio and the feed picks it up on
// the next request — no redeploy, no manual wiring. Exact epN prefix wins;
// among multiple matches (e.g. ep1.mp3 and ep1-final.mp3) alphabetical order
// decides.
function detectAudio(epNumber: number): { url: string; bytes: number; mime: string } | null {
  const prefix = `ep${epNumber}`;
  try {
    const found = readdirSync(audioDir)
      .filter((f) => {
        const dot = f.lastIndexOf(".");
        return (
          f.startsWith(prefix) &&
          dot > 0 &&
          AUDIO_EXT.has(f.slice(dot).toLowerCase())
        );
      })
      .sort();
    const name = found[0];
    if (!name) return null;
    const bytes = statSync(join(audioDir, name)).size;
    const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
    const base = audioBaseUrl.replace(/\/$/, "");
    return { url: `${base}/${encodeURIComponent(name)}`, bytes, mime: MIME[ext] };
  } catch {
    return null; // no dir / unreadable — feed just has no enclosures
  }
}

// Publishing order: the launch run, then the in-the-can batch — eight
// consecutive Friday 9 AM drops from the calendar, newest last here (RSS
// items are newest-first).
function scheduledEpisodes(): { ep: Episode; drop: Date }[] {
  const fridays = getNextFridays(UPCOMING_EPISODES.length + ARCHIVE_EPISODES.length);
  const all = [...UPCOMING_EPISODES, ...ARCHIVE_EPISODES];
  return all
    .map((ep, i) => ({ ep, drop: zonedDrop(fridays[i], 9) }))
    .reverse(); // newest-first
}

function item({ ep, drop }: { ep: Episode; drop: Date }) {
  // Priority: an explicitly wired audioUrl in podcast.ts, else a detected
  // ep<N>.* file in the audio dir.
  const audio = ep.audioUrl
    ? { ...ep.audioUrl, mime: "audio/mpeg" }
    : detectAudio(ep.number);
  const enclosure = audio
    ? `      <enclosure url="${escapeXml(audio.url)}" length="${audio.bytes}" type="${audio.mime}"/>\n`
    : "";
  return `    <item>
      <title>${escapeXml(`Episode ${ep.number}: ${ep.title}`)}</title>
      <description>${escapeXml(ep.description)}</description>
      <link>${SHOW.link}</link>
      <guid isPermaLink="false">rnk-rnk-ep-${ep.number}</guid>
      <pubDate>${rfc822(drop)}</pubDate>
${enclosure}      <itunes:episode>${ep.number}</itunes:episode>
      <itunes:duration>${EPISODE_LENGTH_MIN * 60}</itunes:duration>
      <itunes:explicit>${SHOW.explicit}</itunes:explicit>
    </item>
`;
}

export function buildFeed(): string {
  const items = scheduledEpisodes().map(item).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SHOW.title)}</title>
    <description>${escapeXml(PODCAST_TAGLINE)}</description>
    <link>${SHOW.link}</link>
    <language>en-gb</language>
    <atom:link href="${SHOW.feedUrl}" rel="self" type="application/rss+xml"/>
    <itunes:author>${escapeXml(SHOW.author)}</itunes:author>
    <itunes:summary>${escapeXml(PODCAST_TAGLINE)}</itunes:summary>
    <itunes:type>episodic</itunes:type>
    <itunes:owner>
      <itunes:name>${escapeXml(SHOW.author)}</itunes:name>
      <itunes:email>${SHOW.ownerEmail}</itunes:email>
    </itunes:owner>
    <itunes:image href="${SHOW.cover}"/>
    <itunes:category text="${escapeXml(SHOW.category)}">
${SHOW.subcategories.map((s) => `      <itunes:category text="${escapeXml(s)}"/>`).join("\n")}
    </itunes:category>
    <itunes:explicit>${SHOW.explicit}</itunes:explicit>
${items}  </channel>
</rss>
`;
}

export function podcastFeedMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) {
  const url = req.url?.split("?")[0];
  if (url !== "/feed.xml") {
    next();
    return;
  }
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=900");
  res.end(buildFeed());
}

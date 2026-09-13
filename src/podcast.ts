export const PODCAST_NAME = "Resilience Never Kneels";
export const PODCAST_TAGLINE =
  "A weekly show about building infrastructure, security, and privacy systems that stay up — and writing novels that survive the rejections.";
export const EPISODE_LENGTH_MIN = 60;

// Release cadence: new episode every Friday, dropping at 9:00 AM.
export function getNextFridays(count: number, from: Date = new Date()): Date[] {
  const start = new Date(from);
  start.setHours(9, 0, 0, 0);
  const day = start.getDay(); // 0 = Sun ... 5 = Fri
  const diff = (5 - day + 7) % 7;
  start.setDate(start.getDate() + diff);

  const fridays: Date[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i * 7);
    fridays.push(d);
  }
  return fridays;
}

export function getPastFridays(count: number, from: Date = new Date()): Date[] {
  const [nextFriday] = getNextFridays(1, from);
  const fridays: Date[] = [];
  for (let i = 1; i <= count; i++) {
    const d = new Date(nextFriday);
    d.setDate(nextFriday.getDate() - i * 7);
    fridays.push(d);
  }
  return fridays;
}

export function formatDrop(d: Date) {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// Offset (minutes) of a timeZone at a given instant — shared by the feed and
// the client-side drop countdown.
export function tzOffsetMinutes(d: Date, tz: string) {
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

// The instant of the next Friday 09:00 Europe/London drop — the same promise
// the RSS feed publishes, computed on the client for the countdown badge.
export function getNextDropInstant(from: Date = new Date()): Date {
  const tz = "Europe/London";
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
  });
  const parts: Record<string, string | number> = {};
  for (const part of fmt.formatToParts(from)) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }
  const weekdayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    String(parts.weekday)
  );
  const y = Number(parts.year);
  const m = Number(parts.month);
  const d = Number(parts.day);
  const hour = Number(parts.hour) % 24;

  // Days until Friday; if it is Friday, the drop only counts if it is before 9 AM.
  let daysAhead = (5 - weekdayIndex + 7) % 7;
  if (daysAhead === 0 && hour >= 9) daysAhead = 7;

  const guess = Date.UTC(y, m - 1, d + daysAhead, 9);
  return new Date(guess - tzOffsetMinutes(new Date(guess), tz) * 60000);
}

export type Episode = {
  number: number;
  title: string;
  description: string;
  durationMin: number;
  /** Set once the MP3 exists; the RSS enclosure points here. */
  audioUrl?: { url: string; bytes: number };
};

// PROTOTYPE: planned lineup, swap in real recordings as they land. The first
// four Fridays are the launch run; the archive batch is recorded ahead of
// launch so the feed isn't empty week one. All episodes run about
// EPISODE_LENGTH_MIN (60) minutes.

export const UPCOMING_EPISODES: Episode[] = [
  {
    number: 1,
    title: "Never Kneels",
    description:
      "The manifesto. Resilience is not a mood — it is something you build. What a server that stays up and a writer who keeps going have in common, and why both are decided before the pressure arrives.",
    durationMin: EPISODE_LENGTH_MIN,
  },
  {
    number: 2,
    title: "Own the Pipes",
    description:
      "Mail, DNS, tunnels, names. What it actually takes to run your own infrastructure on a box in the house — and the Friday morning it all pays for itself.",
    durationMin: EPISODE_LENGTH_MIN,
  },
  {
    number: 3,
    title: "Hardened by Default",
    description:
      "Security systems for people without a security team. Defaults that survive a bad day, keys that rotate themselves, and the boring patches that beat the clever ones.",
    durationMin: EPISODE_LENGTH_MIN,
  },
  {
    number: 4,
    title: "Privacy Is a Practice",
    description:
      "Not a purchase, a practice. Threat models for normal households — what to protect, from whom, and what a veil actually buys you once you draw it.",
    durationMin: EPISODE_LENGTH_MIN,
  },
];

export const ARCHIVE_EPISODES: Episode[] = [
  {
    number: 5,
    title: "Rejection Math",
    description:
      "One hundred noes, counted on purpose. The spreadsheet that keeps a novelist submitting — and why the numbers only look cold from the outside.",
    durationMin: EPISODE_LENGTH_MIN,
  },
  {
    number: 6,
    title: "Two Crafts, One Calendar",
    description:
      "Writing novels while running infrastructure. Focus systems for the day the pipes break at noon and the chapter is due at midnight.",
    durationMin: EPISODE_LENGTH_MIN,
  },
  {
    number: 7,
    title: "Backups You Actually Restore",
    description:
      "The 3-2-1 rule for servers and manuscripts alike. An untested backup is a wish; a restore rehearsal is a plan.",
    durationMin: EPISODE_LENGTH_MIN,
  },
  {
    number: 8,
    title: "The Long Middle",
    description:
      "Chapter forty of the novel, year three of the server. Endurance is the skill nobody markets — how to keep building when the interesting part is over.",
    durationMin: EPISODE_LENGTH_MIN,
  },
];

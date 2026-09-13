export const BOOKING_MINUTES = 45;
export const BOOKING_TZ = "Europe/London";

export type DayOption = {
  iso: string;
  label: string;
  sub: string;
};

export type SlotOption = {
  value: string;
  label: string;
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function londonParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BOOKING_TZ,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    weekday: get("weekday"),
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

export function upcomingWeekdays(count = 10): DayOption[] {
  const days: DayOption[] = [];
  const seen = new Set<string>();
  let t = Date.now() + 36 * 3600 * 1000;
  while (days.length < count) {
    const p = londonParts(new Date(t));
    const iso = `${p.year}-${p.month}-${p.day}`;
    const weekend = p.weekday === "Sat" || p.weekday === "Sun";
    if (!weekend && !seen.has(iso)) {
      seen.add(iso);
      days.push({
        iso,
        label: p.weekday,
        sub: `${Number(p.day)} ${MONTHS[Number(p.month) - 1]}`,
      });
    }
    t += 12 * 3600 * 1000;
  }
  return days;
}

export const TIME_SLOTS: SlotOption[] = [
  { value: "10:00", label: "10:00" },
  { value: "11:30", label: "11:30" },
  { value: "13:00", label: "13:00" },
  { value: "14:30", label: "14:30" },
];

export function slotRange(isoDay: string, time: string) {
  const [year, month, day] = isoDay.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const probe = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const londonHour = Number(londonParts(probe).hour);
  const offsetHours = londonHour - hour;
  const start = new Date(Date.UTC(year, month - 1, day, hour - offsetHours, minute, 0));
  const end = new Date(start.getTime() + BOOKING_MINUTES * 60 * 1000);
  return { start, end };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function icsStamp(d: Date) {
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

export function formatLondon(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: BOOKING_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(d);
}

export function makeIcs(opts: {
  start: Date;
  end: Date;
  name: string;
  email: string;
  offer: string;
  notes: string;
}) {
  const uid = `${opts.start.getTime()}-book@rnkstudios.uk`;
  const desc = [
    `Discovery call with RNK Studios.`,
    `Offer: ${opts.offer}`,
    `Booked by: ${opts.name} <${opts.email}>`,
    opts.notes ? `Notes: ${opts.notes}` : "",
  ]
    .filter(Boolean)
    .join("\\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RNK Studios//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(opts.start)}`,
    `DTEND:${icsStamp(opts.end)}`,
    "SUMMARY:RNK Studios — discovery call",
    `DESCRIPTION:${desc}`,
    "LOCATION:Google Meet / to be confirmed",
    `ORGANIZER;CN=RNK Studios:MAILTO:hello@rnkstudios.uk`,
    `ATTENDEE;CN=${opts.name}:MAILTO:${opts.email}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

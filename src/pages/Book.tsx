import { useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import type { OfferSlug } from "../data";
import {
  BOOKING_MINUTES,
  TIME_SLOTS,
  formatLondon,
  makeIcs,
  slotRange,
  upcomingWeekdays,
} from "../booking";

const OFFER_OPTIONS: { value: OfferSlug | "unsure"; label: string }[] = [
  { value: "site", label: "Studio Site" },
  { value: "room", label: "Studio Room" },
  { value: "operator", label: "Studio Operator" },
  { value: "unsure", label: "Not sure yet" },
];

type LocationState = { offer?: OfferSlug };

export function Book() {
  const location = useLocation();
  const preset = (location.state as LocationState | null)?.offer ?? "unsure";
  const days = useMemo(() => upcomingWeekdays(8), []);

  const [day, setDay] = useState(days[0]?.iso ?? "");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [offer, setOffer] = useState(preset);
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState(false);

  const range = day && time ? slotRange(day, time) : null;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!range) return;
    setDone(true);
  }

  function downloadIcs() {
    if (!range) return;
    const ics = makeIcs({
      start: range.start,
      end: range.end,
      name,
      email,
      offer,
      notes,
    });
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rnk-studios-discovery.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  const mailto = range
    ? `mailto:hello@rnkstudios.uk?subject=${encodeURIComponent("Discovery call — " + formatLondon(range.start))}&body=${encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nOffer: ${offer}\nWhen: ${formatLondon(range.start)} (${BOOKING_MINUTES} min, studio time)\n\n${notes}`
      )}`
    : "mailto:hello@rnkstudios.uk";

  if (done && range) {
    return (
      <article className="page">
        <header className="page-hero">
          <p className="eyebrow">Booked — on this prototype</p>
          <h1>You are in the diary.</h1>
          <p className="lede">
            {formatLondon(range.start)} · {BOOKING_MINUTES} minutes, studio
            time. Nothing has been posted to a live calendar yet. Download
            the invite or send it to the studio inbox.
          </p>
          <div className="hero-actions">
            <button className="btn" type="button" onClick={downloadIcs}>
              Download .ics
            </button>
            <a className="btn ghost" href={mailto}>
              Mail hello@rnkstudios.uk
            </a>
          </div>
        </header>
      </article>
    );
  }

  return (
    <article className="page">
      <header className="page-hero">
        <p className="eyebrow">Appointments</p>
        <h1>Forty-five minutes. We say if it fits.</h1>
        <p className="lede">
          A discovery call — not a pitch deck. Bring the job. Weekdays,
          studio time. If you would rather write, use{" "}
          <Link to="/contact">contact</Link>.
        </p>
      </header>

      <form className="book-form" onSubmit={onSubmit}>
        <fieldset className="book-days">
          <legend>Day</legend>
          <div className="day-grid">
            {days.map((d) => (
              <button
                key={d.iso}
                type="button"
                className={`day-chip${day === d.iso ? " is-on" : ""}`}
                onClick={() => setDay(d.iso)}
              >
                <span>{d.label}</span>
                <strong>{d.sub}</strong>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Time · studio</legend>
          <div className="slot-grid">
            {TIME_SLOTS.map((s) => (
              <button
                key={s.value}
                type="button"
                className={`slot-chip${time === s.value ? " is-on" : ""}`}
                onClick={() => setTime(s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="contact-form">
          <label>
            <span>Name</span>
            <input
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            <span>Email</span>
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            <span>What you want to talk about</span>
            <select value={offer} onChange={(e) => setOffer(e.target.value)}>
              {OFFER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Notes · optional</span>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          <button className="btn" type="submit" disabled={!day || !time}>
            Hold this slot
          </button>
        </div>
      </form>
    </article>
  );
}

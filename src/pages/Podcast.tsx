import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ARCHIVE_EPISODES,
  EPISODE_LENGTH_MIN,
  PODCAST_NAME,
  PODCAST_TAGLINE,
  UPCOMING_EPISODES,
  formatDrop,
  getPastFridays,
  getNextFridays,
} from "../podcast";

function WaveMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3 12v0" />
      <path d="M6 9v6" />
      <path d="M9 6v12" />
      <path d="M12 3v18" />
      <path d="M15 6v12" />
      <path d="M18 9v6" />
      <path d="M21 12v0" />
    </svg>
  );
}

function SignupSection() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );
  const [note, setNote] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setState("sending");
    setNote("");
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "podcast" }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setState("done");
      } else {
        setState("error");
        setNote(data.error || "Something went wrong. Try again.");
      }
    } catch {
      setState("error");
      setNote("Could not reach the studio. Try again.");
    }
  }

  if (state === "done") {
    return (
      <section className="podcast-signup done">
        <p className="eyebrow">On the list</p>
        <h2>You'll hear it here first.</h2>
        <p>
          One note when episode one drops — that's it. Until then, the feed
          itself is live if you'd rather point a podcast app at it:{" "}
          <a href="/feed.xml">/feed.xml</a>
        </p>
      </section>
    );
  }

  return (
    <section className="podcast-signup">
      <p className="eyebrow">Launch list</p>
      <h2>One email when the first drop lands.</h2>
      <p className="signup-lede">
        No newsletter, no drip — a single note on launch morning, then silence
        unless you ask for more.
      </p>
      <form onSubmit={onSubmit}>
        <label className="signup-row">
          <span className="visually-hidden">Email</span>
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={state === "sending"}
          />
          <button className="btn" type="submit" disabled={state === "sending"}>
            {state === "sending" ? "Adding…" : "Notify me"}
          </button>
        </label>
        {state === "error" && <p className="signup-error">{note}</p>}
      </form>
    </section>
  );
}

export function Podcast() {
  const upcomingDates = getNextFridays(UPCOMING_EPISODES.length);
  const archiveDates = getPastFridays(ARCHIVE_EPISODES.length);
  const [thisWeek, ...laterUpcoming] = UPCOMING_EPISODES;

  return (
    <article className="page podcast-page">
      <header className="page-hero">
        <p className="eyebrow">
          <WaveMark className="wave-mark" /> The RNK Studios podcast
        </p>
        <h1>{PODCAST_NAME}</h1>
        <p className="lede">{PODCAST_TAGLINE}</p>
        <p className="podcast-cadence">
          New episodes drop <strong>Fridays · 9:00 AM</strong> · about{" "}
          {EPISODE_LENGTH_MIN} minutes · launching soon
        </p>
        <p className="podcast-feed-line">
          The feed is live: <a href="/feed.xml">/feed.xml</a> — point Apple
          Podcasts and Spotify at it on launch day.
        </p>
      </header>

      <figure className="bleed-figure podcast-cover-figure">
        <img
          src="/images/podcast-cover.svg"
          alt={`${PODCAST_NAME} — square cover art: a broadcast tower inside an upright book, signal rings rising from the pages.`}
        />
      </figure>

      <section className="podcast-next-drop">
        <p className="eyebrow">This Friday</p>
        <h2>
          Episode {thisWeek.number} — {thisWeek.title}
        </h2>
        <p className="podcast-drop-date">{formatDrop(upcomingDates[0])} · 9:00 AM</p>
        <p>{thisWeek.description}</p>
      </section>

      <section className="podcast-section">
        <header className="section-head">
          <p className="eyebrow">Then, weekly</p>
          <h2>The next Fridays.</h2>
        </header>
        <ol className="episode-list">
          {laterUpcoming.map((ep, i) => (
            <li key={ep.number} className="episode-row">
              <span className="episode-num">{ep.number}</span>
              <span className="episode-body">
                <span className="episode-title">{ep.title}</span>
                <span className="episode-desc">{ep.description}</span>
              </span>
              <span className="episode-date">
                {formatDrop(upcomingDates[i + 1])} · 9 AM
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="podcast-section">
        <header className="section-head">
          <p className="eyebrow">In the can</p>
          <h2>Recorded ahead of launch, so the feed is never empty.</h2>
        </header>
        <ol className="episode-list">
          {ARCHIVE_EPISODES.map((ep, i) => (
            <li key={ep.number} className="episode-row">
              <span className="episode-num">{ep.number}</span>
              <span className="episode-body">
                <span className="episode-title">{ep.title}</span>
                <span className="episode-desc">{ep.description}</span>
              </span>
              <span className="episode-date">
                {formatDrop(archiveDates[i])} · 9 AM
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="podcast-about prose">
        <h2>What the show covers</h2>
        <p>
          Two crafts, one discipline. The build side: self-hosted
          infrastructure, security systems, privacy systems — the unglamorous
          work of keeping things up. The write side: novels, focus, and the
          long middle — staying on task when the rejections stack up.
        </p>
        <p>
          Same rule underneath both: resilience is built before it is needed.
          The show is the work log.
        </p>
      </section>

      <SignupSection />

      <section className="cta-band compact">
        <h2>Want to know when the first drop lands?</h2>
        <p>The feed goes live with episode one. Until then, the studio door:</p>
        <div className="hero-actions">
          <Link className="btn" to="/book">
            Book a call
          </Link>
          <Link className="btn ghost" to="/family">
            Meet the family
          </Link>
        </div>
      </section>
    </article>
  );
}

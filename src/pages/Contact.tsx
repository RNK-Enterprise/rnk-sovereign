import { useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import type { OfferSlug } from "../data";

const OFFER_OPTIONS: { value: OfferSlug | "unsure"; label: string }[] = [
  { value: "site", label: "Studio Site — web, domain, mail, hosting" },
  { value: "room", label: "Studio Room — live rooms / Foundry" },
  { value: "operator", label: "Studio Operator — one written job" },
  { value: "unsure", label: "Not sure yet" },
];

type LocationState = { offer?: OfferSlug };

export function Contact() {
  const location = useLocation();
  const preset = (location.state as LocationState | null)?.offer ?? "unsure";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [offer, setOffer] = useState<string>(preset);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const mailto = useMemo(() => {
    const subject = encodeURIComponent(`RNK enquiry — ${offer}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nOffer: ${offer}\n\n${message}`
    );
    return `mailto:hello@rnkstudios.uk?subject=${subject}&body=${body}`;
  }, [name, email, offer, message]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <article className="page">
        <header className="page-hero">
          <p className="eyebrow">Contact</p>
          <h1>Received — on this prototype, locally.</h1>
          <p className="lede">
            Nothing has been posted to a server yet. If you want it in the
            studio inbox now, send the prepared mail.
          </p>
          <a className="btn" href={mailto}>
            Open mail to hello@rnkstudios.uk
          </a>
        </header>
      </article>
    );
  }

  return (
    <article className="page">
      <header className="page-hero">
        <p className="eyebrow">Contact</p>
        <h1>Tell us the job.</h1>
        <p className="lede">
          A site, a room, or an operator. If it is none of those, say that too.
          Prototype form — it will not hit a backend until this is live. Prefer
          a call? <Link to="/book">Book forty-five minutes</Link>.
        </p>
      </header>

      <form className="contact-form" onSubmit={onSubmit}>
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
          <span>What fits</span>
          <select value={offer} onChange={(e) => setOffer(e.target.value)}>
            {OFFER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>The job, in a few lines</span>
          <textarea
            required
            rows={7}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>
        <button className="btn" type="submit">
          Send
        </button>
        <p className="form-note">
          Or write directly to{" "}
          <a href="mailto:hello@rnkstudios.uk">hello@rnkstudios.uk</a>
          , or open the studio chat.
        </p>
      </form>
    </article>
  );
}

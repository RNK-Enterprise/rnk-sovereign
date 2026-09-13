import { Link } from "react-router-dom";

export function Jenn() {
  return (
    <article className="page">
      <header className="page-hero">
        <p className="eyebrow">Case · Presence</p>
        <h1>Bridge with Jenn</h1>
        <p className="lede">
          A public site for a human who sits with co-parents in conflict.
          Booking, intake, her Common Ground podcast, resources, donate — no
          chatbot on the door.
        </p>
      </header>

      <figure className="bleed-figure">
        <img
          src="/images/jenn.jpg"
          alt="Portrait used on the Bridge with Jenn site."
        />
      </figure>

      <div className="prose">
        <h2>The job</h2>
        <p>
          Jenn needed a place that felt like a conversation, not a landing page
          farm. People arrive raw. The site has to stay calm, confidential in
          tone, and obvious about the next step: share your side, or book.
        </p>
        <h2>What we built</h2>
        <p>
          A Next.js site: home, share-your-side, book, her podcast pages
          (Common Ground — hers, not the studio's), resources, donate,
          thank-you. Intake and booking forms. Resource articles and
          downloads. A voice that does not sound like a template.
        </p>
        <h2>What it proves</h2>
        <p>
          Presence work for a person, not a brand committee. Forms that go
          somewhere. A stack we can host and keep.
        </p>
      </div>

      <section className="cta-band compact">
        <h2>Need a site like this?</h2>
        <p>That is Studio Site — design, build, host, mail, the boring parts.</p>
        <div className="hero-actions">
          <Link className="btn" to="/offers/site">
            Studio Site
          </Link>
          <Link className="btn ghost" to="/book">
            Book a call
          </Link>
        </div>
      </section>
    </article>
  );
}

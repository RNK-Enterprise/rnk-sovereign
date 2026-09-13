import { Link } from "react-router-dom";

const CASES = [
  {
    to: "/work/jenn",
    img: "/images/jenn.jpg",
    alt: "Portrait used on the Bridge with Jenn site.",
    kicker: "Presence · Coaching",
    title: "Bridge with Jenn",
    blurb:
      "A calm public site for co-parent coaching: share your side, book a session, her Common Ground podcast, resources, donate.",
  },
  {
    to: "/podcast",
    img: "/images/podcast-card.svg",
    alt: "A broadcast mast rising from an open book, signal rings spreading from its tip.",
    kicker: "Presence · Podcast",
    title: "Resilience Never Kneels",
    blurb:
      "The studio's own show: infrastructure, security, and privacy systems that stay up — and novels that survive the rejections. Fridays, 9 AM.",
  },
];

export function Work() {
  return (
    <article className="page">
      <header className="page-hero">
        <p className="eyebrow">Work</p>
        <h1>Examples. Built, then run.</h1>
        <p className="lede">
          A presence site for a person, and the studio's own podcast as
          presence work. Civilian only. If it cannot be shown, it is not here.
        </p>
      </header>

      <div className="work-list">
        {CASES.map((c) => (
          <Link key={c.to} to={c.to} className="case-card case-card-page">
            <img src={c.img} alt={c.alt} />
            <div className="case-copy">
              <p className="eyebrow">{c.kicker}</p>
              <h2>{c.title}</h2>
              <p>{c.blurb}</p>
              <span className="text-link">
                {c.to === "/podcast" ? "Hear the plan" : "Read the case"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </article>
  );
}

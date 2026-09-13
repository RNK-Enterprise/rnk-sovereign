import { Link } from "react-router-dom";
import { FAMILY_DORMANT, FAMILY_LIVE } from "../family";

export function Family() {
  return (
    <article className="page">
      <header className="page-hero">
        <p className="eyebrow">The family</p>
        <h1>One studio. Several doors.</h1>
        <p className="lede">
          RNK Studios designs a thing, then runs it. These are the things —
          each one independent, each one with its own door. The live ones are
          up now; the rest wait their turn.
        </p>
      </header>

      <div className="work-list">
        {FAMILY_LIVE.map((s) => (
          <a
            key={s.url}
            href={s.url}
            className="case-card case-card-page"
            target="_blank"
            rel="noreferrer"
          >
            <img src={s.img} alt={s.alt} />
            <div className="case-copy">
              <p className="eyebrow">{s.kicker}</p>
              <h2>{s.name}</h2>
              <p>{s.blurb}</p>
              <span className="text-link">{s.host} ↗</span>
            </div>
          </a>
        ))}
      </div>

      <div className="family-dormant">
        <header className="section-head">
          <p className="eyebrow">Coming soon</p>
          <h2>Built, resting — waiting for a door of their own.</h2>
        </header>
        <ul className="family-dormant-list">        {FAMILY_DORMANT.map((s) => (
          <li key={s.name} className="family-dormant-row">
              <img src={s.img} alt={s.alt} />
              <div>
                <p className="eyebrow">{s.kicker}</p>
                <h3>{s.name}</h3>
                <p>{s.blurb}</p>
                {s.path ? (
                  <Link className="text-link" to={s.path}>
                    See the plan ↗
                  </Link>
                ) : (
                  <span className="coming-soon-tag">Coming soon</span>
                )}
              </div>
            </li>
        ))}
        </ul>
      </div>
    </article>
  );
}

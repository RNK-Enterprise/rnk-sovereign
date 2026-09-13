import { Link, Navigate, useParams } from "react-router-dom";
import { getOffer, offers } from "../data";

export function OfferDetail() {
  const { slug } = useParams();
  const offer = getOffer(slug);

  if (!offer) return <Navigate to="/offers" replace />;

  const others = offers.filter((o) => o.slug !== offer.slug);

  return (
    <article className="page">
      <header className="page-hero">
        <p className="eyebrow">
          {offer.num} · {offer.kicker}
        </p>
        <h1>{offer.name}</h1>
        <p className="lede">{offer.intro}</p>
        <p className="pay-chip">{offer.pay}</p>
      </header>

      <figure className="bleed-figure">
        <img src={offer.image} alt={offer.imageAlt} />
      </figure>

      <div className="split-lists">
        <section>
          <h2>What is in</h2>
          <ul>
            {offer.included.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2>What is out</h2>
          <ul>
            {offer.excluded.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="cta-band compact">
        <h2>If this is the job, say so.</h2>
        <Link className="btn" to="/contact" state={{ offer: offer.slug }}>
          Start with {offer.name}
        </Link>
      </section>

      <nav className="other-offers" aria-label="Other offers">
        {others.map((o) => (
          <Link key={o.slug} to={`/offers/${o.slug}`}>
            <span className="eyebrow">{o.num}</span>
            <strong>{o.name}</strong>
            <span>{o.oneLiner}</span>
          </Link>
        ))}
      </nav>
    </article>
  );
}

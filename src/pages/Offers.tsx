import { Link } from "react-router-dom";
import { offers } from "../data";

export function Offers() {
  return (
    <article className="page">
      <header className="page-hero">
        <p className="eyebrow">Offers</p>
        <h1>Three, not twelve.</h1>
        <p className="lede">
          Presence is the business. Rooms are operations. Operators are a
          practice. Everything else is a statement of work under one of these.
        </p>
      </header>

      <div className="offer-grid">
        {offers.map((offer) => (
          <Link
            key={offer.slug}
            to={`/offers/${offer.slug}`}
            className="offer-card"
          >
            <img src={offer.image} alt={offer.imageAlt} />
            <div className="offer-card-body">
              <p className="eyebrow">
                {offer.num} · {offer.kicker}
              </p>
              <h2>{offer.name}</h2>
              <p>{offer.oneLiner}</p>
              <p className="offer-pay">{offer.pay}</p>
            </div>
          </Link>
        ))}
      </div>
    </article>
  );
}

import { Link } from "react-router-dom";
import { offers } from "../data";
import { FAMILY_LIVE } from "../family";
import { DropBadge } from "../components/DropBadge";

export function Home() {
  return (
    <>
      <section className="hero-billboard">
        <img
          src="/images/lockup.jpg"
          alt="RNK Studios — web design, hosting, LiveKit, custom builds, troubleshooting."
        />
        <div className="hero-billboard-bar">
          <p>
            We design a thing. Then we run it — sites, mail, live rooms, and
            the stack underneath.
          </p>
          <div className="hero-actions">
            <Link className="btn" to="/book">
              Book a call
            </Link>
            <Link className="btn ghost" to="/offers">
              The three offers
            </Link>
            <Link className="btn ghost quiet" to="/podcast">
              The podcast · <DropBadge />
            </Link>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="band-copy">
          <p className="eyebrow">What this is</p>
          <h2>One company. Three offers. Nothing else on the door.</h2>
          <p>
            Websites start the conversation. Hosting and mail make the monthly
            money. Rooms and Foundry are specialist work. Operators wait until
            the job is written down.
          </p>
        </div>
        <figure className="band-figure">
          <img
            src="/images/desk.jpg"
            alt="Studio desk with paper website sketches, lamp, and a closed laptop."
          />
        </figure>
      </section>

      <section className="offers-index">
        <header className="section-head">
          <p className="eyebrow">Offers</p>
          <h2>If it does not fit one of these, it is not RNK work yet.</h2>
        </header>
        <ol className="offer-list">
          {offers.map((offer) => (
            <li key={offer.slug}>
              <Link to={`/offers/${offer.slug}`} className="offer-row">
                <span className="offer-num">{offer.num}</span>
                <span className="offer-body">
                  <span className="offer-kicker">{offer.kicker}</span>
                  <span className="offer-name">{offer.name}</span>
                  <span className="offer-line">{offer.oneLiner}</span>
                </span>
                <span className="offer-pay">{offer.pay}</span>
                <span className="offer-go" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="family-tease">
        <header className="section-head light">
          <p className="eyebrow">The family</p>
          <h2>Three doors open now. More built than the door shows.</h2>
        </header>
        <div className="family-tease-grid">
          {FAMILY_LIVE.map((s) => (
            <a
              key={s.url}
              href={s.url}
              className="family-tease-card"
              target="_blank"
              rel="noreferrer"
            >
              <img src={s.img} alt={s.alt} />
              <div className="family-tease-copy">
                <p className="eyebrow">{s.kicker}</p>
                <h3>{s.name}</h3>
                <p>{s.host} ↗</p>
              </div>
            </a>
          ))}
        </div>
        <div className="family-tease-foot">
          <Link className="btn ghost" to="/family">
            Meet the family
          </Link>
        </div>
      </section>

      <section className="work-tease">
        <header className="section-head light">
          <p className="eyebrow">From the studio</p>
          <h2>Resilience Never Kneels — the studio podcast.</h2>
        </header>
        <Link to="/podcast" className="case-card">
          <img
            src="/images/podcast-card.svg"
            alt="A broadcast mast rising from an open book, signal rings spreading from its tip."
          />
          <div className="case-copy">
            <p className="eyebrow">Presence · Podcast</p>
            <h3>Resilience Never Kneels</h3>
            <p>
              Building infrastructure, security, and privacy systems that stay
              up — and novels that survive the rejections. New episodes every
              Friday, 9 AM.
            </p>
            <span className="text-link">Hear the plan</span>
          </div>
        </Link>
      </section>

      <section className="book-tease">
        <div>
          <p className="eyebrow">Shop</p>
          <h2>Foundry modules, on the till.</h2>
          <p>
            Vellum, Cyphur, Illumination, Roster, Item Transfer — built for
            tables we actually run.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="btn" to="/shop">
            Open the shop
          </Link>
          <Link className="btn ghost" to="/pricing">
            Service rates
          </Link>
        </div>
      </section>

      <section className="book-tease">
        <div>
          <p className="eyebrow">Appointments</p>
          <h2>Forty-five minutes. We say if it fits.</h2>
          <p>
            A discovery call, weekdays, studio time. Bring the job. If you would
            rather write, use contact.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="btn" to="/book">
            Schedule a call
          </Link>
          <Link className="btn ghost" to="/contact">
            Write instead
          </Link>
        </div>
      </section>
    </>
  );
}

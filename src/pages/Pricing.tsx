import { Link } from "react-router-dom";

const TIERS = [
  {
    offer: "Studio Site",
    href: "/offers/site",
    keep: "from $29 / month",
    note: "Design, build, domain in your name, DNS, mail, hosting, backups, a small change allowance.",
  },
  {
    offer: "Studio Room",
    href: "/offers/room",
    keep: "from $19 / month",
    note: "LiveKit and / or Foundry on your domain. Operations, not a one-off install.",
  },
  {
    offer: "Studio Operator",
    href: "/offers/operator",
    keep: "from $39 / month",
    note: "One written job, a corpus we keep fresh, evaluation you can read.",
  },
];

const EXTRAS = [
  ["Foundry system / module engineering", "from $250 / week, or a scoped SOW"],
  ["LiveKit add-on on an existing Site", "from $12 / month"],
  ["Extra mailbox pack (5)", "$5 / month"],
  ["Out-of-hours restore", "$35"],
];

export function Pricing() {
  return (
    <article className="page">
      <header className="page-hero">
        <p className="eyebrow">Pricing</p>
        <h1>Solo rates. No agency markup.</h1>
        <p className="lede">
          Prototype list in USD. Built to undercut shops that charge three
          times this for the same stack. The quote still matches the work.
          Modules: <Link to="/shop">the shop</Link>.
        </p>
      </header>

      <div className="price-grid">
        {TIERS.map((t) => (
          <section key={t.offer} className="price-card">
            <p className="eyebrow">{t.offer}</p>
            <p className="price-build">{t.keep}</p>
            <p>{t.note}</p>
            <Link className="text-link" to={t.href}>
              What’s in
            </Link>
          </section>
        ))}
      </div>

      <section className="split-lists">
        <div>
          <h2>Add-ons</h2>
          <ul>
            {EXTRAS.map(([k, v]) => (
              <li key={k}>
                <strong>{k}</strong>
                <span className="price-side">{v}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>What “from” means</h2>
          <p className="prose-inline">
            The floor is meant to be easy to say yes to. A one-page brochure
            stays near the floor. A custom app does not. If it does not fit,
            we say no rather than invent a fourth column.
          </p>
          <div className="hero-actions" style={{ marginTop: 24 }}>
            <Link className="btn" to="/book">
              Book a call
            </Link>
            <Link className="btn ghost" to="/shop">
              Module shop
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}

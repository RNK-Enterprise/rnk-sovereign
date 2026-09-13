import { Link } from "react-router-dom";
import { useCart } from "../cart";
import { bundle, formatGbp, products } from "../shop";

export function Shop() {
  const cart = useCart();

  return (
    <article className="page">
      <header className="page-hero">
        <p className="eyebrow">Shop · Foundry VTT</p>
        <h1>Modules we built for the table.</h1>
        <p className="lede">
          Civilian work only. Manifests and download links follow once payment
          is live — this till takes an order ticket, not a card yet.{" "}
          {cart.count > 0 && (
            <Link to="/shop/checkout">Cart · {formatGbp(cart.total)}</Link>
          )}
        </p>
      </header>

      <section className="bundle-card">
        <div>
          <p className="eyebrow">{bundle.kicker}</p>
          <h2>{bundle.name}</h2>
          <p>{bundle.blurb}</p>
        </div>
        <div className="bundle-buy">
          <p className="price-build">{formatGbp(bundle.price)}</p>
          <button className="btn" type="button" onClick={() => cart.add(bundle.slug)}>
            Add bundle
          </button>
        </div>
      </section>

      <div className="product-grid">
        {products.map((p) => (
          <article key={p.slug} className="product-card">
            <p className="eyebrow">
              {p.kicker} · {p.foundry}
            </p>
            <h2>
              <Link to={`/shop/${p.slug}`}>{p.name}</Link>
            </h2>
            <p>{p.blurb}</p>
            <div className="product-foot">
              <span className="price-build">{formatGbp(p.price)}</span>
              <button className="btn" type="button" onClick={() => cart.add(p.slug)}>
                Add
              </button>
            </div>
          </article>
        ))}
      </div>
    </article>
  );
}

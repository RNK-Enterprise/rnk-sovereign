import { Link, Navigate, useParams } from "react-router-dom";
import { useCart } from "../use-cart";
import { formatGbp, getProduct } from "../shop";

export function Product() {
  const { slug } = useParams();
  const product = getProduct(slug);
  const cart = useCart();
  if (!product) return <Navigate to="/shop" replace />;

  return (
    <article className="page">
      <header className="page-hero">
        <p className="eyebrow">
          <Link to="/shop">Shop</Link> · {product.kicker} · {product.foundry}
        </p>
        <h1>{product.name}</h1>
        <p className="lede">{product.body}</p>
        <p className="pay-chip">
          {formatGbp(product.price)} · v{product.version}
        </p>
        <div className="hero-actions">
          <button className="btn" type="button" onClick={() => cart.add(product.slug)}>
            Add to cart
          </button>
          <Link className="btn ghost" to="/shop/checkout">
            Cart
          </Link>
        </div>
      </header>
      <div className="split-lists">
        <section>
          <h2>In the zip</h2>
          <ul>
            {product.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2>Licence</h2>
          <p>
            One Foundry world per purchase until the live till says otherwise.
            No card on this prototype — checkout opens an order ticket to the
            studio.
          </p>
        </section>
      </div>
    </article>
  );
}

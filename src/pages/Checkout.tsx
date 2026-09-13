import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../use-cart";
import { formatGbp, getProduct } from "../shop";

export function Checkout() {
  const cart = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [foundry, setFoundry] = useState("");
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const items = useMemo(
    () =>
      cart.lines
        .map((l) => {
          const p = getProduct(l.slug);
          return p ? { ...l, product: p } : null;
        })
        .filter((x) => x !== null),
    [cart.lines]
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          foundry,
          notes,
          lines: cart.lines,
          total: cart.total,
        }),
      });
      const data = (await res.json()) as { ok?: boolean };
      if (!data.ok) throw new Error("fail");
      cart.clear();
      setDone(true);
    } catch {
      setError("Could not lodge the ticket. Try chat, or mail hello@rnkstudios.uk.");
    }
  }

  if (done) {
    return (
      <article className="page">
        <header className="page-hero">
          <p className="eyebrow">Shop</p>
          <h1>Order ticket in.</h1>
          <p className="lede">
            No card was taken. You’ll get a pay link and a manifest when the
            till is live. Until then this is a studio ticket.
          </p>
          <Link className="btn" to="/shop">
            Back to the shop
          </Link>
        </header>
      </article>
    );
  }

  return (
    <article className="page">
      <header className="page-hero">
        <p className="eyebrow">Checkout</p>
        <h1>Order ticket. Not a card yet.</h1>
        <p className="lede">
          Prototype till. We take the order, then send a pay link. Modules are
          not unlocked from this page.
        </p>
      </header>

      {items.length === 0 ? (
        <p>
          Cart is empty. <Link to="/shop">Shop</Link>
        </p>
      ) : (
        <div className="checkout-grid">
          <ul className="cart-lines">
            {items.map((l) => (
              <li key={l.slug}>
                <div>
                  <strong>{l.product.name}</strong>
                  <span>
                    {formatGbp(l.product.price)} × {l.qty}
                  </span>
                </div>
                <button
                  type="button"
                  className="text-link"
                  onClick={() => cart.setQty(l.slug, 0)}
                >
                  Remove
                </button>
              </li>
            ))}
            <li className="cart-total">
              <strong>Total</strong>
              <strong>{formatGbp(cart.total)}</strong>
            </li>
          </ul>

          <form className="contact-form" onSubmit={onSubmit}>
            <label>
              <span>Name</span>
              <input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>
              <span>Email</span>
              <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
              <span>Foundry username · optional</span>
              <input value={foundry} onChange={(e) => setFoundry(e.target.value)} />
            </label>
            <label>
              <span>Notes · optional</span>
              <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
            {error && <p className="form-note">{error}</p>}
            <button className="btn" type="submit">
              Lodge ticket · {formatGbp(cart.total)}
            </button>
          </form>
        </div>
      )}
    </article>
  );
}

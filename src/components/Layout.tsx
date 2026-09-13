import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ChatDock } from "./ChatDock";
import { DropBadge } from "./DropBadge";
import { Mark } from "./Mark";
import { useCart } from "../use-cart";
import { formatGbp } from "../shop";

const NAV = [
  { to: "/work", label: "Work" },
  { to: "/family", label: "Family" },
  { to: "/podcast", label: "Podcast" },
  { to: "/offers", label: "Offers" },
  { to: "/shop", label: "Shop" },
  { to: "/pricing", label: "Pricing" },
  { to: "/book", label: "Book" },
  { to: "/contact", label: "Contact" },
];

export function Layout() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cart = useCart();

  // Close the menu when the route changes — event-driven instead of a
  // state-setting effect: NavLink in the drawer already closes it via
  // onClick, so this only covers non-link navigations.
  useEffect(() => {
    function close() {
      setOpen(false);
    }
    window.addEventListener("popstate", close);
    return () => window.removeEventListener("popstate", close);
  }, []);

  // New page: start at the top. This one is the actual external-system
  // sync the effect rule allows (scroll position is not React state).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("nav-open", open);
    return () => document.body.classList.remove("nav-open");
  }, [open]);

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>

      <div className="grain" aria-hidden="true" />

      <aside className="proto">
        <p>
          <strong>Prototype.</strong> Company door only — the Art RPG,
          Minecraft and the store stay off this root. Not live, not a quote.
        </p>
        <span className="proto-tag">rnkstudios.uk</span>
      </aside>

      <header className={`nav${scrolled ? " is-stuck" : ""}`}>
        <Link className="brand" to="/" aria-label="RNK Studios home">
          <Mark />
          <span className="brand-type">
            <span className="brand-name">RNK Studios</span>
            <span className="brand-sub">Design &amp; operations</span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
              {item.to === "/podcast" && <DropBadge />}
            </NavLink>
          ))}
          {cart.count > 0 && (
            <Link className="nav-cart" to="/shop/checkout">
              Cart {cart.count} · {formatGbp(cart.total)}
            </Link>
          )}
          <Link className="nav-cta" to="/book">
            Book a call
          </Link>
        </nav>

        <button
          className="menu-btn"
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </header>

      <div className={`drawer${open ? " is-open" : ""}`} id="menu">
        <nav className="drawer-links" aria-label="Mobile">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}>
              {item.label}
            </NavLink>
          ))}
          {cart.count > 0 && (
            <Link className="nav-cart" to="/shop/checkout" onClick={() => setOpen(false)}>
              Cart {cart.count} · {formatGbp(cart.total)}
            </Link>
          )}
          <Link className="nav-cta" to="/book" onClick={() => setOpen(false)}>
            Book a call
          </Link>
        </nav>
      </div>

      <main id="main">
        <Outlet />
      </main>

      <footer className="site-foot">
        <div className="foot-grid">
          <div>
            <Link className="brand foot-brand" to="/">
              <Mark size={32} />
              <span className="brand-type">
                <span className="brand-name">RNK Studios</span>
                <span className="brand-sub">Design &amp; operations</span>
              </span>
            </Link>
            <p className="foot-line">
              We design a thing. Then we run it.
            </p>
          </div>
          <div>
            <p className="foot-label">Offers</p>
            <Link to="/offers/site">Studio Site</Link>
            <Link to="/offers/room">Studio Room</Link>
            <Link to="/offers/operator">Studio Operator</Link>
            <Link to="/pricing">Pricing</Link>
          </div>
          <div>
            <p className="foot-label">Studio</p>
            <Link to="/work">Work</Link>
            <Link to="/family">Family</Link>
            <Link to="/shop">Shop</Link>
            <Link to="/process">Process</Link>
            <Link to="/book">Book</Link>
            <Link to="/contact">Contact</Link>
            <a href="mailto:hello@rnkstudios.uk">hello@rnkstudios.uk</a>
          </div>
          <div>
            <p className="foot-label">Legal</p>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <p className="foot-note">
              Prototype copy. Company, DPA and ICO follow if this becomes live.
            </p>
          </div>
        </div>
        <p className="foot-end">
          © {new Date().getFullYear()} RNK Studios. Civilian work only.
        </p>
      </footer>
      <ChatDock />
    </>
  );
}

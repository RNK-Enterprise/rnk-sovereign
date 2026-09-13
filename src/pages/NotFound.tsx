import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <article className="page">
      <header className="page-hero">
        <p className="eyebrow">404</p>
        <h1>Nothing here.</h1>
        <p className="lede">
          The page you wanted is not on this prototype. The podcast plan and
          the family doors are a click away.
        </p>
        <div className="hero-actions">
          <Link className="btn" to="/">
            Home
          </Link>
          <Link className="btn ghost" to="/podcast">
            The podcast
          </Link>
        </div>
      </header>
    </article>
  );
}

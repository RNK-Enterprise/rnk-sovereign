import { useMemo, useState, type ReactNode } from "react";
import { bundle, getProduct, products } from "./shop";
import { CartCtx, type CartApi, type Line } from "./cart-context";

const KEY = "rnk-shop-cart";

function read(): Line[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Line[]) : [];
  } catch {
    return [];
  }
}

function write(lines: Line[]) {
  localStorage.setItem(KEY, JSON.stringify(lines));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>(() =>
    typeof localStorage === "undefined" ? [] : read()
  );

  function commit(next: Line[]) {
    write(next);
    setLines(next);
  }

  const api = useMemo<CartApi>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const total = lines.reduce((n, l) => {
      const p = getProduct(l.slug);
      return n + (p ? p.price * l.qty : 0);
    }, 0);
    return {
      lines,
      count,
      total,
      add(slug) {
        const known =
          slug === bundle.slug || products.some((p) => p.slug === slug);
        if (!known) return;
        const next = [...lines];
        const i = next.findIndex((l) => l.slug === slug);
        if (i >= 0) next[i] = { ...next[i], qty: next[i].qty + 1 };
        else next.push({ slug, qty: 1 });
        commit(next);
      },
      setQty(slug, qty) {
        commit(
          qty <= 0
            ? lines.filter((l) => l.slug !== slug)
            : lines.map((l) => (l.slug === slug ? { ...l, qty } : l))
        );
      },
      clear() {
        commit([]);
      },
    };
  }, [lines]);

  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>;
}

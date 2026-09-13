import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { bundle, getProduct, products } from "./shop";

const KEY = "rnk-shop-cart";

export type Line = { slug: string; qty: number };

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

type CartApi = {
  lines: Line[];
  count: number;
  total: number;
  add: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
};

const CartCtx = createContext<CartApi | null>(null);

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

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart");
  return ctx;
}

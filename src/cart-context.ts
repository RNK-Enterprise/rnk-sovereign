import { createContext } from "react";

export type Line = { slug: string; qty: number };

export type CartApi = {
  lines: Line[];
  count: number;
  total: number;
  add: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
};

// Lives in its own zero-component module so both the provider (cart.tsx)
// and the hook (use-cart.ts) can import it without either file mixing
// component and non-component exports (fast-refresh rule).
export const CartCtx = createContext<CartApi | null>(null);

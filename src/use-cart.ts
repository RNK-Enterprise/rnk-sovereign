import { useContext } from "react";
import { CartCtx, type CartApi } from "./cart-context";

export function useCart(): CartApi {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

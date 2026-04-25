import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartItem, Coupon, Product } from "./types";
import { COUPONS } from "./data";

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  discount: number;
  total: number;
  appliedCoupon: Coupon | null;
  add: (p: Product, qty?: number) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, qty: number) => void;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  clearCoupon: () => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "bakeease.cart";
const COUPON_KEY = "bakeease.coupon";
const DELIVERY_FEE = 49;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setItems(JSON.parse(raw));
      } catch {
        // ignore
      }
    }
    const c = localStorage.getItem(COUPON_KEY);
    if (c) {
      try {
        setAppliedCoupon(JSON.parse(c));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (appliedCoupon) localStorage.setItem(COUPON_KEY, JSON.stringify(appliedCoupon));
    else localStorage.removeItem(COUPON_KEY);
  }, [appliedCoupon]);

  const add = (p: Product, qty = 1) =>
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === p.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === p.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { product: p, quantity: qty }];
    });

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.product.id !== id));

  const setQuantity = (id: string, qty: number) =>
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.product.id !== id)
        : prev.map((i) => (i.product.id === id ? { ...i, quantity: qty } : i))
    );

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.product.price * i.quantity, 0),
    [items]
  );

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (subtotal < appliedCoupon.minOrderValue) return 0;
    return Math.round((subtotal * appliedCoupon.discountPct) / 100);
  }, [appliedCoupon, subtotal]);

  const total = Math.max(0, subtotal - discount + (items.length > 0 ? DELIVERY_FEE : 0));

  const applyCoupon = (code: string) => {
    const found = COUPONS.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!found) return { ok: false, message: "Invalid coupon code" };
    if (subtotal < found.minOrderValue)
      return { ok: false, message: `Minimum order ₹${found.minOrderValue} required` };
    setAppliedCoupon(found);
    return { ok: true, message: `${found.discountPct}% off applied!` };
  };

  const clearCoupon = () => setAppliedCoupon(null);
  const clear = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        discount,
        total,
        appliedCoupon,
        add,
        remove,
        setQuantity,
        applyCoupon,
        clearCoupon,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export { DELIVERY_FEE };

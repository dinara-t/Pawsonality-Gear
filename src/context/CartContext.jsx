import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "pawsonality_cart_v1";

function safeJsonParse(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function clamp(n, min, max) {
  const v = Number(n);
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(v, max));
}

function buildLineId(productId, variantId) {
  return `${productId}_${variantId || "default"}`;
}

function normaliseVariant(product, variantId) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const v = variants.find((x) => x?.id === variantId) || variants[0] || null;
  const resolvedId = variantId || v?.id || "default";
  const label = v?.label || resolvedId;

  const stock = Number(v?.quantity ?? 0);
  return { variantId: resolvedId, variantLabel: label, variantStock: stock };
}

function toCartLine(product, variantId, qty) {
  const productId = product?.id || "";
  const name = product?.name || "";
  const imageUrl = product?.imageUrl || "";
  const price = Number(product?.price ?? 0);
  const type = product?.type || "";

  const {
    variantId: resolvedVariantId,
    variantLabel,
    variantStock,
  } = normaliseVariant(product, variantId);

  const safeQty = clamp(qty, 1, variantStock > 0 ? variantStock : 1);

  return {
    id: buildLineId(productId, resolvedVariantId),
    productId,
    name,
    imageUrl,
    price,
    type,
    variants: Array.isArray(product?.variants) ? product.variants : [],
    variantId: resolvedVariantId,
    variantLabel,
    variantStock,
    qty: safeQty,
  };
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const loaded = safeJsonParse(raw, []);
    if (Array.isArray(loaded)) setCartItems(loaded);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  function addToCart(product, variantId, qty = 1) {
    const productId = product?.id || "";
    if (!productId) return;

    const line = toCartLine(product, variantId, qty);

    setCartItems((prev) => {
      const existing = prev.find((x) => x.id === line.id);
      if (!existing) return [...prev, line];

      const maxStock =
        line.variantStock > 0 ? line.variantStock : existing.qty + line.qty;
      const nextQty = clamp((existing.qty || 0) + (line.qty || 0), 1, maxStock);

      return prev.map((x) => (x.id === line.id ? { ...x, qty: nextQty } : x));
    });
  }

  function updateQty(lineId, nextQty) {
    setCartItems((prev) => {
      const item = prev.find((x) => x.id === lineId);
      if (!item) return prev;

      const maxStock = Number(item.variantStock ?? 0);
      const max = maxStock > 0 ? maxStock : 99;
      const qty = clamp(nextQty, 1, max);

      return prev.map((x) => (x.id === lineId ? { ...x, qty } : x));
    });
  }

  function removeItem(lineId) {
    setCartItems((prev) => prev.filter((x) => x.id !== lineId));
  }

  function clearCart() {
    setCartItems([]);
  }

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = Number(item?.price ?? 0);
      const qty = Number(item?.qty ?? 0);
      return sum + price * qty;
    }, 0);

    const count = cartItems.reduce(
      (sum, item) => sum + Number(item?.qty ?? 0),
      0
    );

    return { subtotal, count };
  }, [cartItems]);

  const value = useMemo(() => {
    return {
      cartItems,
      addToCart,
      updateQty,
      removeItem,
      clearCart,
      subtotal: totals.subtotal,
      itemCount: totals.count,
    };
  }, [cartItems, totals]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}

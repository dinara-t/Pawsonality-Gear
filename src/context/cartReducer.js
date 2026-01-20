function clamp(n, min, max) {
  const v = Number(n);
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(v, max));
}

function buildLineId(productId, variantId) {
  return `${productId}_${variantId || "default"}`;
}

function resolveVariant(product, variantId) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const found =
    variants.find((v) => v?.id === variantId) || variants[0] || null;
  const id = variantId || found?.id || "default";
  const label = found?.label || id;
  const stock = Number(found?.quantity ?? 0);
  return { variantId: id, variantLabel: label, variantStock: stock, variants };
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
    variants,
  } = resolveVariant(product, variantId);

  const max = variantStock > 0 ? variantStock : 1;
  const safeQty = clamp(qty, 1, max);

  return {
    id: buildLineId(productId, resolvedVariantId),
    productId,
    name,
    imageUrl,
    price,
    type,
    variants,
    variantId: resolvedVariantId,
    variantLabel,
    variantStock,
    qty: safeQty,
  };
}

function updateLineFromProduct(line, product) {
  if (!product?.id) return line;
  const { variantId, variantLabel, variantStock, variants } = resolveVariant(
    product,
    line?.variantId
  );
  const max = variantStock > 0 ? variantStock : 99;
  const qty = clamp(line?.qty ?? 1, 1, max);

  return {
    ...line,
    productId: product.id,
    name: product?.name ?? line?.name ?? "",
    imageUrl: product?.imageUrl ?? line?.imageUrl ?? "",
    price: Number(product?.price ?? line?.price ?? 0),
    type: product?.type ?? line?.type ?? "",
    variants,
    variantId,
    variantLabel,
    variantStock,
    qty,
  };
}

export const initialCartState = {
  cartItems: [],
};

export function cartReducer(state, action) {
  const s = state || initialCartState;

  if (action?.type === "HYDRATE") {
    const items = Array.isArray(action?.payload) ? action.payload : [];
    return { ...s, cartItems: items };
  }

  if (action?.type === "CLEAR") {
    return { ...s, cartItems: [] };
  }

  if (action?.type === "REMOVE_ITEM") {
    const id = String(action?.payload?.id || "");
    return { ...s, cartItems: s.cartItems.filter((x) => x.id !== id) };
  }

  if (action?.type === "UPDATE_QTY") {
    const id = String(action?.payload?.id || "");
    const nextQty = Number(action?.payload?.qty ?? 1);

    return {
      ...s,
      cartItems: s.cartItems.map((x) => {
        if (x.id !== id) return x;
        const max =
          Number(x.variantStock ?? 0) > 0 ? Number(x.variantStock) : 99;
        return { ...x, qty: clamp(nextQty, 1, max) };
      }),
    };
  }

  if (action?.type === "ADD_ITEM") {
    const product = action?.payload?.product;
    const variantId = action?.payload?.variantId;
    const qty = Number(action?.payload?.qty ?? 1);

    const productId = product?.id || "";
    if (!productId) return s;

    const line = toCartLine(product, variantId, qty);

    const existing = s.cartItems.find((x) => x.id === line.id);
    if (!existing) return { ...s, cartItems: [...s.cartItems, line] };

    const max =
      line.variantStock > 0 ? line.variantStock : existing.qty + line.qty;
    const nextQty = clamp((existing.qty || 0) + (line.qty || 0), 1, max);

    return {
      ...s,
      cartItems: s.cartItems.map((x) =>
        x.id === line.id ? { ...x, qty: nextQty } : x
      ),
    };
  }

  if (action?.type === "SYNC_PRODUCT") {
    const id = String(action?.payload?.id || "");
    const product = action?.payload?.product;

    return {
      ...s,
      cartItems: s.cartItems.map((x) =>
        x.id === id ? updateLineFromProduct(x, product) : x
      ),
    };
  }

  return s;
}

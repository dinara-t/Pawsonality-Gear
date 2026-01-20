function clamp(n, min, max) {
  const v = Number(n);
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(v, max));
}

export function getVariant(product, variantId) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  if (!variants.length) return null;
  return variants.find((v) => v?.id === variantId) || variants[0] || null;
}

export function getVariantStock(product, variantId) {
  const v = getVariant(product, variantId);
  return Number(v?.quantity ?? 0);
}

export function getVariantLabel(product, variantId) {
  const v = getVariant(product, variantId);
  return v?.label || variantId || "";
}

export function clampQtyToStock(qty, stock) {
  const max = Number(stock) > 0 ? Number(stock) : 1;
  return clamp(qty, 1, max);
}

export function isInStock(product, variantId) {
  return getVariantStock(product, variantId) > 0;
}

const STORAGE_KEY = "pawsonality_cart_v1";

export function loadCart() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCart(cartItems) {
  const safe = Array.isArray(cartItems) ? cartItems : [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
}

export function clearCartStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

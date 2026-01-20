const STRIPE_SERVER_URL =
  import.meta.env.VITE_STRIPE_SERVER_URL || "http://localhost:4242";

export async function createCheckoutSession({ cartItems, customer }) {
  const res = await fetch(`${STRIPE_SERVER_URL}/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cartItems, customer }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to create Stripe checkout session");
  }

  return res.json();
}

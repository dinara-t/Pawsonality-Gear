import express from "express";
import Stripe from "stripe";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT || 4242);

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error("Missing STRIPE_SECRET_KEY. Set it in Render env vars.");
  process.exit(1);
}

const clientOrigin = process.env.CLIENT_ORIGIN;
if (!clientOrigin) {
  console.error(
    "Missing CLIENT_ORIGIN. Set it to https://dinara-t.github.io in Render env vars.",
  );
  process.exit(1);
}

const app = express();

app.use(
  cors({
    origin: clientOrigin,
    methods: ["GET", "POST"],
  }),
);

app.use(express.json());

const stripe = new Stripe(secretKey);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { cartItems, customer } = req.body || {};

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: "cartItems is required" });
    }

    const line_items = cartItems.map((item) => {
      const name = String(item?.name || "Item");
      const price = Number(item?.price ?? 0);
      const qty = Number(item?.qty ?? 1);

      if (!Number.isFinite(price) || price <= 0) {
        throw new Error(`Invalid price for ${name}`);
      }

      const quantity = Number.isFinite(qty) && qty > 0 ? qty : 1;

      return {
        price_data: {
          currency: "usd",
          product_data: { name },
          unit_amount: Math.round(price * 100),
        },
        quantity,
      };
    });

    const baseUrl = String(
      process.env.APP_BASE_URL || "http://localhost:5173",
    ).replace(/\/$/, "");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      customer_email: String(customer?.email || "").trim() || undefined,
      success_url: `${baseUrl}/#/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#/cart`,
    });

    if (!session?.url) {
      return res.status(500).json({
        error:
          "Stripe session URL missing. Ensure Stripe Checkout Session returns a URL.",
      });
    }

    return res.json({ id: session.id, url: session.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error";
    return res.status(500).json({ error: msg });
  }
});

app.listen(PORT, () => {
  console.log(`Stripe server running on port ${PORT}`);
});

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Checkout.module.scss";
import { useCart } from "../../context/CartContext";
import { createCheckoutSession } from "../../services/stripe";

function money(n) {
  const v = Number(n ?? 0);
  return `$${v.toFixed(2)}`;
}

function isEmail(value) {
  const v = String(value || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function Checkout() {
  const { cartItems, subtotal } = useCart();

  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address1: "",
    address2: "",
    suburb: "",
    state: "",
    postcode: "",
    notes: "",
  });

  const [touched, setTouched] = useState({});
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const shipping = useMemo(() => {
    if (!cartItems.length) return 0;
    return 0;
  }, [cartItems.length]);

  const total = subtotal + shipping;

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function touch(name) {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  const errors = useMemo(() => {
    const e = {};
    if (!isEmail(form.email)) e.email = "Enter a valid email address.";
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim()) e.lastName = "Last name is required.";
    if (!form.phone.trim()) e.phone = "Phone number is required.";
    if (!form.address1.trim()) e.address1 = "Address is required.";
    if (!form.suburb.trim()) e.suburb = "Suburb is required.";
    if (!form.state.trim()) e.state = "State is required.";
    if (!form.postcode.trim()) e.postcode = "Postcode is required.";
    return e;
  }, [form]);

  const canPay =
    cartItems.length > 0 && Object.keys(errors).length === 0 && !processing;

  async function handleStripePay(e) {
    e.preventDefault();
    setError("");

    const touchedAll = {
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      address1: true,
      suburb: true,
      state: true,
      postcode: true,
    };
    setTouched(touchedAll);

    if (cartItems.length === 0) return;
    if (Object.keys(errors).length !== 0) return;

    setProcessing(true);

    try {
      const customer = {
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        address1: form.address1.trim(),
        address2: form.address2.trim(),
        suburb: form.suburb.trim(),
        state: form.state.trim(),
        postcode: form.postcode.trim(),
        notes: form.notes.trim(),
      };

      const session = await createCheckoutSession({ cartItems, customer });

      if (!session?.url) {
        throw new Error(
          "Stripe session URL missing (backend must return session.url)."
        );
      }

      window.location.href = session.url;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Stripe checkout failed.";
      setError(msg);
      setProcessing(false);
    }
  }

  return (
    <div className={styles.checkout}>
      <div className={styles.header}>
        <h1>Checkout</h1>
        <Link to="/cart" className={styles.back}>
          Back to cart
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <div className={styles.empty}>
          <p>Your cart is empty.</p>
          <Link to="/shop" className={styles.shopLink}>
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className={styles.layout}>
          <form className={styles.form} onSubmit={handleStripePay}>
            {error ? <div className={styles.bannerError}>{error}</div> : null}

            <section className={styles.section}>
              <h2>Contact</h2>

              <div className={styles.field}>
                <label>Email</label>
                <input
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  onBlur={() => touch("email")}
                  type="email"
                  autoComplete="email"
                  disabled={processing}
                />
                {touched.email && errors.email ? (
                  <div className={styles.error}>{errors.email}</div>
                ) : null}
              </div>

              <div className={styles.twoCol}>
                <div className={styles.field}>
                  <label>First name</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setField("firstName", e.target.value)}
                    onBlur={() => touch("firstName")}
                    type="text"
                    autoComplete="given-name"
                    disabled={processing}
                  />
                  {touched.firstName && errors.firstName ? (
                    <div className={styles.error}>{errors.firstName}</div>
                  ) : null}
                </div>

                <div className={styles.field}>
                  <label>Last name</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setField("lastName", e.target.value)}
                    onBlur={() => touch("lastName")}
                    type="text"
                    autoComplete="family-name"
                    disabled={processing}
                  />
                  {touched.lastName && errors.lastName ? (
                    <div className={styles.error}>{errors.lastName}</div>
                  ) : null}
                </div>
              </div>

              <div className={styles.field}>
                <label>Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  onBlur={() => touch("phone")}
                  type="tel"
                  autoComplete="tel"
                  disabled={processing}
                />
                {touched.phone && errors.phone ? (
                  <div className={styles.error}>{errors.phone}</div>
                ) : null}
              </div>
            </section>

            <section className={styles.section}>
              <h2>Delivery address</h2>

              <div className={styles.field}>
                <label>Address</label>
                <input
                  value={form.address1}
                  onChange={(e) => setField("address1", e.target.value)}
                  onBlur={() => touch("address1")}
                  type="text"
                  autoComplete="address-line1"
                  disabled={processing}
                />
                {touched.address1 && errors.address1 ? (
                  <div className={styles.error}>{errors.address1}</div>
                ) : null}
              </div>

              <div className={styles.field}>
                <label>Apartment, unit, etc. (optional)</label>
                <input
                  value={form.address2}
                  onChange={(e) => setField("address2", e.target.value)}
                  type="text"
                  autoComplete="address-line2"
                  disabled={processing}
                />
              </div>

              <div className={styles.twoCol}>
                <div className={styles.field}>
                  <label>Suburb</label>
                  <input
                    value={form.suburb}
                    onChange={(e) => setField("suburb", e.target.value)}
                    onBlur={() => touch("suburb")}
                    type="text"
                    autoComplete="address-level2"
                    disabled={processing}
                  />
                  {touched.suburb && errors.suburb ? (
                    <div className={styles.error}>{errors.suburb}</div>
                  ) : null}
                </div>

                <div className={styles.field}>
                  <label>State</label>
                  <input
                    value={form.state}
                    onChange={(e) => setField("state", e.target.value)}
                    onBlur={() => touch("state")}
                    type="text"
                    autoComplete="address-level1"
                    disabled={processing}
                  />
                  {touched.state && errors.state ? (
                    <div className={styles.error}>{errors.state}</div>
                  ) : null}
                </div>
              </div>

              <div className={styles.twoCol}>
                <div className={styles.field}>
                  <label>Postcode</label>
                  <input
                    value={form.postcode}
                    onChange={(e) => setField("postcode", e.target.value)}
                    onBlur={() => touch("postcode")}
                    type="text"
                    autoComplete="postal-code"
                    disabled={processing}
                  />
                  {touched.postcode && errors.postcode ? (
                    <div className={styles.error}>{errors.postcode}</div>
                  ) : null}
                </div>

                <div className={styles.field}>
                  <label>Order notes (optional)</label>
                  <input
                    value={form.notes}
                    onChange={(e) => setField("notes", e.target.value)}
                    type="text"
                    disabled={processing}
                  />
                </div>
              </div>
            </section>

            <button
              className={styles.placeOrder}
              type="submit"
              disabled={!canPay}
            >
              {processing ? "Redirecting to Stripe…" : "Pay with Stripe"}
            </button>

            <div className={styles.disclaimer}>
              Stripe Checkout runs in test mode. Use card 4242 4242 4242 4242.
            </div>
          </form>

          <aside className={styles.summary}>
            <h2>Order summary</h2>

            <div className={styles.lines}>
              {cartItems.map((item) => (
                <div key={item.id} className={styles.line}>
                  <div className={styles.lineLeft}>
                    <div className={styles.lineName}>{item.name}</div>
                    <div className={styles.lineMeta}>
                      {item.variantLabel || item.variantId
                        ? `${item.variantLabel || item.variantId} · `
                        : ""}
                      Qty {item.qty}
                    </div>
                  </div>
                  <div className={styles.lineRight}>
                    {money(Number(item.price ?? 0) * Number(item.qty ?? 0))}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.row}>
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>

            <div className={styles.row}>
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : money(shipping)}</span>
            </div>

            <div className={styles.totalRow}>
              <span>Total</span>
              <span>{money(total)}</span>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

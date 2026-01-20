import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { doc, runTransaction } from "firebase/firestore";
import styles from "./CheckoutSuccess.module.scss";
import { db } from "../../services/firebase";
import { useCart } from "../../context/CartContext";

function groupCartReductions(cartItems) {
  const grouped = new Map();
  for (const item of cartItems) {
    const productId = String(item?.productId || "");
    const variantId = String(item?.variantId || "");
    const qty = Number(item?.qty ?? 0);

    if (!productId || !variantId || !Number.isFinite(qty) || qty <= 0) continue;

    if (!grouped.has(productId)) grouped.set(productId, new Map());
    const vMap = grouped.get(productId);
    vMap.set(variantId, (vMap.get(variantId) || 0) + qty);
  }
  return grouped;
}

async function commitStockReduction(cartItems) {
  const grouped = groupCartReductions(cartItems);
  if (grouped.size === 0)
    throw new Error("Cart items are missing productId or variantId.");

  await runTransaction(db, async (tx) => {
    const reads = [];
    for (const productId of grouped.keys()) {
      reads.push({ productId, ref: doc(db, "products", productId) });
    }

    const snapshots = [];
    for (const r of reads) {
      const snap = await tx.get(r.ref);
      if (!snap.exists()) throw new Error(`Product not found: ${r.productId}`);
      snapshots.push({ productId: r.productId, ref: r.ref, data: snap.data() });
    }

    for (const s of snapshots) {
      const data = s.data || {};
      const variants = Array.isArray(data.variants) ? data.variants : [];
      const reduceMap = grouped.get(s.productId) || new Map();

      const idxById = new Map();
      for (let i = 0; i < variants.length; i += 1) {
        const vid = String(variants[i]?.id || "");
        if (vid) idxById.set(vid, i);
      }

      for (const [variantId, reduceQty] of reduceMap.entries()) {
        const idx = idxById.get(variantId);
        if (idx === undefined)
          throw new Error(`Variant not found: ${s.productId} / ${variantId}`);

        const current = Number(variants[idx]?.quantity ?? 0);
        if (!Number.isFinite(current))
          throw new Error(`Invalid stock value: ${s.productId} / ${variantId}`);
        if (current < reduceQty) {
          throw new Error(
            `Not enough stock for ${variants[idx]?.label || variantId}. Available: ${current}, requested: ${reduceQty}`
          );
        }
      }

      const nextVariants = variants.map((v) => ({ ...v }));
      for (const [variantId, reduceQty] of reduceMap.entries()) {
        const i = nextVariants.findIndex(
          (v) => String(v?.id || "") === variantId
        );
        const current = Number(nextVariants[i]?.quantity ?? 0);
        nextVariants[i].quantity = current - reduceQty;
      }

      tx.update(s.ref, { variants: nextVariants });
    }
  });
}

export default function CheckoutSuccess() {
  const { cartItems, clearCart } = useCart();
  const [searchParams] = useSearchParams();

  const sessionId = searchParams.get("session_id") || "";
  const processedKey = useMemo(() => {
    if (!sessionId) return "";
    return `pawsonality_processed_${sessionId}`;
  }, [sessionId]);

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!alive) return;

      if (!sessionId) {
        setStatus("error");
        setError("Missing Stripe session id.");
        return;
      }

      if (processedKey && sessionStorage.getItem(processedKey) === "1") {
        setStatus("done");
        return;
      }

      if (!cartItems.length) {
        setStatus("done");
        if (processedKey) sessionStorage.setItem(processedKey, "1");
        return;
      }

      setStatus("processing");
      setError("");

      try {
        await commitStockReduction(cartItems);
        clearCart();
        if (processedKey) sessionStorage.setItem(processedKey, "1");
        setStatus("done");
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to finalise order.";
        setStatus("error");
        setError(msg);
      }
    }

    run();

    return () => {
      alive = false;
    };
  }, [cartItems, clearCart, processedKey, sessionId]);

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        {status === "processing" ? (
          <>
            <h1>Finalising your order…</h1>
            <p>Updating stock in Firestore. Please don’t close this page.</p>
          </>
        ) : null}

        {status === "done" ? (
          <>
            <h1>Payment successful</h1>
            <p>Your order is confirmed and stock has been updated.</p>
            <div className={styles.actions}>
              <Link to="/shop" className={styles.primary}>
                Continue shopping
              </Link>
              <Link to="/" className={styles.secondary}>
                Go home
              </Link>
            </div>
          </>
        ) : null}

        {status === "error" ? (
          <>
            <h1>We couldn’t finalise the order</h1>
            <p className={styles.error}>{error}</p>
            <div className={styles.actions}>
              <Link to="/cart" className={styles.primary}>
                Back to cart
              </Link>
              <Link to="/shop" className={styles.secondary}>
                Shop
              </Link>
            </div>
            <p className={styles.small}>
              If payment succeeded but stock update failed, you can retry by
              reloading this page.
            </p>
          </>
        ) : null}

        {status === "idle" ? (
          <>
            <h1>Preparing…</h1>
          </>
        ) : null}
      </div>
    </div>
  );
}

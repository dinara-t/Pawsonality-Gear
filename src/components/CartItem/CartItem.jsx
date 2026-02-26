import { Link } from "react-router-dom";
import styles from "./CartItem.module.scss";
import { useCart } from "../../context/CartContext";
import fallbackImage from "../../assets/images/fallback-product.jpg";

function money(n) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(Number(n ?? 0));
}

function clampQty(value, max) {
  const v = Number(value);
  const safe = Number.isFinite(v) ? v : 1;
  return Math.max(1, Math.min(safe, max));
}

export default function CartItem({ item }) {
  const { updateQty, removeItem } = useCart() || {};

  if (!item) return null;

  const id = item.id;
  const productId = item.productId;
  const name = item.name;
  const imageUrl = item.imageUrl;
  const type = item.type;
  const price = Number(item.price ?? 0);
  const qty = Number(item.qty ?? 1);

  const variantText = item.variantLabel || item.variantId || "";
  const stock = Number(item.variantStock ?? 0);
  const maxQty = stock > 0 ? stock : qty;
  const safeQty = clampQty(qty, maxQty);

  return (
    <div className={styles.item}>
      <Link
        to={productId ? `/product/${productId}` : "/shop"}
        className={styles.thumb}
      >
        <img
          src={imageUrl || fallbackImage}
          alt={name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallbackImage;
          }}
        />
      </Link>

      <div className={styles.info}>
        <div className={styles.topRow}>
          <div className={styles.titleBlock}>
            <div className={styles.type}>{type}</div>
            <Link
              to={productId ? `/product/${productId}` : "/shop"}
              className={styles.name}
            >
              {name}
            </Link>
            {variantText ? (
              <div className={styles.variant}>{variantText}</div>
            ) : null}
          </div>

          <button
            className={styles.remove}
            type="button"
            onClick={() => removeItem?.(id)}
          >
            Remove
          </button>
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.qty}>
            <button
              type="button"
              onClick={() => updateQty?.(id, clampQty(safeQty - 1, maxQty))}
              aria-label="Decrease quantity"
            >
              −
            </button>

            <input
              type="number"
              min="1"
              max={maxQty || 1}
              value={safeQty}
              onChange={(e) =>
                updateQty?.(id, clampQty(e.target.value || 1, maxQty || 1))
              }
              disabled={!updateQty}
            />

            <button
              type="button"
              onClick={() =>
                updateQty?.(id, clampQty(safeQty + 1, maxQty || safeQty + 1))
              }
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <div className={styles.stock}>
            {stock > 0 ? `${stock} in stock` : ""}
          </div>

          <div className={styles.priceCol}>
            <div className={styles.unitPrice}>{money(price)}</div>
            <div className={styles.linePrice}>{money(price * safeQty)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

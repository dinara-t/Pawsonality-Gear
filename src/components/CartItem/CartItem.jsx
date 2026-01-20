import { Link } from "react-router-dom";
import styles from "./CartItem.module.scss";
import { useCart } from "../../context/CartContext";

function money(n) {
  const v = Number(n ?? 0);
  return `$${v.toFixed(2)}`;
}

function getVariantInfo(item) {
  const variants = item?.variants || item?.product?.variants || [];
  const variantId =
    item?.variantId || item?.selectedVariantId || item?.variant?.id || "";
  const variant =
    variants.find((v) => v.id === variantId) || variants[0] || null;
  const label =
    item?.variantLabel ||
    item?.variant?.label ||
    variant?.label ||
    variantId ||
    "";
  const stock = Number(item?.variantStock ?? variant?.quantity ?? 0);
  return { variantId, label, stock };
}

export default function CartItem({ item }) {
  const cart = useCart() || {};
  const updateQty =
    cart.updateQty || cart.setQty || cart.updateItemQty || (() => {});
  const removeItem = cart.removeItem || cart.remove || (() => {});

  const id = item?.id || "";
  const productId = item?.productId || item?.product?.id || "";
  const name = item?.name || item?.product?.name || "";
  const imageUrl = item?.imageUrl || item?.product?.imageUrl || "";
  const type = item?.type || item?.product?.type || "";
  const price = Number(item?.price ?? item?.product?.price ?? 0);
  const qty = Number(item?.qty ?? item?.quantity ?? 1);

  const { variantId, label, stock } = getVariantInfo(item);
  const maxQty = stock > 0 ? stock : qty;
  const safeQty = Math.max(1, Math.min(qty, maxQty));

  return (
    <div className={styles.item}>
      <Link
        to={productId ? `/product/${productId}` : "/shop"}
        className={styles.thumb}
      >
        <img src={imageUrl} alt={name} />
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
            <div className={styles.variant}>{label || variantId}</div>
          </div>

          <button
            className={styles.remove}
            type="button"
            onClick={() => removeItem(id)}
          >
            Remove
          </button>
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.qty}>
            <button
              type="button"
              onClick={() => updateQty(id, Math.max(1, safeQty - 1))}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <input
              type="number"
              min="1"
              max={maxQty || 1}
              value={safeQty}
              onChange={(e) => {
                const v = Number(e.target.value || 1);
                const next = Math.max(1, Math.min(v, maxQty || 1));
                updateQty(id, next);
              }}
            />
            <button
              type="button"
              onClick={() =>
                updateQty(id, Math.min(safeQty + 1, maxQty || safeQty + 1))
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

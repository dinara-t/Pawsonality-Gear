import { Link, useNavigate } from "react-router-dom";
import styles from "./Cart.module.scss";
import { useCart } from "../../context/CartContext";

function money(n) {
  const v = Number(n ?? 0);
  return `$${v.toFixed(2)}`;
}

function getVariantInfo(item) {
  const variants = item?.variants || item?.product?.variants || [];
  const variantId =
    item?.variantId || item?.selectedVariantId || item?.variant?.id || "";
  const variant = variants.find((v) => v.id === variantId) || null;
  const label =
    item?.variantLabel || item?.variant?.label || variant?.label || "";
  const stock = Number(item?.variantStock ?? variant?.quantity ?? 0);
  return { variantId, label, stock };
}

export default function Cart() {
  const navigate = useNavigate();
  const cart = useCart() || {};
  const cartItems = Array.isArray(cart.cartItems)
    ? cart.cartItems
    : Array.isArray(cart.items)
      ? cart.items
      : [];

  const updateQty =
    cart.updateQty || cart.setQty || cart.updateItemQty || (() => {});
  const removeItem = cart.removeItem || cart.remove || (() => {});
  const clearCart = cart.clearCart || cart.clear || (() => {});

  const subtotal = cartItems.reduce((sum, item) => {
    const price = Number(item?.price ?? item?.product?.price ?? 0);
    const qty = Number(item?.qty ?? item?.quantity ?? 0);
    return sum + price * qty;
  }, 0);

  const hasItems = cartItems.length > 0;

  return (
    <div className={styles.cart}>
      <div className={styles.header}>
        <h1>Cart</h1>
        {hasItems ? (
          <button className={styles.clear} type="button" onClick={clearCart}>
            Clear cart
          </button>
        ) : null}
      </div>

      {!hasItems ? (
        <div className={styles.empty}>
          <p>Your cart is empty.</p>
          <Link to="/shop" className={styles.shopLink}>
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className={styles.layout}>
          <div className={styles.items}>
            {cartItems.map((item) => {
              const id =
                item?.id ||
                `${item?.productId || item?.product?.id || ""}_${item?.variantId || item?.selectedVariantId || ""}`;
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
                <div className={styles.item} key={id}>
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
                        <div className={styles.variant}>
                          {label ? label : variantId ? variantId : ""}
                        </div>
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
                          onClick={() =>
                            updateQty(id, Math.max(1, safeQty - 1))
                          }
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
                            updateQty(
                              id,
                              Math.min(safeQty + 1, maxQty || safeQty + 1)
                            )
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
                        <div className={styles.linePrice}>
                          {money(price * safeQty)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className={styles.summary}>
            <h2>Order summary</h2>

            <div className={styles.row}>
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>

            <div className={styles.note}>
              Shipping and taxes are calculated at checkout.
            </div>

            <button
              className={styles.checkout}
              type="button"
              onClick={() => navigate("/checkout")}
            >
              Go to checkout
            </button>

            <Link to="/shop" className={styles.continue}>
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}

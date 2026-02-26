import { Link, useNavigate } from "react-router-dom";
import styles from "./Cart.module.scss";
import { useCart } from "../../context/CartContext";
import CartItem from "../../components/CartItem/CartItem";

function money(n) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(Number(n ?? 0));
}

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems = [], clearCart, subtotal = 0 } = useCart() || {};

  const hasItems = cartItems.length > 0;

  return (
    <div className={styles.cart}>
      <div className={styles.header}>
        <h1>Cart</h1>
        {hasItems ? (
          <button
            className={styles.clear}
            type="button"
            onClick={() => clearCart?.()}
          >
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
            {cartItems.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
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

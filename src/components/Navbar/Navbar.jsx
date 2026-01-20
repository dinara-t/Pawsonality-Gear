import { NavLink, Link } from "react-router-dom";
import styles from "./Navbar.module.scss";
import { useCart } from "../../context/CartContext";

function cx({ isActive }) {
  return isActive ? styles.active : undefined;
}

export default function Navbar() {
  const cart = useCart();
  const itemCount = Number(cart?.itemCount ?? 0);

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          Pawsonality Gear
        </Link>

        <nav className={styles.nav}>
          <NavLink to="/" className={cx} end>
            Home
          </NavLink>
          <NavLink to="/shop" className={cx}>
            Shop
          </NavLink>
          <NavLink to="/about" className={cx}>
            About
          </NavLink>
        </nav>

        <div className={styles.actions}>
          <Link to="/cart" className={styles.cart}>
            Cart
            {itemCount > 0 ? (
              <span className={styles.badge}>{itemCount}</span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}

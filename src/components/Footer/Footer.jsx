import { Link } from "react-router-dom";
import styles from "./Footer.module.scss";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.name}>Pawsonality Gear</div>
          <div className={styles.tagline}>
            Practical dog gear for everyday use.
          </div>
        </div>

        <div className={styles.links}>
          <Link to="/shop">Shop</Link>
          <span> | </span>
          <Link to="/about">About</Link>
          <span> | </span>
          <Link to="/cart">Cart</Link>
        </div>

        <div className={styles.meta}>© {year} Pawsonality Gear</div>
      </div>
    </footer>
  );
}

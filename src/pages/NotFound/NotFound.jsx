import { Link } from "react-router-dom";
import styles from "./NotFound.module.scss";

export default function NotFound() {
  return (
    <div className={styles.notFound}>
      <div className={styles.inner}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.text}>
          The page you are looking for doesn’t exist or has been moved.
        </p>

        <div className={styles.actions}>
          <Link to="/" className={styles.primary}>
            Go home
          </Link>
          <Link to="/shop" className={styles.secondary}>
            Browse shop
          </Link>
        </div>
      </div>
    </div>
  );
}

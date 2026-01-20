import { Link } from "react-router-dom";
import styles from "./ProductCard.module.scss";

export default function ProductCard({ product }) {
  if (!product) return null;

  return (
    <Link to={`/product/${product.id}`} className={styles.card}>
      <div className={styles.imageWrap}>
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
        {product.featured && <span className={styles.badge}>Featured</span>}
      </div>

      <div className={styles.body}>
        <div className={styles.type}>{product.type}</div>
        <h3 className={styles.name}>{product.name}</h3>
        <div className={styles.price}>${product.price}</div>
      </div>
    </Link>
  );
}

import { Link } from "react-router-dom";
import styles from "./ProductCard.module.scss";
import fallbackImage from "../../assets/images/fallback-product.jpg";

export default function ProductCard({ product }) {
  if (!product) return null;

  const formattedPrice = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(Number(product.price || 0));

  return (
    <Link to={`/product/${product.id}`} className={styles.card}>
      <div className={styles.imageWrap}>
        <img
          src={product.imageUrl || fallbackImage}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallbackImage;
          }}
        />
        {product.featured && <span className={styles.badge}>Featured</span>}
      </div>

      <div className={styles.body}>
        <div className={styles.type}>{product.type}</div>
        <h3 className={styles.name}>{product.name}</h3>
        <div className={styles.price}>{formattedPrice}</div>
      </div>
    </Link>
  );
}

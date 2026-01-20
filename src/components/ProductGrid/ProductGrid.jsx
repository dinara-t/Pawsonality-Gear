import styles from "./ProductGrid.module.scss";
import ProductCard from "../ProductCard/ProductCard";

export default function ProductGrid({ products }) {
  const list = Array.isArray(products) ? products : [];

  return (
    <div className={styles.grid}>
      {list.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

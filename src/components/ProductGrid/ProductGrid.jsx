import styles from "./ProductGrid.module.scss";
import ProductCard from "../ProductCard/ProductCard";

export default function ProductGrid({ products = [] }) {
  return (
    <div className={styles.grid}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

import { useEffect, useState } from "react";
import styles from "./Shop.module.scss";
import ProductGrid from "../../components/ProductGrid/ProductGrid";
import { fetchAllProducts, fetchProductsByType } from "../../services/products";

export default function Shop() {
  const [filter, setFilter] = useState("all");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      const data =
        filter === "all"
          ? await fetchAllProducts()
          : await fetchProductsByType(filter);

      if (!alive) return;
      setProducts(data);
      setLoading(false);
    }

    load();
    return () => {
      alive = false;
    };
  }, [filter]);

  return (
    <div className={styles.shop}>
      <div className={styles.header}>
        <h1>Shop</h1>
        <div className={styles.filters}>
          <button
            className={filter === "all" ? styles.active : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={filter === "leash" ? styles.active : ""}
            onClick={() => setFilter("leash")}
          >
            Leashes
          </button>
          <button
            className={filter === "collar" ? styles.active : ""}
            onClick={() => setFilter("collar")}
          >
            Collars
          </button>
          <button
            className={filter === "harness" ? styles.active : ""}
            onClick={() => setFilter("harness")}
          >
            Harnesses
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading products…</div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}

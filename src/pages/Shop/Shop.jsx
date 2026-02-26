import { useEffect, useState } from "react";
import styles from "./Shop.module.scss";
import ProductGrid from "../../components/ProductGrid/ProductGrid";
import { fetchAllProducts, fetchProductsByType } from "../../services/products";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "leash", label: "Leashes" },
  { key: "collar", label: "Collars" },
  { key: "harness", label: "Harnesses" },
];

export default function Shop() {
  const [filter, setFilter] = useState("all");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      try {
        const data =
          filter === "all"
            ? await fetchAllProducts()
            : await fetchProductsByType(filter);

        if (!alive) return;
        setProducts(Array.isArray(data) ? data : []);
      } catch {
        if (!alive) return;
        setProducts([]);
      } finally {
        if (alive) setLoading(false);
      }
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
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={filter === f.key ? styles.active : ""}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
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

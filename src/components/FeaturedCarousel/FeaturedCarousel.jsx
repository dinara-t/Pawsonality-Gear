import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./FeaturedCarousel.module.scss";

export default function FeaturedCarousel({ products }) {
  const items = useMemo(
    () => (Array.isArray(products) ? products : []),
    [products]
  );
  const [index, setIndex] = useState(0);

  const safeIndex = useMemo(() => {
    if (!items.length) return 0;
    return Math.max(0, Math.min(index, items.length - 1));
  }, [index, items.length]);

  function prev() {
    if (!items.length) return;
    setIndex((i) => (i - 1 + items.length) % items.length);
  }

  function next() {
    if (!items.length) return;
    setIndex((i) => (i + 1) % items.length);
  }

  if (!items.length) return null;

  const current = items[safeIndex];

  return (
    <div className={styles.carousel}>
      <button
        type="button"
        className={styles.arrow}
        onClick={prev}
        aria-label="Previous featured product"
      >
        ‹
      </button>

      <div className={styles.slide}>
        <Link to={`/product/${current.id}`} className={styles.card}>
          <div className={styles.imageWrap}>
            <img src={current.imageUrl} alt={current.name} />
          </div>
          <div className={styles.info}>
            <div className={styles.type}>{current.type}</div>
            <div className={styles.name}>{current.name}</div>
            <div className={styles.price}>${current.price}</div>
          </div>
        </Link>

        <div className={styles.dots} aria-label="Featured product selection">
          {items.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={i === safeIndex ? styles.dotActive : styles.dot}
              onClick={() => setIndex(i)}
              aria-label={`Go to ${p.name}`}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        className={styles.arrow}
        onClick={next}
        aria-label="Next featured product"
      >
        ›
      </button>
    </div>
  );
}

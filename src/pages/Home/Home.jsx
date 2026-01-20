import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.scss";
import FeaturedCarousel from "../../components/FeaturedCarousel/FeaturedCarousel";
import ProductGrid from "../../components/ProductGrid/ProductGrid";
import {
  fetchFeaturedProducts,
  fetchAllProducts,
} from "../../services/products";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      const [f, a] = await Promise.all([
        fetchFeaturedProducts(),
        fetchAllProducts(),
      ]);
      if (!alive) return;
      setFeatured(Array.isArray(f) ? f : []);
      setAll(Array.isArray(a) ? a : []);
      setLoading(false);
    }

    run();

    return () => {
      alive = false;
    };
  }, []);

  const picks = useMemo(() => {
    if (all.length <= 6) return all;

    const arr = [...all];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr.slice(0, 6);
  }, [all]);

  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <div className={styles.kicker}>Everyday dog gear</div>
            <h1 className={styles.title}>Pawsonality Gear</h1>
            <p className={styles.subtitle}>
              Practical, durable leashes, collars and harnesses with clean
              design and sensible variant options. Choose the right size, length
              and colour — then check out securely with Stripe test payments.
            </p>

            <div className={styles.heroActions}>
              <Link to="/shop" className={styles.primary}>
                Shop now
              </Link>
              <Link to="/about" className={styles.secondary}>
                Learn more
              </Link>
            </div>

            <div className={styles.points}>
              <div className={styles.point}>
                <div className={styles.pointTitle}>
                  Variants that make sense
                </div>
                <div className={styles.pointText}>
                  Sizes, lengths and colours per product — no guessing.
                </div>
              </div>
              <div className={styles.point}>
                <div className={styles.pointTitle}>Stock-aware cart</div>
                <div className={styles.pointText}>
                  You can’t add more than what’s available.
                </div>
              </div>
              <div className={styles.point}>
                <div className={styles.pointTitle}>Real database inventory</div>
                <div className={styles.pointText}>
                  Stock reduces in Firestore after successful payment.
                </div>
              </div>
            </div>
          </div>

          <div className={styles.heroCard}>
            <div className={styles.heroCardTop}>Featured</div>
            {loading ? (
              <div className={styles.loadingBox}>Loading…</div>
            ) : (
              <FeaturedCarousel products={featured} />
            )}
            <div className={styles.heroCardBottom}>
              <Link to="/shop" className={styles.cardLink}>
                Browse all products →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Discover our gear</h2>
          <Link to="/shop" className={styles.sectionLink}>
            View all
          </Link>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading…</div>
        ) : (
          <ProductGrid products={picks} />
        )}
      </section>

      <section className={styles.info}>
        <div className={styles.infoInner}>
          <div className={styles.infoBlock}>
            <h3>Built for everyday use</h3>
            <p>
              Whether it’s a quick walk, a weekend adventure or a training
              session, Pawsonality Gear focuses on the essentials: comfort,
              safety and durability — without loud branding or clutter.
            </p>
          </div>

          <div className={styles.infoBlock}>
            <h3>Simple shopping experience</h3>
            <p>
              Products are stored in Firestore and loaded live. Variants control
              what’s available, and checkout updates inventory after payment.
              It’s a clean end-to-end flow that stays consistent with stock.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

import styles from "./About.module.scss";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className={styles.about}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.kicker}>About</div>
          <h1 className={styles.title}>Pawsonality Gear</h1>
          <p className={styles.subtitle}>
            We design practical, durable dog gear made for everyday use.
            Comfort, safety, and clean design come first — so you can focus on
            the walk, not the gear.
          </p>

          <div className={styles.actions}>
            <Link to="/shop" className={styles.primary}>
              Browse products
            </Link>
            <Link to="/cart" className={styles.secondary}>
              View cart
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.grid}>
          <div className={styles.block}>
            <h2>What we make</h2>
            <p>
              Pawsonality Gear focuses on the essentials:{" "}
              <strong>leashes</strong>, <strong>collars</strong> and{" "}
              <strong>harnesses</strong> designed to handle daily wear. Each
              product includes clear variants so you can choose the right fit
              quickly — like leash lengths (for hands-free jogging or everyday
              walking) and collar/harness sizes.
            </p>
          </div>

          <div className={styles.block}>
            <h2>Variants done properly</h2>
            <p>
              Every item is offered in sensible options such as{" "}
              <strong>colour</strong>, <strong>size</strong> or{" "}
              <strong>length</strong>. That keeps the shopping experience simple
              and helps you choose confidently. Stock is tracked per variant, so
              “Small / Tan” can sell out without affecting “Medium / Tan”.
            </p>
          </div>

          <div className={styles.block}>
            <h2>Built on real inventory</h2>
            <p>
              Products live in Firestore and are fetched by the frontend — no
              static product lists. When checkout is completed, inventory is
              reduced in the database using a transaction, which protects stock
              accuracy when multiple people are shopping.
            </p>
          </div>

          <div className={styles.block}>
            <h2>Simple, clean design</h2>
            <p>
              We keep the design tidy and functional. No clutter, no
              overcomplication — just dependable gear, a clean product page, and
              a cart that respects stock limits.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

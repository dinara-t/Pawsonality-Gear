import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "./Product.module.scss";
import { fetchProductById } from "../../services/products";
import { useCart } from "../../context/CartContext";

function clampQty(value, max) {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 1;
  return Math.max(1, Math.min(safe, max));
}

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cart = useCart();

  const [product, setProduct] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      try {
        if (!id) {
          if (!alive) return;
          setProduct(null);
          setSelectedVariantId("");
          setQty(1);
          return;
        }

        const data = await fetchProductById(id);
        if (!alive) return;

        setProduct(data || null);

        const firstVariantId = data?.variants?.[0]?.id || "";
        setSelectedVariantId(firstVariantId);
        setQty(1);
      } catch {
        if (!alive) return;
        setProduct(null);
        setSelectedVariantId("");
        setQty(1);
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();

    return () => {
      alive = false;
    };
  }, [id]);

  const variants = product?.variants || [];
  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) || variants[0] || null;

  const stock = Number(selectedVariant?.quantity ?? 0);
  const maxQty = stock > 0 ? stock : 1;

  useEffect(() => {
    setQty((prev) => clampQty(prev, maxQty));
  }, [maxQty]);

  const canAdd =
    Boolean(product?.id) &&
    Boolean(selectedVariant?.id) &&
    stock > 0 &&
    qty > 0;

  function handleAddToCart() {
    if (!canAdd) return;
    if (!cart?.addToCart) return;

    cart.addToCart(product, selectedVariant.id, qty);
    navigate("/cart");
  }

  if (loading) return <div className={styles.loading}>Loading…</div>;

  if (!product) {
    return (
      <div className={styles.notFound}>
        <div>Product not found</div>
        <Link to="/shop">Back to shop</Link>
      </div>
    );
  }

  return (
    <div className={styles.product}>
      <div className={styles.media}>
        <img src={product.imageUrl} alt={product.name} />
      </div>

      <div className={styles.details}>
        <div className={styles.type}>{product.type}</div>
        <h1 className={styles.name}>{product.name}</h1>
        <div className={styles.price}>${product.price}</div>

        {variants.length ? (
          <div className={styles.variants}>
            <div className={styles.label}>Variant</div>
            <select
              value={selectedVariant?.id || ""}
              onChange={(e) => setSelectedVariantId(e.target.value)}
            >
              {variants.map((v) => {
                const vStock = Number(v.quantity ?? 0);
                const out = vStock <= 0;
                return (
                  <option key={v.id} value={v.id} disabled={out}>
                    {v.label} {out ? "(Out of stock)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        ) : null}

        <div className={styles.qtyRow}>
          <div className={styles.label}>Quantity</div>
          <input
            type="number"
            min="1"
            max={maxQty}
            value={qty}
            onChange={(e) => setQty(clampQty(e.target.value || 1, maxQty))}
            disabled={stock <= 0}
          />
          <div className={styles.stock}>
            {stock > 0 ? `${stock} in stock` : "Out of stock"}
          </div>
        </div>

        <button
          className={styles.add}
          disabled={!canAdd}
          type="button"
          onClick={handleAddToCart}
        >
          Add to cart
        </button>

        <Link to="/shop" className={styles.backLink}>
          Back to shop
        </Link>
      </div>
    </div>
  );
}

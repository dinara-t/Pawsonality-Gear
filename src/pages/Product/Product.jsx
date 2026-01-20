import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "./Product.module.scss";
import { fetchProductById } from "../../services/products";
import { useCart } from "../../context/CartContext";

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

      const data = await fetchProductById(id);

      if (!alive) return;

      setProduct(data);

      const firstVariant = data?.variants?.[0]?.id || "";
      setSelectedVariantId(firstVariant);
      setQty(1);

      setLoading(false);
    }

    run();

    return () => {
      alive = false;
    };
  }, [id]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return null;
    if (!selectedVariantId) return product.variants[0];
    return (
      product.variants.find((v) => v.id === selectedVariantId) ||
      product.variants[0]
    );
  }, [product, selectedVariantId]);

  const stock = Number(selectedVariant?.quantity ?? 0);

  useEffect(() => {
    if (!selectedVariant) return;
    const max = stock > 0 ? stock : 1;
    setQty((prev) => Math.max(1, Math.min(Number(prev || 1), max)));
  }, [selectedVariantId, stock, selectedVariant]);

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

        {product.variants?.length ? (
          <div className={styles.variants}>
            <div className={styles.label}>Variant</div>
            <select
              value={selectedVariant?.id || ""}
              onChange={(e) => setSelectedVariantId(e.target.value)}
            >
              {product.variants.map((v) => (
                <option
                  key={v.id}
                  value={v.id}
                  disabled={Number(v.quantity ?? 0) <= 0}
                >
                  {v.label}{" "}
                  {Number(v.quantity ?? 0) <= 0 ? "(Out of stock)" : ""}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className={styles.qtyRow}>
          <div className={styles.label}>Quantity</div>
          <input
            type="number"
            min="1"
            max={stock > 0 ? stock : 1}
            value={qty}
            onChange={(e) => {
              const v = Number(e.target.value || 1);
              const max = stock > 0 ? stock : 1;
              setQty(Math.max(1, Math.min(v, max)));
            }}
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

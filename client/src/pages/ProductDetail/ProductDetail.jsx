import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import ImageGallery from "../../components/ImageGallery/ImageGallery";
import Tabs from "../../components/Tabs/Tabs";
import ReviewCard from "../../components/ReviewCard/ReviewCard";
import ProductCard from "../../components/ProductCard/ProductCard";
import Newsletter from "../../components/Newsletter/Newsletter";
import Footer from "../../components/Footer/Footer";
import { getProduct, getReviews, getProducts, addToCart } from "../../api/api";
import Loader from "../../components/Loader/Loader";
import "./ProductDetail.css";

const REVIEWS_PAGE_SIZE = 6;

function Stars({ rating }) {
  const full = Math.round(rating);
  return (
    <span className="pd__stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < full ? "star star--filled" : "star"}>
          ★
        </span>
      ))}
      <span className="pd__rating-value">{rating}/5</span>
    </span>
  );
}

function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [visibleReviews, setVisibleReviews] = useState(REVIEWS_PAGE_SIZE);
  const [addStatus, setAddStatus] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setVisibleReviews(REVIEWS_PAGE_SIZE);
    setAddStatus(null);

    async function load() {
      try {
        const p = await getProduct(id);
        if (cancelled) return;
        setProduct(p);
        setSelectedColor(p.colors?.[0] || null);
        setSelectedSize(p.sizes?.[0] || null);
        setQuantity(1);

        const [reviewData, relatedData] = await Promise.all([
          getReviews(id),
          getProducts({ category: p.category, limit: 4 }),
        ]);

        if (cancelled) return;
        setReviews(reviewData);
        setRelated(relatedData.products.filter((rp) => rp.id !== p.id).slice(0, 4));
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleAddToCart() {
    try {
      await addToCart({
        productId: product.id,
        size: selectedSize,
        color: selectedColor,
        quantity,
      });
      setAddStatus({ type: "success", text: "Added to cart!" });
    } catch (err) {
      setAddStatus({ type: "error", text: "Couldn't add to cart. Try again." });
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <Loader label="Loading product details..." />
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <p className="pd__status container">Product not found.</p>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Breadcrumb
        items={[
          { label: "Home", to: "/" },
          { label: "Shop", to: "/shop" },
          { label: product.category[0].toUpperCase() + product.category.slice(1), to: `/category/${product.category}` },
          { label: product.name },
        ]}
      />

      <main className="pd container">
        <div className="pd__top">
          <ImageGallery images={product.images} name={product.name} />

          <div className="pd__info">
            <h1>{product.name}</h1>
            <Stars rating={product.rating} />

            <div className="pd__price">
              <span className="price">${product.price}</span>
              {product.oldPrice && <span className="price price--old">${product.oldPrice}</span>}
              {product.discount && <span className="badge-discount">-{product.discount}%</span>}
            </div>

            <p className="pd__description">{product.description}</p>

            <div className="pd__section">
              <h4>Select Colors</h4>
              <div className="pd__colors">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    className={`swatch ${selectedColor === color ? "swatch--active" : ""}`}
                    style={{ background: color, borderColor: color === "#ffffff" ? "#ddd" : color }}
                    aria-label={`Color ${color}`}
                    onClick={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && <span className="swatch__check">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="pd__section">
              <h4>Choose Size</h4>
              <div className="pd__sizes">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={selectedSize === size ? "active" : ""}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="pd__actions">
              <div className="pd__qty">
                <button
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button aria-label="Increase quantity" onClick={() => setQuantity((q) => q + 1)}>
                  +
                </button>
              </div>

              <button className="btn btn-primary pd__add-to-cart" onClick={handleAddToCart}>
                Add to Cart
              </button>
            </div>

            {addStatus && (
              <p className={`pd__add-status pd__add-status--${addStatus.type}`}>
                {addStatus.text}{" "}
                {addStatus.type === "success" && (
                  <Link to="/cart">View Cart →</Link>
                )}
              </p>
            )}
          </div>
        </div>

        <Tabs
          tabs={[
            {
              label: "Product Details",
              content: <p className="pd__description">{product.description}</p>,
            },
            {
              label: "Rating & Reviews",
              content: (
                <div className="pd__reviews">
                  <div className="pd__reviews-header">
                    <h2>All Reviews ({reviews.length})</h2>
                  </div>

                  {reviews.length === 0 ? (
                    <p className="pd__status">No reviews yet for this product.</p>
                  ) : (
                    <>
                      <div className="pd__reviews-grid">
                        {reviews.slice(0, visibleReviews).map((review) => (
                          <ReviewCard key={review.id} review={review} />
                        ))}
                      </div>

                      {visibleReviews < reviews.length && (
                        <div className="pd__reviews-footer">
                          <button
                            className="btn btn-outline"
                            onClick={() => setVisibleReviews((v) => v + REVIEWS_PAGE_SIZE)}
                          >
                            Load More Reviews
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ),
            },
            {
              label: "FAQs",
              content: (
                <p className="pd__status">
                  No FAQs added for this product yet. Contact support for any questions.
                </p>
              ),
            },
          ]}
        />

        {related.length > 0 && (
          <section className="pd__related">
            <h2 className="section-title">You Might Also Like</h2>
            <div className="pd__related-grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Newsletter />
      <Footer />
    </>
  );
}

export default ProductDetail;

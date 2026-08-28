import { Link } from "react-router-dom";
import "./ProductCard.css";

function Stars({ rating }) {
  const full = Math.round(rating);
  return (
    <span className="product-card__stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < full ? "star star--filled" : "star"}>
          ★
        </span>
      ))}
      <span className="product-card__rating-value">{rating}/5</span>
    </span>
  );
}

function ProductCard({ product }) {
  const { name, price, oldPrice, discount, rating, image } = product;

  return (
    <Link className="product-card" to={`/product/${product.id}`}>
      <div className="product-card__image">
        <img
          src={image}
          alt={name}
          onError={(e) => {
            e.target.src = "/images/products/skinny-fit-jeans.jpg";
          }}
        />
      </div>

      <h3 className="product-card__name">{name}</h3>
      <Stars rating={rating} />

      <div className="product-card__price">
        <span className="price">${price}</span>
        {oldPrice && <span className="price price--old">${oldPrice}</span>}
        {discount && <span className="badge-discount">-{discount}%</span>}
      </div>
    </Link>
  );
}

export default ProductCard;

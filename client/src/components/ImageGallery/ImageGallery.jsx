import { useState } from "react";
import "./ImageGallery.css";

function ImageGallery({ images, name }) {
  const [active, setActive] = useState(0);

  return (
    <div className="image-gallery">
      <div className="image-gallery__thumbs">
        {images.map((src, i) => (
          <button
            key={i}
            className={`image-gallery__thumb ${i === active ? "active" : ""}`}
            onClick={() => setActive(i)}
          >
            <img
              src={src}
              alt={`${name} thumbnail ${i + 1}`}
              onError={(e) => {
                e.target.src = "/images/products/skinny-fit-jeans.jpg";
              }}
            />
          </button>
        ))}
      </div>

      <div className="image-gallery__main">
        <img
          src={images[active]}
          alt={name}
          onError={(e) => {
            e.target.src = "/images/products/skinny-fit-jeans.jpg";
          }}
        />
      </div>
    </div>
  );
}

export default ImageGallery;

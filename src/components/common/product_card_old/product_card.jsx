import React, { useState } from "react";
import styles from "./product_card.module.scss";
import { Image } from "react-bootstrap";
import { Heart, StarFill, Dash, Plus } from "react-bootstrap-icons";

const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(1);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  return (
    <div className={styles.productCard} data-aos="fade-up">
      <div className={styles.imageWrapper}>
        <button className={styles.wishlistBtn} aria-label="Add to wishlist">
          <Heart />
        </button>
        <Image
          src={product.image}
          alt={product.name}
          width={250}
          height={250}
          className={styles.image}
        />
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{product.name}</h3>
        <div className={styles.meta}>
          <span className={styles.unit}>{product.unit || "1 UNIT"}</span>
          <div className={styles.rating}>
            <StarFill className={styles.starIcon} />
            <span>{product.rating || "4.5"}</span>
          </div>
        </div>
        <div className={styles.priceSection}>
          <span className={styles.price}>₹{product.price}</span>
        </div>
        <div className={styles.actions}>
          <div className={styles.quantitySelector}>
            <button onClick={handleDecrease} className={styles.qtyBtn}>
              <Dash />
            </button>
            <span className={styles.qtyValue}>{quantity}</span>
            <button onClick={handleIncrease} className={styles.qtyBtn}>
              <Plus />
            </button>
          </div>
          <button className={styles.addToCartBtn}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

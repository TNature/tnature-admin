import React from "react";
import styles from "./offer_box.module.scss";
import { Image } from "react-bootstrap";
import CustomButton from "@/components/ui/custom_button/custom_button";
import FONTS from "@/styles/fonts";

const OfferBox = ({
  tag,
  title,
  description,
  image,
  bgColor,
  btnText = "Show Now",
  aosDelay = 0,
}) => {
  return (
    <div
      className={styles.offerBox}
      data-aos="fade-up"
      data-aos-delay={aosDelay}
      style={{ backgroundColor: bgColor }}
    >
      <div className={styles.text}>
        <h4 className={FONTS.font3}>{tag}</h4>
        <h1>{title}</h1>
        <p>{description}</p>
        <CustomButton className={styles.btn}>{btnText}</CustomButton>
      </div>
      <div className={styles.img}>
        <Image src={image} fluid alt={title} />
      </div>
    </div>
  );
};

export default OfferBox;

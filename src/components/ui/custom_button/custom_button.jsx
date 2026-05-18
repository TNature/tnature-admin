import React from "react";
import styles from "./custom_button.module.scss";
import FONTS from "@/styles/fonts";

const CustomButton = ({ children, disabled, type, variant = 1, onClick }) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${styles.CustomButton} ${styles[`v${variant}`]}
      ${FONTS.font2}
      `}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default CustomButton;

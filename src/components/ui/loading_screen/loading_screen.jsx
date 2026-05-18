import React from "react";
import styles from "./loading_screen.module.scss";
import { Image } from "react-bootstrap";

const LoadingScreen = (noBg) => {
  return (
    <div className={`${styles.LoadingScreen} ${noBg ? styles.noBg : ""}`}>
      <Image src="/loading.gif" alt="Amigos" width={100} />
    </div>
  );
};

export default LoadingScreen;

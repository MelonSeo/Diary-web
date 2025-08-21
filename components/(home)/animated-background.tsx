import React from "react";
import styles from "@/styles/AnimatedBackground.module.css";

interface AnimatedBackgroundProps {
  children: React.ReactNode;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ children }) => {
  return (
    <>
      <div className={styles.background} />
      {children}
    </>
  );
};

export default AnimatedBackground;

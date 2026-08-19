import React from "react";
import { motion, type HTMLMotionProps, type Variants } from "framer-motion";

interface PageTransitionProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
    filter: "blur(4px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.38,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.06,
      when: "beforeChildren",
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(2px)",
    transition: {
      duration: 0.22,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`w-full min-h-screen ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

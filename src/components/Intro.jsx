import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import "./Intro.css";

const EASE = [0.22, 1, 0.36, 1];

export default function Intro({ onEnter }) {
  const prefersReducedMotion = useReducedMotion();
  const enteredRef = useRef(false);

  const enter = () => {
    if (enteredRef.current) return;
    enteredRef.current = true;
    onEnter();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      enter();
    }
  };

  return (
    <motion.div
      className="intro"
      role="button"
      tabIndex={0}
      aria-label="Enter afterimage"
      onClick={enter}
      onKeyDown={handleKeyDown}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={
        prefersReducedMotion
          ? { opacity: 0 }
          : { opacity: 0, scale: 1.025, filter: "blur(12px)" }
      }
      transition={{ duration: prefersReducedMotion ? 0.2 : 1.05, ease: EASE }}
    >
      <div className="intro__center">
        <motion.h1
          className="intro__wordmark"
          initial={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 18, filter: "blur(14px)", letterSpacing: "0.01em" }
          }
          animate={
            prefersReducedMotion
              ? { opacity: 1 }
              : { opacity: 1, y: 0, filter: "blur(0px)", letterSpacing: "-0.045em" }
          }
          transition={{ duration: 1.5, delay: 0.2, ease: EASE }}
        >
          afterimage
        </motion.h1>

        <motion.span
          className="intro__rule"
          aria-hidden="true"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.7, ease: EASE }}
        />

        <motion.p
          className="intro__prompt"
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: prefersReducedMotion ? 0 : 0.95, ease: EASE }}
        >
          press anywhere to remember
        </motion.p>
      </div>
    </motion.div>
  );
}

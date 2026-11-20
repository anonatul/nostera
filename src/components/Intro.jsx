import { motion } from "framer-motion";
import "./Intro.css";

/**
 * Fullscreen entry screen. The entire surface is the button.
 * Replace this implementation with the final intro experience.
 */
export default function Intro({ onEnter }) {
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onEnter();
    }
  };

  return (
    <motion.div
      className="intro"
      role="button"
      tabIndex={0}
      aria-label="Enter afterimage"
      onClick={onEnter}
      onKeyDown={handleKeyDown}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="intro__center">
        <h1 className="intro__wordmark">afterimage</h1>
        <p className="intro__prompt">press anywhere to remember</p>
      </div>
    </motion.div>
  );
}

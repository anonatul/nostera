import { AnimatePresence, motion } from "framer-motion";
import "./CenterStage.css";

/**
 * Center words. Replace with the final typographic treatment.
 */
export default function CenterStage({ memory, subtitle, entered, switching }) {
  if (!entered) return null;

  return (
    <div
      className={`center-stage${switching ? " is-switching" : ""}`}
      aria-live="polite"
    >
      <div className="center-stage__inner">
        <span className="center-stage__eyebrow">{memory.label}</span>
        <AnimatePresence mode="wait">
          <motion.h2
            key={`${memory.id}-title`}
            className={`center-stage__title${memory.italicTitle ? " is-italic" : ""}`}
            initial={{ opacity: 0, y: 7, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -5, filter: "blur(6px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {memory.title}
          </motion.h2>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.p
            key={`${memory.id}-${subtitle}`}
            className="center-stage__subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {subtitle}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

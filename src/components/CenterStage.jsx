import { AnimatePresence, motion } from "framer-motion";
import "./CenterStage.css";

const EASE = [0.22, 1, 0.36, 1];

export default function CenterStage({
  memory,
  subtitle,
  entered,
  switching,
  reducedMotion,
}) {
  if (!entered) return null;

  const titleMotion = reducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.25 },
      }
    : {
        initial: { opacity: 0, y: 8, filter: "blur(8px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        exit: { opacity: 0, y: -6, filter: "blur(7px)" },
        transition: { duration: 0.85, ease: EASE },
      };

  const lineMotion = reducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.25 },
      }
    : {
        initial: { opacity: 0, y: 4 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -4 },
        transition: { duration: 0.9, ease: EASE },
      };

  return (
    <div
      className={`center-stage${switching ? " is-switching" : ""}`}
      aria-live="polite"
    >
      <div className="center-stage__inner">
        <span className="center-stage__signature">afterimage</span>

        <span className="center-stage__label">{memory.label}</span>

        <div className="center-stage__title-slot">
          <AnimatePresence initial={false} mode="wait">
            <motion.h2
              key={memory.id}
              className={`center-stage__title${memory.italicTitle ? " is-italic" : ""}`}
              {...titleMotion}
            >
              {memory.title}
            </motion.h2>
          </AnimatePresence>
        </div>

        <div className="center-stage__subtitle-slot">
          <AnimatePresence initial={false} mode="wait">
            <motion.p
              key={subtitle}
              className="center-stage__subtitle"
              {...lineMotion}
            >
              {subtitle}
            </motion.p>
          </AnimatePresence>
        </div>

        <span className="center-stage__hairline" aria-hidden="true" />
      </div>
    </div>
  );
}

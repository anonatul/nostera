import { useEffect, useRef } from "react";
import ImageRow from "./ImageRow.jsx";
import "./MemoryWall.css";

const ROWS = [
  {
    id: 0,
    duration: 224,
    direction: "left",
    scale: 1.04,
    opacity: 0.93,
    lift: 4,
    depth: 0.2,
    height: "clamp(148px, 23.5vh, 286px)",
    offset: 0,
    count: 12,
  },
  {
    id: 1,
    duration: 268,
    direction: "right",
    scale: 0.93,
    opacity: 0.78,
    lift: -18,
    depth: -0.35,
    height: "clamp(128px, 20.5vh, 244px)",
    offset: 4,
    count: 12,
  },
  {
    id: 2,
    duration: 188,
    direction: "left",
    scale: 1.08,
    opacity: 0.97,
    lift: -36,
    depth: 0.45,
    height: "clamp(164px, 26vh, 312px)",
    offset: 7,
    count: 12,
  },
  {
    id: 3,
    duration: 242,
    direction: "right",
    scale: 0.9,
    opacity: 0.74,
    lift: -30,
    depth: -0.5,
    height: "clamp(132px, 21vh, 248px)",
    offset: 2,
    count: 12,
  },
  {
    id: 4,
    duration: 286,
    direction: "left",
    scale: 0.86,
    opacity: 0.7,
    lift: -24,
    depth: -0.65,
    height: "clamp(118px, 18.5vh, 224px)",
    offset: 5,
    count: 12,
  },
];

export default function MemoryWall({ memory, entered, reducedMotion }) {
  const innerRef = useRef(null);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return undefined;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!entered || reducedMotion || !finePointer) {
      inner.style.setProperty("--parallax-x", "0px");
      inner.style.setProperty("--parallax-y", "0px");
      return undefined;
    }

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = 0;

    const update = () => {
      currentX += (targetX - currentX) * 0.045;
      currentY += (targetY - currentY) * 0.045;
      inner.style.setProperty("--parallax-x", `${currentX.toFixed(2)}px`);
      inner.style.setProperty("--parallax-y", `${currentY.toFixed(2)}px`);

      if (
        Math.abs(targetX - currentX) > 0.01 ||
        Math.abs(targetY - currentY) > 0.01
      ) {
        frame = window.requestAnimationFrame(update);
      } else {
        frame = 0;
      }
    };

    const onMove = (event) => {
      const nx = event.clientX / window.innerWidth - 0.5;
      const ny = event.clientY / window.innerHeight - 0.5;
      targetX = nx * 18;
      targetY = ny * 12;
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [entered, reducedMotion]);

  return (
    <section
      className={[
        "memory-wall",
        entered ? "is-live" : "is-waiting",
        reducedMotion ? "is-reduced" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      <div className="memory-wall__inner" ref={innerRef}>
        {ROWS.map((row, index) => (
          <ImageRow
            key={row.id}
            images={memory.images}
            row={row}
            rowIndex={index}
            entered={entered}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>
    </section>
  );
}

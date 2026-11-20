import ImageRow from "./ImageRow.jsx";
import "./MemoryWall.css";

const ROWS = [
  { duration: 212, direction: "left", height: 0.9 },
  { duration: 248, direction: "right", height: 0.8 },
  { duration: 190, direction: "left", height: 1 },
  { duration: 232, direction: "right", height: 0.86 },
  { duration: 272, direction: "left", height: 0.78 },
];

/**
 * Wall skeleton. The wall owner replaces this with the full five-row,
 * looping memory wall.
 */
export default function MemoryWall({ memory, entered, reducedMotion }) {
  return (
    <section
      className={`memory-wall${entered ? " is-live" : ""}${
        reducedMotion ? " is-static" : ""
      }`}
      aria-hidden="true"
    >
      <div className="memory-wall__inner">
        {ROWS.map((row, index) => (
          <ImageRow
            key={row.duration}
            images={memory.images}
            index={index}
            duration={row.duration}
            direction={row.direction}
            height={row.height}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>
    </section>
  );
}

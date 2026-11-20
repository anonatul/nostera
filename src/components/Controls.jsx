import "./Controls.css";

export default function Controls({
  memory,
  index,
  total,
  entered,
  switching,
  onNext,
}) {
  if (!entered) return null;

  return (
    <div className="controls">
      <button
        type="button"
        className="controls__next"
        onClick={onNext}
        disabled={switching}
        aria-label={`Show another memory. Current memory: ${memory.label}`}
      >
        <span className="controls__icon" aria-hidden="true">
          ↻
        </span>
        <span className="controls__text">another memory</span>
        <span className="controls__count" aria-hidden="true">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </button>
    </div>
  );
}

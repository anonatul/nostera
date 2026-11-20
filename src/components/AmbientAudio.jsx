import "./AmbientAudio.css";

/**
 * Skeleton audio control. Replace with the full ambient engine and control.
 * Must begin only after the intro interaction, fade smoothly, and fall back
 * gracefully when /audio/ambient.mp3 is absent.
 */
export default function AmbientAudio({ active }) {
  if (!active) return null;

  return (
    <button
      type="button"
      className="ambient-audio"
      aria-label="Toggle ambient sound"
      aria-pressed="true"
    >
      <span aria-hidden="true">♫</span>
    </button>
  );
}

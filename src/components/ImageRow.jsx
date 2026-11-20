import { getImageUrl } from "../data/memories.js";
import "./ImageRow.css";

/**
 * Skeleton row. Replace with the full seamless marquee implementation.
 */
export default function ImageRow({
  images,
  index,
  duration,
  direction,
  height,
  reducedMotion,
}) {
  const sequence = Array.from({ length: 12 }, (_, itemIndex) => {
    const image = images[(itemIndex + index) % images.length];
    return { image, key: `${image.file}-${itemIndex}` };
  });

  const renderSequence = (copy) => (
    <div className="image-row__set" aria-hidden="true">
      {sequence.map(({ image, key }) => (
        <figure
          key={`${copy}-${key}`}
          className="image-row__frame"
          style={{
            "--ratio": image.ratio,
            height: `calc(var(--row-height) * ${height})`,
          }}
        >
          <img src={getImageUrl(image)} alt="" loading="eager" decoding="async" />
        </figure>
      ))}
    </div>
  );

  return (
    <div
      className={`image-row image-row--${direction}`}
      style={{
        "--row-duration": `${duration}s`,
        "--row-height": "clamp(110px, 21vh, 250px)",
        "--row-offset": `${(index % 3) * 16}px`,
        animationPlayState: reducedMotion ? "paused" : undefined,
      }}
    >
      <div className="image-row__track">
        {renderSequence(0)}
        {renderSequence(1)}
      </div>
    </div>
  );
}

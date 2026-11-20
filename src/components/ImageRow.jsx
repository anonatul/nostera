import { getImageUrl } from "../data/memories.js";
import "./ImageRow.css";

function frameStyle(rowIndex, frameIndex, image) {
  const seed = rowIndex * 97 + frameIndex * 53 + (image.file.length || 0) * 7;
  const unit = (n) => {
    const x = Math.sin(seed * 0.17 + n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  const rotate = (unit(1) - 0.5) * 2.6;
  const shiftY = (unit(2) - 0.5) * 18;
  const shiftX = (unit(3) - 0.5) * 10;
  const scale = 0.985 + unit(4) * 0.045;
  const bright = 0.76 + unit(5) * 0.18;
  const sat = 0.62 + unit(6) * 0.22;
  const contrast = 1.02 + unit(7) * 0.1;
  const baseOpacity = 0.72 + unit(8) * 0.24;
  const softBlur = image.soft ? 0.9 + unit(9) * 1.2 : 0.15 + unit(9) * 0.35;
  const opacity = image.soft ? baseOpacity * 0.72 : baseOpacity;

  return {
    "--frame-rotate": `${rotate.toFixed(2)}deg`,
    "--frame-y": `${shiftY.toFixed(2)}px`,
    "--frame-x": `${shiftX.toFixed(2)}px`,
    "--frame-scale": scale.toFixed(3),
    "--frame-bright": bright.toFixed(3),
    "--frame-sat": sat.toFixed(3),
    "--frame-contrast": contrast.toFixed(3),
    "--frame-opacity": opacity.toFixed(3),
    "--frame-blur": `${softBlur.toFixed(2)}px`,
    "--frame-focus": image.focus || "50% 50%",
  };
}

export default function ImageRow({ images, row, rowIndex, entered, reducedMotion }) {
  const sequence = Array.from({ length: row.count }, (_, index) => {
    const image = images[(row.offset + index) % images.length];
    return { image, index };
  });

  const renderSet = (copy) => (
    <div className="image-row__set" aria-hidden="true">
      {sequence.map(({ image, index }) => (
        <figure
          key={`${copy}-${row.id}-${image.file}-${index}`}
          className={`image-row__frame${image.soft ? " is-soft" : ""}`}
          style={{
            "--ratio": image.ratio,
            "--frame-height": row.height,
            ...frameStyle(rowIndex, index, image),
          }}
        >
          <img
            src={getImageUrl(image)}
            alt=""
            loading="eager"
            decoding="async"
            draggable="false"
          />
        </figure>
      ))}
    </div>
  );

  return (
    <div
      className={`image-row image-row--${row.direction}`}
      style={{
        "--row-duration": `${row.duration}s`,
        "--row-scale": row.scale,
        "--row-opacity": row.opacity,
        "--row-lift": `${row.lift}px`,
        "--row-depth": row.depth,
        "--row-delay": `${rowIndex * 140}ms`,
        "--row-gap": "clamp(18px, 2.4vw, 34px)",
      }}
      data-row={rowIndex}
    >
      <div
        className="image-row__track"
        style={{
          animationPlayState:
            entered && !reducedMotion ? "running" : "paused",
        }}
      >
        {renderSet("a")}
        {renderSet("b")}
      </div>
    </div>
  );
}

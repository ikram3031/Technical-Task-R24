import React, { useEffect, useRef, useState } from "react";
import { HEIGHT_MAX } from "../constants/limits.js";

/**
 * Fixed preview box (e.g., 360px high).
 * Plates are <img> elements laid out left→right, bottom-aligned.
 * Scale:
 *   vScale = boxH / 128cm   (constant vertical scale)
 *   hScale = boxW / totalWidthCm
 *   s = Math.min(vScale, hScale)
 */
export default function MultiPlatePreview({ plates, motifUrl }) {
  const boxRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function compute() {
      const el = boxRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const boxW = Math.max(1, rect.width);
      const boxH = Math.max(1, rect.height);

      const totalWidthCm = plates.reduce((sum, p) => sum + p.widthCm, 0) || 1;
      const vScale = boxH / HEIGHT_MAX;
      const hScale = boxW / totalWidthCm;
      setScale(Math.min(vScale, hScale));
    }
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [plates]);

  // Accumulate x offsets
  let x = 0;

  return (
    <div
      ref={boxRef}
      className="w-100 bg-white position-relative"
      style={{ height: 360, minHeight: 360, maxHeight: 360, overflow: "hidden" }}
    >
      {plates.map((p, i) => {
        const w = Math.round(p.widthCm * scale);
        const h = Math.round(p.heightCm * scale);
        const leftPx = Math.round(x * scale);
        x += p.widthCm;

        return (
          <img
            key={p.id}
            src={p.motifUrl}
            alt={`plate-${i + 1}`}
            width={w}
            height={h}
            style={{
              position: "absolute",
              left: leftPx,
              bottom: 0,
              objectFit: "cover",
              objectPosition: "left bottom",
              display: "block",
              boxShadow: "0 2px 6px rgba(0,0,0,.06)",
            }}
          />
        );
      })}
    </div>
  );
}

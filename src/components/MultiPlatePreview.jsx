import React, { useEffect, useRef, useState } from "react";
import { HEIGHT_MAX } from "../constants/limits.js";

/**
 * Step 6: Shared motif slicing
 *
 * Plates are windows on one big motif image.
 * Each plate shows the correct horizontal slice of the motif.
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
      const vScale = boxH / HEIGHT_MAX;   // vertical scale: 128cm -> box height
      const hScale = boxW / totalWidthCm; // horizontal fit
      setScale(Math.min(vScale, hScale));
    }
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [plates]);

  const boxH = 360; // preview height (fixed by style below)
  const totalWidthCm = plates.reduce((s, p) => s + p.widthCm, 0) || 1;
  const frameW = Math.round(totalWidthCm * scale);
  const frameH = boxH;

  let xCm = 0;

  return (
    <div
      ref={boxRef}
      className="w-100 bg-white position-relative"
      style={{ height: boxH, minHeight: boxH, maxHeight: boxH, overflow: "hidden" }}
    >
      {plates.map((p, i) => {
        const w = Math.round(p.widthCm * scale);
        const h = Math.round(p.heightCm * scale);
        const leftPx = Math.round(xCm * scale);
        xCm += p.widthCm;

        return (
          <div
            key={p.id}
            className="position-absolute"
            style={{
              left: leftPx,
              bottom: 0,
              width: w,
              height: h,
              overflow: "hidden",
              boxShadow: "0 2px 6px rgba(0,0,0,.06)",
            }}
          >
            {/* Shared motif image, sized to full frame, shifted left for slice */}
            <img
              src={motifUrl}
              alt={`plate-${i + 1}`}
              style={{
                position: "absolute",
                left: -leftPx,       // shift so only this slice is visible
                bottom: 0,
                width: frameW,
                height: frameH,
                objectFit: "cover",
                objectPosition: "center bottom", // crop center-out horizontally, bottom vertically
                userSelect: "none",
                pointerEvents: "none",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

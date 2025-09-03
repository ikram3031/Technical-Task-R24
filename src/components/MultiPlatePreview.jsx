import React, { useEffect, useRef, useState } from "react";
import { HEIGHT_MAX } from "../constants/limits.js";

/**
 * Step 6 + Step 7 (correct):
 * - If total width ≤ 300 cm → single motif, sliced (Step 6).
 * - If total width  > 300 cm → extend motif by mirroring tiles (Step 7).
 * Plates show their slice by offsetting the big canvas by -leftPx.
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
      const vScale = boxH / HEIGHT_MAX;   // 128 cm -> full height
      const hScale = boxW / totalWidthCm; // shrink if too wide
      setScale(Math.min(vScale, hScale));
    }
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [plates]);

  const boxH = 360; // matches your fixed preview height
  const totalWidthCm = plates.reduce((s, p) => s + p.widthCm, 0) || 1;

  // Step 7 constants
  const MOTIF_WIDTH_CM = 300;                // base motif logical width
  const needMirror = totalWidthCm > MOTIF_WIDTH_CM;

  // Frame dimensions (the full layout in px)
  const frameW = Math.round(totalWidthCm * scale);
  const frameH = boxH;

  // Mirroring tile width in px (each tile is 300 cm wide at current scale)
  const tileW = Math.round(MOTIF_WIDTH_CM * scale);
  const tileCount = Math.max(1, Math.ceil(frameW / tileW));

  // Running x (in cm) to place plate windows
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
            {/* --- Step 6: simple single image (≤ 300 cm) --- */}
            {!needMirror && (
              <img
                src={motifUrl}
                alt={`plate-${i + 1}`}
                style={{
                  position: "absolute",
                  left: -leftPx,      // shift so this plate shows its slice
                  bottom: 0,
                  width: frameW,
                  height: frameH,
                  objectFit: "cover",
                  objectPosition: "center bottom",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />
            )}

            {/* --- Step 7: mirrored tiling (> 300 cm) --- */}
            {needMirror && (
              <div
                style={{
                  position: "absolute",
                  left: -leftPx,   // align to the global canvas
                  bottom: 0,
                  width: frameW,
                  height: frameH,
                  display: "flex",
                }}
              >
                {Array.from({ length: tileCount }).map((_, idx) => (
                  <img
                    key={idx}
                    src={motifUrl}
                    alt={`motif-tile-${idx}`}
                    style={{
                      width: tileW,
                      height: frameH,
                      objectFit: "cover",
                      objectPosition: "center bottom",
                      transform: idx % 2 === 1 ? "scaleX(-1)" : "none", // mirror every other tile
                      userSelect: "none",
                      pointerEvents: "none",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { HEIGHT_MAX } from "../constants/limits.js";

/**
 * MultiPlatePreview
 * - Fixed vertical scale (128cm == preview height)
 * - Horizontal scale shrinks if total width exceeds preview width
 * - Step 6: single motif when totalWidth <= 300 cm
 * - Step 7: mirrored tiling when totalWidth > 300 cm
 */
export default function MultiPlatePreview({ plates, motifUrl }) {
  const boxRef = useRef(null);
  const [scaleX, setScaleX] = useState(1); // horizontal cm -> px
  const [scaleY, setScaleY] = useState(1); // vertical   cm -> px

  useEffect(() => {
    function compute() {
      const el = boxRef.current;
      if (!el) return;

      const boxW = Math.max(1, el.clientWidth);
      const boxH = Math.max(1, el.clientHeight);

      const totalWidthCm =
        plates.reduce((sum, p) => sum + (Number(p.widthCm) || 0), 0) || 1;

      // Always fix vertical scale so 128 cm == preview height
      const vScale = boxH / HEIGHT_MAX;

      // Horizontal fit: if too wide, shrink horizontally only
      const hScale = boxW / totalWidthCm;

      setScaleY(vScale);
      setScaleX(Math.min(vScale, hScale)); // width may shrink; height stays true-to-scale
    }

    compute();
    window.addEventListener("resize", compute);
    const id = requestAnimationFrame(compute);
    return () => {
      window.removeEventListener("resize", compute);
      cancelAnimationFrame(id);
    };
  }, [plates]);

  // Frame = full virtual layout we slice from
  const el = boxRef.current;
  const frameH = el ? el.clientHeight : 360; // px
  const totalWidthCm = plates.reduce((s, p) => s + (Number(p.widthCm) || 0), 0) || 1;
  const frameW = Math.max(1, Math.round(totalWidthCm * scaleX)); // px

  // Step 7: mirroring if total width > 300 cm
  const MOTIF_WIDTH_CM = 300;
  const needMirror = totalWidthCm > MOTIF_WIDTH_CM;
  const tileW = Math.max(1, Math.round(MOTIF_WIDTH_CM * scaleX)); // px
  const tileCount = Math.max(1, Math.ceil(frameW / tileW));

  // Accumulate left offset in cm
  let xCm = 0;

  return (
    <div
      ref={boxRef}
      className="w-100 bg-white position-relative"
      style={{ height: 360, minHeight: 360, maxHeight: 360, overflow: "hidden" }}
    >
      {plates.map((p, i) => {
        const w = Math.max(1, Math.round((Number(p.widthCm) || 0) * scaleX));
        const h = Math.max(1, Math.round((Number(p.heightCm) || 0) * scaleY));
        const leftPx = Math.round(xCm * scaleX);
        xCm += (Number(p.widthCm) || 0);

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
            {/* Step 6: single motif (≤ 300 cm) */}
            {!needMirror && (
              <img
                crossOrigin="anonymous"
                src={motifUrl}
                alt={`plate-${i + 1}`}
                style={{
                  position: "absolute",
                  left: -leftPx,     // this plate shows its slice
                  bottom: 0,
                  width: frameW,
                  height: frameH,
                  objectFit: "cover",      // no cropping; slight stretch allowed
                  objectPosition: "center center",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Step 7: mirrored tiling (> 300 cm) */}
            {needMirror && (
              <div
                style={{
                  position: "absolute",
                  left: -leftPx, // align to global canvas
                  bottom: 0,
                  width: frameW,
                  height: frameH,
                  display: "flex",
                }}
              >
                {Array.from({ length: tileCount }).map((_, idx) => (
                  <img
                    crossOrigin="anonymous"
                    key={idx}
                    src={motifUrl}
                    alt={`motif-tile-${idx}`}
                    style={{
                      width: tileW,
                      height: frameH,
                      objectFit: "cover",      // no cropping
                      objectPosition: "center center",
                      transform: idx % 2 === 1 ? "scaleX(-1)" : "none",
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

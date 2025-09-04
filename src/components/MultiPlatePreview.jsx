import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion"; // ✅ added
import { HEIGHT_MAX } from "../constants/limits.js";

/**
 * MultiPlatePreview with animation
 * - Step 6: single motif (≤ 300 cm)
 * - Step 7: mirrored tiling (> 300 cm)
 * - Animate width/height transitions
 */
export default function MultiPlatePreview({ plates, motifUrl }) {
  const boxRef = useRef(null);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);

  useEffect(() => {
    function compute() {
      const el = boxRef.current;
      if (!el) return;

      const boxW = Math.max(1, el.clientWidth);
      const boxH = Math.max(1, el.clientHeight);
      const totalWidthCm =
        plates.reduce((sum, p) => sum + (Number(p.widthCm) || 0), 0) || 1;

      const vScale = boxH / HEIGHT_MAX;
      const hScale = boxW / totalWidthCm;

      setScaleY(vScale);
      setScaleX(Math.min(vScale, hScale));
    }

    compute();
    window.addEventListener("resize", compute);
    const id = requestAnimationFrame(compute);
    return () => {
      window.removeEventListener("resize", compute);
      cancelAnimationFrame(id);
    };
  }, [plates]);

  const el = boxRef.current;
  const frameH = el ? el.clientHeight : 360;
  const totalWidthCm = plates.reduce((s, p) => s + (Number(p.widthCm) || 0), 0) || 1;
  const frameW = Math.max(1, Math.round(totalWidthCm * scaleX));

  const MOTIF_WIDTH_CM = 300;
  const needMirror = totalWidthCm > MOTIF_WIDTH_CM;
  const tileW = Math.max(1, Math.round(MOTIF_WIDTH_CM * scaleX));
  const tileCount = Math.max(1, Math.ceil(frameW / tileW));

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
          <motion.div
            key={p.id}
            className="position-absolute"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1, width: w, height: h, left: leftPx }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            style={{
              bottom: 0,
              overflow: "hidden",
              boxShadow: "0 2px 6px rgba(0,0,0,.06)",
            }}
          >
            {!needMirror && (
              <img
                crossOrigin="anonymous"
                src={motifUrl}
                alt={`plate-${i + 1}`}
                style={{
                  position: "absolute",
                  left: -leftPx,
                  bottom: 0,
                  width: frameW,
                  height: frameH,
                  objectFit: "cover",
                  objectPosition: "center center",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />
            )}

            {needMirror && (
              <div
                style={{
                  position: "absolute",
                  left: -leftPx,
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
                      objectFit: "cover",
                      objectPosition: "center center",
                      transform: idx % 2 === 1 ? "scaleX(-1)" : "none",
                      userSelect: "none",
                      pointerEvents: "none",
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { HEIGHT_MAX } from "../constants/limits.js"; // 128

export default function PlatePreview({ widthCm, heightCm, motifUrl }) {
  const boxRef = useRef(null);
  const [platePx, setPlatePx] = useState({ w: 0, h: 0 });

  useEffect(() => {
    function compute() {
      const el = boxRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const boxW = Math.max(1, rect.width);
      const boxH = Math.max(1, rect.height);

      // Constant vertical scale: 128 cm = full preview height
      const vScale = boxH / HEIGHT_MAX;

      // If the plate would overflow horizontally, reduce scale
      const hScale = boxW / Math.max(1, widthCm);

      const s = Math.min(vScale, hScale);

      setPlatePx({
        w: Math.round(widthCm * s),
        h: Math.round(heightCm * s),
      });
    }
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [widthCm, heightCm]);

  return (
    <div
      ref={boxRef}
      className="w-100 border rounded-3 bg-white position-relative"
      style={{ height: 360, minHeight: 360, maxHeight: 360, overflow: "hidden" }}
    >
      {/* Plate anchored bottom-left at exact scaled size */}
      <img
        src={motifUrl}
        alt="plate motif"
        width={platePx.w}
        height={platePx.h}
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          objectFit: "cover",        // fill the plate
          objectPosition: "left bottom",
          display: "block",
        }}
      />

      <span className="badge text-bg-dark position-absolute" style={{ right: 8, bottom: 8 }}>
        {widthCm} × {heightCm} cm
      </span>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import PlatePreview from "./components/PlatePreview.jsx";
import PlateMeta from "./components/PlateMeta.jsx";
import {
  DEFAULT_PLATE,
  STORAGE_KEY,
  DEFAULT_MOTIF_URL,
} from "./constants/config.js";

export default function App() {
  // 1) Load once from localStorage (or default)
  const [plate, setPlate] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // very small sanitize so bad urls don't stick around
        const widthCm = Number.isFinite(+parsed?.widthCm)
          ? +parsed.widthCm
          : DEFAULT_PLATE.widthCm;
        const heightCm = Number.isFinite(+parsed?.heightCm)
          ? +parsed.heightCm
          : DEFAULT_PLATE.heightCm;
        const url =
          typeof parsed?.motifUrl === "string" &&
          parsed.motifUrl.startsWith("http") &&
          !parsed.motifUrl.includes("google.com/url")
            ? parsed.motifUrl
            : DEFAULT_MOTIF_URL;
        return { widthCm, heightCm, motifUrl: url };
      }
    } catch {}
    return DEFAULT_PLATE;
  });

  // 2) Persist whenever plate changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plate));
    } catch {}
  }, [plate]);

  const handleReset = () => setPlate(DEFAULT_PLATE);

  return (
    <div className="container py-4">
      <header className="mb-3">
        <h1 className="h4 mb-1">Plate Generator — Step 1</h1>
        <p className="text-muted mb-0">
          Default plate on load + persistence (no custom hooks).
        </p>
      </header>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <strong>Preview</strong>
            </div>
            <div className="card-body">
              <PlatePreview
                widthCm={plate.widthCm}
                heightCm={plate.heightCm}
                motifUrl={plate.motifUrl}
              />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0">
            <div className="card-body">
              <PlateMeta
                plate={plate}
                storageKey={STORAGE_KEY}
                onReset={handleReset}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

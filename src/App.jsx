import React, { useEffect, useState } from "react";
import MultiPlatePreview from "./components/MultiPlatePreview.jsx";
import PlateItem from "./components/PlateItem.jsx";
import PlateMeta from "./components/PlateMeta.jsx";
import {
  DEFAULT_PLATE,
  NEW_PLATE,
  DEFAULT_MOTIF_URL,
  STORAGE_KEY,
  STORAGE_KEY_PLATES,
} from "./constants/config.js";

function withId(p) {
  return { ...p, id: crypto.randomUUID(), motifUrl: DEFAULT_MOTIF_URL };
}
const ensureMotif = (list) =>
  (Array.isArray(list) ? list : []).map((p) => ({
    ...p,
    motifUrl:
      typeof p?.motifUrl === "string" && p.motifUrl.startsWith("http")
        ? p.motifUrl
        : DEFAULT_MOTIF_URL,
  }));

export default function App() {
  const [plates, setPlates] = useState(() => {
    try {
      const savedArray = localStorage.getItem(STORAGE_KEY_PLATES);
      if (savedArray) {
        const list = JSON.parse(savedArray);
        if (Array.isArray(list) && list.length) return ensureMotif(list);
      }
      const single = localStorage.getItem(STORAGE_KEY);
      if (single) {
        const p = JSON.parse(single);
        return ensureMotif([
          withId({
            widthCm: Number.isFinite(+p?.widthCm) ? +p.widthCm : DEFAULT_PLATE.widthCm,
            heightCm: Number.isFinite(+p?.heightCm) ? +p.heightCm : DEFAULT_PLATE.heightCm,
            motifUrl: typeof p?.motifUrl === "string" ? p.motifUrl : DEFAULT_MOTIF_URL,
          }),
        ]);
      }
    } catch {}
    return ensureMotif([withId(DEFAULT_PLATE), withId(NEW_PLATE)]);
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PLATES, JSON.stringify(plates));
    } catch {}
  }, [plates]);

  const addPlate = () => {
    setPlates((prev) =>
      prev.length >= 10 ? prev : [...prev, withId(NEW_PLATE)]
    );
  };

  const removePlate = (id) => {
    setPlates((prev) =>
      prev.length <= 1 ? prev : prev.filter((p) => p.id !== id)
    );
  };

  const updatePlate = (id, next) => {
    setPlates((prev) => prev.map((p) => (p.id === id ? { ...p, ...next } : p)));
  };

  const totalWidthCm = plates.reduce((s, p) => s + p.widthCm, 0);
  const maxHeightCm = plates.reduce((m, p) => Math.max(m, p.heightCm), 0);

  return (
    <div className="container py-4">
      <header className="mb-3">
        <h1 className="h4 mb-1">Plate Generator — Step 3</h1>
        <p className="text-muted mb-0">
          Manage multiple plates. Preview is fixed; plates are exact size, laid
          out side-by-side.
        </p>
      </header>

      <div className="row g-4">
        {/* Left: multi-plate preview */}
        <div className="col-12 col-lg-8">
          <div className="left-sticky mobile-sticky">
            <div className="card shadow-sm preview-card">
              <div className="card-header bg-white">
                <strong>Preview</strong>
              </div>
              <MultiPlatePreview plates={plates} motifUrl={DEFAULT_MOTIF_URL} />
            </div>
          </div>
        </div>

        {/* Right: plate list + add button + meta */}
        <div className="col-12 col-lg-4 d-flex flex-column gap-3">
          {/* Plate forms */}
          {plates.map((p, idx) => (
            <PlateItem
              key={p.id}
              index={idx}
              plate={p}
              onCommit={(next) => updatePlate(p.id, next)}
              onRemove={() => removePlate(p.id)}
              canRemove={plates.length > 1}
            />
          ))}

          {/* Add button */}
          <div className="d-grid">
            <button
              className="btn-add"
              onClick={addPlate}
              disabled={plates.length >= 10}
            >
              Rückwand hinzufügen +
            </button>
          </div>

          {/* Meta info */}
          <div className="card border-0">
            <div className="card-body">
              <PlateMeta
                plate={{ widthCm: totalWidthCm, heightCm: maxHeightCm }}
                storageKey={STORAGE_KEY_PLATES}
                onReset={() => setPlates([withId(DEFAULT_PLATE)])}
              />
              <small className="text-muted">
                Plates: {plates.length} (1–10)
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

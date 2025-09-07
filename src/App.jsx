import React, { useEffect, useRef, useState } from "react";
import MultiPlatePreview from "./components/MultiPlatePreview.jsx";
import PlateItem from "./components/PlateItem.jsx";
import PlateMeta from "./components/PlateMeta.jsx";
import MotifUploader from "./components/MotifUploader.jsx"; // keep/remove as you wish
import PlateListDnd from "./components/PlateListDnd.jsx";   // <-- NEW
import { exportNodeToPng } from "./utils/exportPng.js";
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
      typeof p?.motifUrl === "string" &&
      (p.motifUrl.startsWith("http") || p.motifUrl.startsWith("data:"))
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

  // CRUD
  const addPlate = () => {
    setPlates((prev) => (prev.length >= 10 ? prev : [...prev, withId(NEW_PLATE)]));
  };
  const removePlate = (id) => {
    setPlates((prev) => (prev.length <= 1 ? prev : prev.filter((p) => p.id !== id)));
  };
  const updatePlate = (id, next) => {
    setPlates((prev) => prev.map((p) => (p.id === id ? { ...p, ...next } : p)));
  };

  // DnD reorder handler
  const handleReorder = (nextList) => {
    setPlates(nextList);
  };

  // Shared motif helpers (current motif = from first plate)
  const currentMotif = plates[0]?.motifUrl || DEFAULT_MOTIF_URL;
  const setMotifForAll = (url) => setPlates((prev) => prev.map((p) => ({ ...p, motifUrl: url })));
  const resetMotif = () => setMotifForAll(DEFAULT_MOTIF_URL);

  // Meta
  const totalWidthCm = plates.reduce((s, p) => s + p.widthCm, 0);
  const maxHeightCm = plates.reduce((m, p) => Math.max(m, p.heightCm), 0);

  // PNG export
  const previewRef = useRef(null);
  const handleExportPng = async () => {
    await exportNodeToPng(previewRef.current, "Rueckwand-Preview.png");
  };

  return (
    <div className="container py-4">
      <header className="mb-3">
        <h1 className="h4 mb-1">Plate Generator — Step 7 + PNG Export + DnD</h1>
        <p className="text-muted mb-0">
          Shared motif with slicing & mirroring; export as PNG; drag to reorder plates.
        </p>
      </header>

      <div className="row g-4">
        {/* Left: multi-plate preview */}
        <div className="col-12 col-lg-8">
          <div 
              // className="left-sticky mobile-sticky"
              className="sticky-top"
            >
            <div className="card shadow-sm preview-card">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <strong>Preview</strong>
                <button className="btn btn-sm btn-outline-secondary" onClick={handleExportPng}>
                  PNG exportieren
                </button>
              </div>
              <div className="card-body" ref={previewRef}>
                <MultiPlatePreview plates={plates} motifUrl={currentMotif} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: uploader (optional) + DnD list + add button + meta */}
        <div className="col-12 col-lg-4 d-flex flex-column gap-3">
          {/* Remove if you didn't add MotifUploader.jsx */}
          <MotifUploader
            value={currentMotif}
            onChange={setMotifForAll}
            onReset={resetMotif}
            defaultUrl={DEFAULT_MOTIF_URL}
          />

          {/* Drag & Drop list */}
          <PlateListDnd
            plates={plates}
            onReorder={handleReorder}
            onCommit={(id, next) => updatePlate(id, next)}
            onRemove={(id) => removePlate(id)}
          />

          {/* Add button */}
          <div className="d-grid">
            <button className="btn-add" onClick={addPlate} disabled={plates.length >= 10}>
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
              <small className="text-muted">Plates: {plates.length} (1–10)</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

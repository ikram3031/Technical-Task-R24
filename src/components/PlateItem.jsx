import React from "react";

export default function PlateItem({ index, plate, onCommit, onRemove, canRemove }) {
  return (
    <div className="plate-card d-flex align-items-center justify-content-between">
      {/* Index badge */}
      <span className="plate-index">{index + 1}</span>

      {/* Inputs in one row: Breite × Höhe */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center gap-2">
        {/* Breite */}
        <div className="d-flex flex-column text-center">
          <label className="fw-semibold">Breite</label>
          <small className="text-muted">20 – 300 cm</small>
          <div className="d-flex align-items-center gap-1">
            <input
              type="text"
              value={plate.widthCm}
              onChange={(e) =>
                onCommit({ ...plate, widthCm: parseFloat(e.target.value) || plate.widthCm })
              }
              className="plate-input-box"
            />
            <span className="unit">cm</span>
          </div>
        </div>

        {/* × sign */}
        <span className="fw-bold" style={{ fontSize: "20px" }}>×</span>

        {/* Höhe */}
        <div className="d-flex flex-column text-center">
          <label className="fw-semibold">Höhe</label>
          <small className="text-muted">30 – 128 cm</small>
          <div className="d-flex align-items-center gap-1">
            <input
              type="text"
              value={plate.heightCm}
              onChange={(e) =>
                onCommit({ ...plate, heightCm: parseFloat(e.target.value) || plate.heightCm })
              }
              className="plate-input-box"
            />
            <span className="unit">cm</span>
          </div>
        </div>
      </div>

      {/* Remove button */}
      <button
        className="btn-remove"
        onClick={onRemove}
        disabled={!canRemove}
        title={canRemove ? "Rückwand entfernen" : "Mindestens eine Rückwand benötigt"}
      >
        –
      </button>
    </div>
  );
}

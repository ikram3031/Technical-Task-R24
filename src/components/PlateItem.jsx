import React from "react";
import PlateForm from "./PlateForm.jsx";

export default function PlateItem({ index, plate, onCommit, onRemove, canRemove }) {
  return (
    <div className="plate-card d-flex align-items-center justify-content-between">
      {/* Index badge */}
      <span className="plate-index">{index + 1}</span>

      {/* Form fields (with validation & warnings) */}
      <div className="flex-grow-1">
        <PlateForm value={plate} onCommit={onCommit} />
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

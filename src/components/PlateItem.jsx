import React, { useState, useEffect } from "react";
import { WIDTH_MIN, WIDTH_MAX, HEIGHT_MIN, HEIGHT_MAX } from "../constants/limits.js";
import { parseLocaleNumber, formatNumber } from "../utils/number.js";

// helpers
const CM_PER_IN = 2.54;
const cmToUnit = (cm, unit) =>
  unit === "in" ? parseFloat((cm / CM_PER_IN).toFixed(2)) : cm;
const unitToCm = (val, unit) => (unit === "in" ? val * CM_PER_IN : val);

function formatRange(minCm, maxCm, unit) {
  const min = cmToUnit(minCm, unit);
  const max = cmToUnit(maxCm, unit);
  const f = (n) => (unit === "in" ? n.toFixed(2) : formatNumber(n));
  return `${f(min)}–${f(max)} ${unit}`;
}

export default function PlateItem({
  index,
  plate,
  onCommit,
  onRemove,
  canRemove,
  dragHandleProps = {},
}) {
  const [unit, setUnit] = useState("cm");
  const [wInput, setWInput] = useState(formatNumber(cmToUnit(plate.widthCm, unit)));
  const [hInput, setHInput] = useState(formatNumber(cmToUnit(plate.heightCm, unit)));

  const [wErr, setWErr] = useState("");
  const [hErr, setHErr] = useState("");

  // sync when props change
  useEffect(() => {
    setWInput(formatNumber(cmToUnit(plate.widthCm, unit)));
  }, [plate.widthCm, unit]);

  useEffect(() => {
    setHInput(formatNumber(cmToUnit(plate.heightCm, unit)));
  }, [plate.heightCm, unit]);

  function toggleUnit(next) {
    if (next === unit) return;
    setUnit(next);
    setWErr(""); setHErr("");
    setWInput(formatNumber(cmToUnit(plate.widthCm, next)));
    setHInput(formatNumber(cmToUnit(plate.heightCm, next)));
  }

  function commitWidth() {
    const nUnit = parseLocaleNumber(wInput);
    if (!Number.isFinite(nUnit)) {
      setWErr("Bitte Zahl eingeben.");
      setWInput(formatNumber(cmToUnit(plate.widthCm, unit)));
      return;
    }
    const nCm = unitToCm(nUnit, unit);
    if (nCm < WIDTH_MIN || nCm > WIDTH_MAX) {
      setWErr(`Erlaubt ${formatRange(WIDTH_MIN, WIDTH_MAX, unit)}`);
      setWInput(formatNumber(cmToUnit(plate.widthCm, unit)));
      return;
    }
    setWErr("");
    onCommit({ ...plate, widthCm: nCm });
  }

  function commitHeight() {
    const nUnit = parseLocaleNumber(hInput);
    if (!Number.isFinite(nUnit)) {
      setHErr("Bitte Zahl eingeben.");
      setHInput(formatNumber(cmToUnit(plate.heightCm, unit)));
      return;
    }
    const nCm = unitToCm(nUnit, unit);
    if (nCm < HEIGHT_MIN || nCm > HEIGHT_MAX) {
      setHErr(`Erlaubt ${formatRange(HEIGHT_MIN, HEIGHT_MAX, unit)}`);
      setHInput(formatNumber(cmToUnit(plate.heightCm, unit)));
      return;
    }
    setHErr("");
    onCommit({ ...plate, heightCm: nCm });
  }

  return (
    <div className="plate-row">
      {/* Index badge */}
      <span className="plate-index" {...dragHandleProps} title="Ziehen zum Neuordnen">
        {index + 1}
      </span>

      {/* Width group */}
      <div className="plate-group">
        <label className="plate-label">Breite</label>
        <div className="plate-range">{formatRange(WIDTH_MIN, WIDTH_MAX, unit)}</div>
        <div className={`plate-field ${wErr ? "error" : ""}`}>
          <input
            type="text"
            value={wInput}
            onChange={(e) => setWInput(e.target.value)}
            onBlur={commitWidth}
            placeholder={unit === "cm" ? "250" : "98.43"}
          />
          <span className="unit">{unit}</span>
        </div>
        {wErr && <div className="error-text">{wErr}</div>}
      </div>

      {/* Height group */}
      <div className="plate-group">
        <label className="plate-label">Höhe</label>
        <div className="plate-range">{formatRange(HEIGHT_MIN, HEIGHT_MAX, unit)}</div>
        <div className={`plate-field ${hErr ? "error" : ""}`}>
          <input
            type="text"
            value={hInput}
            onChange={(e) => setHInput(e.target.value)}
            onBlur={commitHeight}
            placeholder={unit === "cm" ? "128" : "50.39"}
          />
          <span className="unit">{unit}</span>
        </div>
        {hErr && <div className="error-text">{hErr}</div>}
      </div>

      {/* Unit toggle */}
      <div className="unit-toggle">
        <button className={unit === "cm" ? "active" : ""} onClick={() => toggleUnit("cm")}>
          cm
        </button>
        <button className={unit === "in" ? "active" : ""} onClick={() => toggleUnit("in")}>
          in
        </button>
      </div>

      {/* Remove button */}
      <button
        className={`btn-remove ${!canRemove ? "disabled" : ""}`}
        onClick={onRemove}
        disabled={!canRemove}
      >
        –
      </button>
    </div>
  );
}

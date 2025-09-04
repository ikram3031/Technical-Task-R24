import React, { useEffect, useState } from "react";
import { parseLocaleNumber, formatNumber } from "../utils/number.js";
import { WIDTH_MIN, WIDTH_MAX, HEIGHT_MIN, HEIGHT_MAX } from "../constants/limits.js";

// --- unit helpers ---
const CM_PER_IN = 2.54;
const cmToUnit = (cm, unit) => {
  if (unit === "in") {
    return parseFloat((cm / CM_PER_IN).toFixed(2)); // 2 decimals only
  }
  return cm;
};
const unitToCm = (val, unit) => (unit === "in" ? val * CM_PER_IN : val);

// for showing ranges nicely in current unit
function formatRange(minCm, maxCm, unit) {
  const min = cmToUnit(minCm, unit);
  const max = cmToUnit(maxCm, unit);
  // inches often shown to 2 decimals; cm as-is
  const f = (n) => (unit === "in" ? n.toFixed(2) : formatNumber(n));
  return `${f(min)}–${f(max)} ${unit}`;
}

export default function PlateForm({ value, onCommit }) {
  // unit state (per form). Default to cm. You can lift this up if you want one global toggle.
  const [unit, setUnit] = useState("cm"); // "cm" | "in"

  // input buffers (strings!) in the *current unit*
  const [wInput, setWInput] = useState(formatNumber(cmToUnit(value.widthCm, unit)));
  const [hInput, setHInput] = useState(formatNumber(cmToUnit(value.heightCm, unit)));

  const [wErr, setWErr] = useState("");
  const [hErr, setHErr] = useState("");

  // When the backing cm values change from parent, refresh inputs in current unit
  useEffect(() => {
    setWInput(formatNumber(cmToUnit(value.widthCm, unit)));
  }, [value.widthCm, unit]);
  useEffect(() => {
    setHInput(formatNumber(cmToUnit(value.heightCm, unit)));
  }, [value.heightCm, unit]);

  // Handle unit toggle (convert current displayed inputs to the other unit)
  function toggleUnit(nextUnit) {
    if (nextUnit === unit) return;
    // Recompute visible inputs from current cm values to avoid cumulative rounding
    setUnit(nextUnit);
    setWErr("");
    setHErr("");
    setWInput(formatNumber(cmToUnit(value.widthCm, nextUnit)));
    setHInput(formatNumber(cmToUnit(value.heightCm, nextUnit)));
  }

  function commitWidth() {
    const nUnit = parseLocaleNumber(wInput);
    if (!Number.isFinite(nUnit)) {
      setWErr("Bitte Zahl eingeben.");
      setWInput(formatNumber(cmToUnit(value.widthCm, unit)));
      return;
    }
    const nCm = unitToCm(nUnit, unit);
    if (nCm < WIDTH_MIN || nCm > WIDTH_MAX) {
      setWErr(`Erlaubt ${formatRange(WIDTH_MIN, WIDTH_MAX, unit)}`);
      setWInput(formatNumber(cmToUnit(value.widthCm, unit)));
      return;
    }
    setWErr("");
    onCommit({ ...value, widthCm: nCm });
  }

  function commitHeight() {
    const nUnit = parseLocaleNumber(hInput);
    if (!Number.isFinite(nUnit)) {
      setHErr("Bitte Zahl eingeben.");
      setHInput(formatNumber(cmToUnit(value.heightCm, unit)));
      return;
    }
    const nCm = unitToCm(nUnit, unit);
    if (nCm < HEIGHT_MIN || nCm > HEIGHT_MAX) {
      setHErr(`Erlaubt ${formatRange(HEIGHT_MIN, HEIGHT_MAX, unit)}`);
      setHInput(formatNumber(cmToUnit(value.heightCm, unit)));
      return;
    }
    setHErr("");
    onCommit({ ...value, heightCm: nCm });
  }

  return (
    <div className="px-3 pb-3">
      {/* Unit toggle */}
      <div className="d-flex justify-content-end mb-2">
        <div className="btn-group btn-group-sm" role="group" aria-label="Einheiten wählen">
          <button
            type="button"
            className={`btn ${unit === "cm" ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => toggleUnit("cm")}
          >
            cm
          </button>
          <button
            type="button"
            className={`btn ${unit === "in" ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => toggleUnit("in")}
          >
            in
          </button>
        </div>
      </div>

      <div className="row g-3">
        {/* WIDTH */}
        <div className="col-12 col-sm-6">
          <label className="small text-muted d-block mb-1">Breite</label>
          <div className="d-flex justify-content-between mb-1">
            <small className="text-muted">
              {formatRange(WIDTH_MIN, WIDTH_MAX, unit)}
            </small>
          </div>
          <div className="input-group input-pill">
            <input
              type="text"
              inputMode="decimal"
              className={`form-control ${wErr ? "is-invalid" : ""}`}
              value={wInput}
              onChange={(e) => setWInput(e.target.value)}
              onBlur={commitWidth}
              placeholder={unit === "cm" ? "250" : "98.43"}
            />
            <span className="input-group-text">{unit}</span>
            {wErr && <div className="invalid-feedback">{wErr}</div>}
          </div>
        </div>

        {/* HEIGHT */}
        <div className="col-12 col-sm-6">
          <label className="small text-muted d-block mb-1">Höhe</label>
          <div className="d-flex justify-content-between mb-1">
            <small className="text-muted">
              {formatRange(HEIGHT_MIN, HEIGHT_MAX, unit)}
            </small>
          </div>
          <div className="input-group input-pill">
            <input
              type="text"
              inputMode="decimal"
              className={`form-control ${hErr ? "is-invalid" : ""}`}
              value={hInput}
              onChange={(e) => setHInput(e.target.value)}
              onBlur={commitHeight}
              placeholder={unit === "cm" ? "128" : "50.39"}
            />
            <span className="input-group-text">{unit}</span>
            {hErr && <div className="invalid-feedback">{hErr}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

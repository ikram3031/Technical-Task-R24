import React, { useEffect, useState } from "react";
import { parseLocaleNumber, formatNumber } from "../utils/number.js";
import { WIDTH_MIN, WIDTH_MAX, HEIGHT_MIN, HEIGHT_MAX } from "../constants/limits.js";

export default function PlateForm({ value, onCommit }) {
  const [wInput, setWInput] = useState(formatNumber(value.widthCm));
  const [hInput, setHInput] = useState(formatNumber(value.heightCm));
  const [wErr, setWErr] = useState("");
  const [hErr, setHErr] = useState("");

  useEffect(() => { setWInput(formatNumber(value.widthCm)); }, [value.widthCm]);
  useEffect(() => { setHInput(formatNumber(value.heightCm)); }, [value.heightCm]);

  function commitWidth() {
    const n = parseLocaleNumber(wInput);
    if (!Number.isFinite(n)) { setWErr("Bitte Zahl eingeben."); setWInput(formatNumber(value.widthCm)); return; }
    if (n < WIDTH_MIN || n > WIDTH_MAX) { setWErr(`Erlaubt ${WIDTH_MIN}–${WIDTH_MAX} cm`); setWInput(formatNumber(value.widthCm)); return; }
    setWErr(""); onCommit({ ...value, widthCm: n });
  }
  function commitHeight() {
    const n = parseLocaleNumber(hInput);
    if (!Number.isFinite(n)) { setHErr("Bitte Zahl eingeben."); setHInput(formatNumber(value.heightCm)); return; }
    if (n < HEIGHT_MIN || n > HEIGHT_MAX) { setHErr(`Erlaubt ${HEIGHT_MIN}–${HEIGHT_MAX} cm`); setHInput(formatNumber(value.heightCm)); return; }
    setHErr(""); onCommit({ ...value, heightCm: n });
  }

  return (
    <div className="px-3 pb-3">
      <div className="row g-3">
        {/* WIDTH */}
        <div className="col-12 col-sm-6">
          <label className="small text-muted d-block mb-1">Breite</label>
          <div className="d-flex justify-content-between mb-1">
            <small className="text-muted">{WIDTH_MIN}–{WIDTH_MAX} cm</small>
          </div>
          <div className="input-group input-pill">
            <input
              type="text" inputMode="decimal"
              className={`form-control ${wErr ? "is-invalid" : ""}`}
              value={wInput}
              onChange={(e)=>setWInput(e.target.value)}
              onBlur={commitWidth}
              placeholder="250"
            />
            <span className="input-group-text">cm</span>
            {wErr && <div className="invalid-feedback">{wErr}</div>}
          </div>
          <span className="meta-line">{Math.round(parseLocaleNumber(wInput||value.widthCm)*10)} mm</span>
        </div>

        {/* HEIGHT */}
        <div className="col-12 col-sm-6">
          <label className="small text-muted d-block mb-1">Höhe</label>
          <div className="d-flex justify-content-between mb-1">
            <small className="text-muted">{HEIGHT_MIN}–{HEIGHT_MAX} cm</small>
          </div>
          <div className="input-group input-pill">
            <input
              type="text" inputMode="decimal"
              className={`form-control ${hErr ? "is-invalid" : ""}`}
              value={hInput}
              onChange={(e)=>setHInput(e.target.value)}
              onBlur={commitHeight}
              placeholder="128"
            />
            <span className="input-group-text">cm</span>
            {hErr && <div className="invalid-feedback">{hErr}</div>}
          </div>
          <span className="meta-line">{Math.round(parseLocaleNumber(hInput||value.heightCm)*10)} mm</span>
        </div>
      </div>
      <small className="text-muted d-block mt-2">
        Unterstützt „.“ und „,“ als Dezimaltrennzeichen. Werte werden nur beim Verlassen des Feldes gespeichert.
      </small>
    </div>
  );
}

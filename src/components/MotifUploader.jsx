import React, { useRef, useState } from "react";

export default function MotifUploader({ value, onChange, onReset, defaultUrl }) {
  const fileRef = useRef(null);
  const [urlInput, setUrlInput] = useState("");

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Persist across reloads by saving as DataURL (base64)
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result; // "data:image/...;base64,..."
      if (typeof dataUrl === "string") onChange(dataUrl);
    };
    reader.readAsDataURL(file);
    // reset input so selecting the same file again still triggers change
    e.target.value = "";
  }

  function applyUrl() {
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    setUrlInput("");
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white">
        <strong>Motiv (Bild)</strong>
      </div>
      <div className="card-body d-flex flex-column gap-2">
        {/* Current preview */}
        <div className="d-flex align-items-center gap-3">
          <div
            style={{
              width: 64,
              height: 40,
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              backgroundImage: `url(${value})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            aria-label="Aktuelles Motiv"
            title="Aktuelles Motiv"
          />
          <small className="text-muted text-truncate" style={{maxWidth: '220px'}}>
            {value?.startsWith("data:") ? "Benutzerdefiniertes Bild (hochgeladen)" : value}
          </small>
        </div>

        {/* Upload from device */}
        <div className="d-flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="form-control"
          />
        </div>

        {/* Or paste image URL */}
        <div className="input-group">
          <input
            type="url"
            className="form-control"
            placeholder="https://example.com/bild.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <button 
            className="btn btn-outline-secondary" 
            onClick={applyUrl}
          >
            Übernehmen
          </button>
        </div>

        {/* Reset to default */}
        <div>
          <button
            className="px-3 py-1 btn-green"
          >
            Auf Standardmotiv zurücksetzen
          </button>

          {/* <button className="btn btn-outline-green-500 btn-sm" onClick={onReset}>
            Auf Standardmotiv zurücksetzen
          </button> */}
        </div>

        <small className="text-muted">
          Du kannst ein Bild hochladen (bleibt gespeichert) oder eine Bild-URL einfügen.
        </small>
      </div>
    </div>
  );
}

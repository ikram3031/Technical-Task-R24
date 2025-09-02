import React from "react";


export default function PlateMeta({ plate, storageKey, onReset }) {
return (
<div>
<h2 className="h6">Current Plate (read‑only)</h2>
<dl className="row mb-0">
<dt className="col-5">Width</dt>
<dd className="col-7">{plate.widthCm} cm</dd>
<dt className="col-5">Height</dt>
<dd className="col-7">{plate.heightCm} cm</dd>
</dl>
<div className="d-flex gap-2 mt-3">
<button className="btn btn-outline-secondary btn-sm" onClick={onReset}>Reset to defaults</button>
</div>
<hr />
<small className="text-muted d-block">Persisted key: <code>{storageKey}</code></small>
</div>
);
}
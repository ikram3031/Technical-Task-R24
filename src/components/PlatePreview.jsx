import React from "react";


export default function PlatePreview({ widthCm, heightCm, motifUrl }) {
const aspect = (heightCm / widthCm) * 100; // maintain aspect ratio visually
return (
<div className="ratio" style={{ maxWidth: "100%" }}>
<div
className="w-100 rounded-3 border position-relative"
style={{
paddingTop: `${aspect}%`,
backgroundImage: `url(${motifUrl})`,
backgroundSize: "cover",
backgroundPosition: "center",
backgroundRepeat: "no-repeat",
}}
>
<span className="badge text-bg-dark position-absolute" style={{ right: 8, bottom: 8 }}>
{widthCm} × {heightCm} cm
</span>
</div>
</div>
);
}
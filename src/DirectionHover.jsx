import React from 'react';

export default function DirectionHover({ 
  title = "ПОЖАРЫ КАЗАХСТАНА", 
  hoverColor = "#ff7a1f" 
}) {
  return (
    <div style={{ position: "relative", display: "inline-block", cursor: "pointer", overflow: "hidden" }}>
      <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "var(--tx-strong)", letterSpacing: "0.5px" }}>
        {title}
      </h1>
    </div>
  );
}
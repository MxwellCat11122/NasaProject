import React from 'react';

export default function DirectionHover({ 
  title = "ПОЖАРЫ КАЗАХСТАНА", 
  hoverColor = "#ff7a1f" 
}) {
  return (
    <div style={{ position: "relative", display: "inline-block", cursor: "pointer", overflow: "hidden" }}>
<<<<<<< HEAD
      <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "var(--tx-strong)", letterSpacing: "0.5px" }}>
=======
      <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#ffffff", letterSpacing: "0.5px" }}>
>>>>>>> b37e070b6c9c56c702e75cbe1f18470021744b22
        {title}
      </h1>
    </div>
  );
}
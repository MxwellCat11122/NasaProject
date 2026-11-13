import * as React from "react"; 

export default function LiquidCarveButton(props) { 
    const { 
        label = "BUTTON", 
        font = { fontFamily: "Inter", fontWeight: 600, fontSize: 13, lineHeight: "1.5em", letterSpacing: "0em", textAlign: "left" }, 
        showText = true, 
        padding = "10px 20px", 
        rounded = 12, 
        style, 
        onClick,
        isActive = false
    } = props; 

    const [isHovered, setIsHovered] = React.useState(false);

<<<<<<< HEAD
    const bgStyle = isActive ? "var(--ac)" : isHovered ? "var(--hover-bg)" : "var(--card-alt)";
    const textColor = isActive ? "var(--ac-tx)" : "var(--tx-strong)";
=======
    // Активное состояние — белая кнопка с черным текстом. Неактивное — черный фон, белый текст.
    const bgStyle = isActive ? "#ffffff" : isHovered ? "#18181b" : "#000000";
    const textColor = isActive ? "#000000" : "#ffffff";
>>>>>>> b37e070b6c9c56c702e75cbe1f18470021744b22

    return ( 
        <div 
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            role="button" 
            tabIndex={0}
            aria-label={label} 
            style={{ 
                position: "relative", 
                display: "inline-flex", 
                alignItems: "center", 
                justifyContent: "center", 
                padding, 
                backgroundColor: bgStyle,
                color: textColor,
                borderRadius: `${rounded}px`,
                cursor: "pointer", 
                userSelect: "none", 
                boxSizing: "border-box", 
                overflow: "hidden", 
<<<<<<< HEAD
                border: "1px solid var(--bd)", 
=======
                border: "none", 
>>>>>>> b37e070b6c9c56c702e75cbe1f18470021744b22
                outline: "none",
                transition: "background-color 0.2s ease, transform 0.15s ease",
                transform: isHovered && !isActive ? "translateY(-1px)" : "none",
                ...style, 
            }} 
        > 
            <span style={{ 
                position: "relative", 
                zIndex: 2, 
                display: "inline-flex", 
                alignItems: "center", 
                lineHeight: 1, 
                whiteSpace: "nowrap", 
                ...font, 
                color: textColor, 
                pointerEvents: "none", 
            }}> 
                {showText && <span>{label}</span>} 
            </span> 
        </div> 
    ); 
}
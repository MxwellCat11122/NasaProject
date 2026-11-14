import { useEffect, useMemo, useRef, useState } from "react";
import fire1 from "./assets/fire1.jpg";
import fire2 from "./assets/fire2.jpg";
import fire4 from "./assets/fire4.jpg";
import fire from "./assets/fire.jpg";

const DEFAULT_IMAGES = [fire1, fire2, fire4, fire];

export default function SpinImage({
  images = DEFAULT_IMAGES,
  imageWidth = 130,
  imageHeight = 130,
  direction = "anticlockwise",
  path = "curved",
  xCurve = 63,
  yCurve = -47,
  speed = 3,
  rounded = 4,
  orbitWidthPct = 72,
}) {
  const items = useMemo(() => {
    const list = Array.isArray(images) && images.length ? images : DEFAULT_IMAGES;
    return list
      .map(item => (typeof item === "string" ? item : item?.src))
      .filter(Boolean);
  }, [images]);

  const containerRef = useRef(null);
  const [dims, setDims] = useState({ W: 0, H: 0 });
  const [orbitPhi, setOrbitPhi] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      const W = Math.round(r.width);
      const H = Math.round(r.height);
      if (W && H) setDims({ W, H });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { W, H } = dims;
  const revsPerSec = Math.max(0, Math.min(20, speed)) * 0.05;
  const dir = direction === "anticlockwise" ? -1 : 1;

  useEffect(() => {
    if (!W || !H || revsPerSec <= 0) return;
    const start = performance.now();
    let raf = 0;
    const tick = now => {
      const elapsed = (now - start) / 1000;
      setOrbitPhi(dir * 2 * Math.PI * revsPerSec * elapsed);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [W, H, revsPerSec, dir]);

  const radius =
    (Math.max(0, Math.min(20, rounded)) / 20) *
    (Math.min(imageWidth, imageHeight) / 2);
  const totalW = (Math.max(0, Math.min(100, orbitWidthPct)) / 100) * W;
  const a = totalW / 2;
  const b = a * 0.3;
  const theta0 = Math.atan2(H, W);
  const cosT = Math.cos(theta0);
  const sinT = Math.sin(theta0);
  const cx = W / 2;
  const cy = H / 2;
  const n = items.length;

  return (
    <div
      ref={containerRef}
      className="spin-orbit"
      style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        height: "360px",
        marginTop: "52px",
        marginBottom: "36px",
        overflow: "visible",
        perspective: 1200,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transform: `rotateY(${xCurve}deg) rotateX(${-yCurve}deg)`,
        }}
      >
        {W > 0 &&
          H > 0 &&
          items.map((src, i) => {
            const phi = (i / n) * Math.PI * 2 + orbitPhi;
            const ex = a * Math.cos(phi);
            const ey = b * Math.sin(phi);
            const x = ex * cosT - ey * sinT;
            const y = ex * sinT + ey * cosT;
            const left = cx + x - imageWidth / 2;
            const top = cy + y - imageHeight / 2;
            const depth = (Math.cos(phi) + 1) / 2;
            const sf = path === "curved" ? 0.6 + 0.75 * depth : 1;

            return (
              <div
                key={`${src}-${i}`}
                style={{
                  position: "absolute",
                  left,
                  top,
                  width: imageWidth,
                  height: imageHeight,
                  transform: `rotateX(${yCurve}deg) rotateY(${-xCurve}deg) scale(${sf})`,
                  zIndex: Math.round(y),
                  borderRadius: radius,
                  overflow: "hidden",
                  background: "var(--card)",
                  boxShadow: "0 10px 26px rgba(0, 0, 0, 0.25)",
                  border: "1px solid var(--bd)",
                  willChange: "left, top, transform",
                  pointerEvents: "none",
                }}
              >
                <img
                  src={src}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
            );
          })}
      </div>
    </div>
  );
}
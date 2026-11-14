import { useEffect, useMemo, useRef, useState } from "react";
import fire1 from "./assets/fire1.jpg";
import fire2 from "./assets/fire2.jpg";
import fire4 from "./assets/fire4.jpg";
import fire from "./assets/fire.jpg";

const DEFAULT_IMAGES = [fire1, fire2, fire4, fire];

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

export default function SpinImage({
  images = DEFAULT_IMAGES,
  imageWidth = 180,
  imageHeight = 180,
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

  // Адаптация под ширину экрана: на телефоне картинки меньше, орбита шире
  const ui = clamp(W / 560, 0.62, 1);
  const iw = imageWidth * ui;
  const ih = imageHeight * ui;
  const pct = W && W < 600 ? Math.max(orbitWidthPct, 88) : orbitWidthPct;

  const radius =
    (Math.max(0, Math.min(20, rounded)) / 20) * (Math.min(iw, ih) / 2);
  const totalW = (Math.max(0, Math.min(100, pct)) / 100) * W;
  const a = totalW / 2;
  const b = a * 0.3;
  const theta0 = Math.atan2(H, W);
  const cosT = Math.cos(theta0);
  const sinT = Math.sin(theta0);
  const cx = W / 2;
  const cy = H / 2;
  const n = items.length;

  // Реальная глубина точки орбиты внутри наклонённой плоскости.
  // Размер картинки считаем от неё же, чтобы порядок слоёв в 3D всегда совпадал с размером.
  const rx = (-yCurve * Math.PI) / 180;
  const ry = (xCurve * Math.PI) / 180;
  const sA = Math.sin(rx);
  const cB = Math.cos(ry);
  const sB = Math.sin(ry);
  const kx = -sB * cosT + sA * cB * sinT; // вклад ex в глубину
  const ky = sB * sinT + sA * cB * cosT; // вклад ey в глубину
  const zAmp = Math.max(Math.hypot(a * kx, b * ky), 1);

  return (
    <div
      ref={containerRef}
      className="spin-orbit"
      style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        height: "min(360px, 85vw)",
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
            const left = cx + x - iw / 2;
            const top = cy + y - ih / 2;

            // 0 — самая дальняя точка орбиты, 1 — самая ближняя
            const z = a * Math.cos(phi) * kx + b * Math.sin(phi) * ky;
            const depth = clamp((z / zAmp + 1) / 2, 0, 1);
            const sf = path === "curved" ? 0.6 + 0.75 * depth : 1;

            return (
              <div
                key={`${src}-${i}`}
                style={{
                  position: "absolute",
                  left,
                  top,
                  width: iw,
                  height: ih,
                  transform: `rotateX(${yCurve}deg) rotateY(${-xCurve}deg) scale(${sf})`,
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
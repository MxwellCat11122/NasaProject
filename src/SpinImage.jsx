import { useEffect, useMemo, useRef, useState } from "react";
import fire1 from "./assets/fire1.jpg";
import fire2 from "./assets/fire2.jpg";
import fire4 from "./assets/fire4.jpg";
import fire from "./assets/fire.jpg";

const DEFAULT_IMAGES = [fire1, fire2, fire4, fire];

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const PERSPECTIVE = 1200;
const SAMPLES = 90;

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

  // --- геометрия -----------------------------------------------------------
  const ui = clamp(W / 560, 0.62, 1);
  const pct = W && W < 600 ? Math.max(orbitWidthPct, 88) : orbitWidthPct;
  const theta0 = Math.atan2(H, W);
  const cosT = Math.cos(theta0);
  const sinT = Math.sin(theta0);
  const cx = W / 2;
  const cy = H / 2;
  const n = items.length;

  const rx = (-yCurve * Math.PI) / 180;
  const ry = (xCurve * Math.PI) / 180;
  const cA = Math.cos(rx);
  const sA = Math.sin(rx);
  const cB = Math.cos(ry);
  const sB = Math.sin(ry);
  const kx = -sB * cosT + sA * cB * sinT;
  const ky = sB * sinT + sA * cB * cosT;

  // точка орбиты: позиция в плоскости, глубина, размер и проекция на экран
  const place = (phi, A, B) => {
    const ex = A * Math.cos(phi);
    const ey = B * Math.sin(phi);
    const x = ex * cosT - ey * sinT;
    const y = ex * sinT + ey * cosT;
    const y1 = y * cA;
    const z1 = y * sA;
    const x2 = x * cB + z1 * sB;
    const z2 = -x * sB + z1 * cB;
    const zAmp = Math.max(Math.hypot(A * kx, B * ky), 1);
    const depth = clamp((z2 / zAmp + 1) / 2, 0, 1);
    const sf = path === "curved" ? 0.6 + 0.75 * depth : 1;
    const persp = PERSPECTIVE / Math.max(PERSPECTIVE - z2, 1);
    return { x, y, x2, y1, sf, persp, scale: sf * persp };
  };

  // замер: насколько орбита с картинками выходит за блок
  const a0 = (Math.max(0, Math.min(100, pct)) / 100) * W * 0.5;
  const b0 = a0 * 0.3;
  const iw0 = imageWidth * ui;
  const ih0 = imageHeight * ui;

  let ext = 0;
  let up = 0;
  let down = 0;
  if (W > 0 && H > 0) {
    for (let k = 0; k < SAMPLES; k += 1) {
      const p = place((k / SAMPLES) * Math.PI * 2, a0, b0);
      ext = Math.max(ext, Math.abs(p.x2 * p.persp) + (iw0 * p.scale) / 2);
      up = Math.max(up, -p.y1 * p.persp + (ih0 * p.scale) / 2);
      down = Math.max(down, p.y1 * p.persp + (ih0 * p.scale) / 2);
    }
  }

  // если не помещается по ширине — уменьшаем всю композицию целиком
  const fit = W > 0 && ext > 0 ? clamp((W / 2 - 6) / ext, 0.35, 1) : 1;
  const a = a0 * fit;
  const b = b0 * fit;
  const iw = iw0 * fit;
  const ih = ih0 * fit;

  const marginTop = W > 0 ? Math.max(24, Math.round(up * fit - H / 2) + 16) : 52;
  const marginBottom = W > 0 ? Math.max(24, Math.round(down * fit - H / 2) + 16) : 36;

  const radius =
    (Math.max(0, Math.min(20, rounded)) / 20) * (Math.min(iw, ih) / 2);

  return (
    <div
      ref={containerRef}
      className="spin-orbit"
      style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        height: "min(360px, 85vw)",
        marginTop,
        marginBottom,
        overflow: "visible",
        perspective: PERSPECTIVE,
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
            const p = place(phi, a, b);

            return (
              <div
                key={`${src}-${i}`}
                style={{
                  position: "absolute",
                  left: cx + p.x - iw / 2,
                  top: cy + p.y - ih / 2,
                  width: iw,
                  height: ih,
                  transform: `rotateX(${yCurve}deg) rotateY(${-xCurve}deg) scale(${p.sf})`,
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
import { useEffect, useRef, useMemo } from "react";
import { useAnimate } from "framer-motion";

const TAGS = ["h1", "h2", "h3", "p", "div"];

const DEFAULT_TEXTS = ["БЕРЕГИ", "ПОСМОТРИ", "УЗНАЙ"];

const DEFAULT_TRANSITION = {
  type: "tween",
  duration: 1.2,
  ease: [0.7, 0, 0.25, 1],
};

export default function ZoomTextTunnel(rawProps = {}) {
  const {
    texts = DEFAULT_TEXTS,
    font = {
      fontFamily: "Inter, system-ui, sans-serif",
      fontWeight: 700,
      fontSize: "clamp(36px, 7vw, 96px)",
      lineHeight: "1em",
      letterSpacing: "-0.02em",
      textAlign: "center",
    },
    color = "var(--tx-strong)",
    tag = "h2",
    maxScale = 22,
    hold = 900,
    transition = DEFAULT_TRANSITION,
    style,
  } = rawProps;

  const [scope, animate] = useAnimate();
  const slot0Ref = useRef(null);
  const slot1Ref = useRef(null);
  const timeoutRef = useRef(null);
  const controlsRef = useRef([]);

  const safeTexts = useMemo(() => {
    const cleaned = Array.isArray(texts)
      ? texts.filter(item => typeof item === "string" && item.trim().length > 0)
      : [];
    return cleaned.length > 0 ? cleaned : DEFAULT_TEXTS;
  }, [texts]);

  const clampedMaxScale = useMemo(() => {
    const n = Number(maxScale);
    return Number.isFinite(n) ? Math.max(1, n) : 22;
  }, [maxScale]);

  const holdMs = useMemo(() => {
    const n = Number(hold);
    return Number.isFinite(n) ? Math.max(0, n) : 900;
  }, [hold]);

  const longest = useMemo(
    () => safeTexts.reduce((a, b) => (b.length > a.length ? b : a), safeTexts[0]),
    [safeTexts]
  );

  useEffect(() => {
    const slots = [slot0Ref.current, slot1Ref.current];
    const sel = [".slot-0", ".slot-1"];

    if (safeTexts.length <= 1) {
      if (slots[0]) slots[0].textContent = safeTexts[0];
      animate(sel[0], { scale: 1, opacity: 1 }, { duration: 0 });
      animate(sel[1], { scale: 0.05, opacity: 0 }, { duration: 0 });
      return;
    }

    let cancelled = false;
    let active = 0;
    let idx = 0;

    if (slots[0]) slots[0].textContent = safeTexts[0];
    animate(sel[0], { scale: 1, opacity: 1 }, { duration: 0 });
    animate(sel[1], { scale: 0.05, opacity: 0 }, { duration: 0 });

    const wait = ms =>
      new Promise(res => {
        timeoutRef.current = setTimeout(res, ms);
      });
    const settle = c => (c && c.finished ? c.finished : Promise.resolve());

    const run = async () => {
      while (!cancelled) {
        await wait(holdMs);
        if (cancelled) return;

        const inc = 1 - active;
        const nextIdx = (idx + 1) % safeTexts.length;
        if (slots[inc]) slots[inc].textContent = safeTexts[nextIdx];

        await settle(animate(sel[inc], { scale: 0.05, opacity: 0 }, { duration: 0 }));
        if (cancelled) return;

        const enter = animate(sel[inc], { scale: 1, opacity: 1 }, transition);
        const exit = animate(sel[active], { scale: clampedMaxScale, opacity: 0 }, transition);
        controlsRef.current = [enter, exit];

        await settle(exit);
        if (cancelled) return;

        await settle(animate(sel[active], { scale: 0.05, opacity: 0 }, { duration: 0 }));
        active = inc;
        idx = nextIdx;
      }
    };
    run();

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      controlsRef.current.forEach(c => c && c.stop && c.stop());
    };
  }, [safeTexts, transition, clampedMaxScale, holdMs, animate]);

  const safeTag = TAGS.includes(tag) ? tag : "h2";
  const Tag = safeTag;

  const srOnly = {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    whiteSpace: "nowrap",
    border: 0,
  };

  const slotStyle = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
    color,
    transition: "color 0.25s ease",
    transformOrigin: "center center",
    willChange: "transform, opacity",
    ...font,
  };

  return (
    <div
      ref={scope}
      aria-label={safeTexts.join(", ")}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        width: "100%",
        height: "180px",
        marginTop: "24px",
        ...style,
      }}
    >
      <Tag style={srOnly}>{safeTexts.join(", ")}</Tag>

      <span
        aria-hidden="true"
        style={{
          visibility: "hidden",
          whiteSpace: "nowrap",
          color,
          ...font,
        }}
      >
        {longest}
      </span>

      <span ref={slot0Ref} className="slot-0" aria-hidden="true" style={slotStyle} />
      <span ref={slot1Ref} className="slot-1" aria-hidden="true" style={slotStyle} />
    </div>
  );
}
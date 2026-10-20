import { useEffect, useRef, useState } from 'react';

// Поднимающиеся искры на первом экране
export function Embers() {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = cv.getContext('2d');
    let w = 0, h = 0, raf = 0, run = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const r = cv.getBoundingClientRect();
      w = r.width;
      h = r.height;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    const mk = fresh => ({
      x: Math.random() * w,
      y: fresh ? h + Math.random() * 40 : Math.random() * h,
      r: 0.6 + Math.random() * 1.8,
      vy: 0.25 + Math.random() * 0.9,
      sw: Math.random() * Math.PI * 2,
      sp: 0.01 + Math.random() * 0.025,
      hue: 18 + Math.random() * 28
    });
    const N = Math.round(Math.min(90, Math.max(35, (w * h) / 22000)));
    const ps = Array.from({ length: N }, () => mk(false));

    const tick = () => {
      if (!run) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.y -= p.vy;
        p.sw += p.sp;
        p.x += Math.sin(p.sw) * 0.35;
        const life = Math.max(0, p.y / h); // 1 внизу → 0 вверху
        const a = Math.min(1, life * 1.6) * (0.55 + 0.45 * Math.sin(p.sw * 3));
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 100%, 62%, ${a * 0.9})`;
        ctx.shadowColor = `hsla(${p.hue}, 100%, 55%, ${a})`;
        ctx.shadowBlur = 10;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        if (p.y < -10) Object.assign(p, mk(true));
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    // экономим батарею, когда вкладка скрыта
    const vis = () => {
      if (document.hidden) {
        run = false;
        cancelAnimationFrame(raf);
      } else if (!run) {
        run = true;
        tick();
      }
    };
    document.addEventListener('visibilitychange', vis);

    return () => {
      run = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener('visibilitychange', vis);
    };
  }, []);

  return <canvas ref={ref} className="embers" aria-hidden="true" />;
}

// Тонкая полоса прогресса прокрутки
export function Progress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = document.documentElement;
        const max = el.scrollHeight - el.clientHeight;
        setP(max > 0 ? el.scrollTop / max : 0);
      });
    };
    window.addEventListener('scroll', on, { passive: true });
    on();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', on);
    };
  }, []);
  return <div className="prog" style={{ transform: `scaleX(${p})` }} />;
}

// Счётчик, который «набегает» при появлении на экране
export function CountUp({ to, dec = 0, suffix = '', dur = 1600 }) {
  const ref = useRef(null);
  const [v, setV] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setV(to);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = now => {
        const k = Math.min(1, (now - t0) / dur);
        setV(to * (1 - Math.pow(1 - k, 4)));
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, dur]);

  const s =
    dec > 0
      ? v.toFixed(dec)
      : Math.round(v).toLocaleString('ru-RU').replace(/ | /g, ' ');
  return (
    <span ref={ref}>
      {s}
      {suffix}
    </span>
  );
}
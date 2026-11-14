import { useState, useMemo, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { M, V, T, R, Y, MY, VY, MM, VM, CL, CM, CV, C, CN, CN_KZ, CLE, CLE_KZ, RE } from './data';
import MapSection from "./MapSection";
import DirLink from './DirLink';
import { MT } from './mapdata';
import { Embers, Progress, CountUp } from './Fx';
import LiquidCarveButton from './ButtonHover';
import DirectionHover from './DirectionHover';
import SpinImage from './SpinImage';
import ZoomTextTunnel from './ZoomTextTunnel';
import './App.css';
import './extra.css';

if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

// Ленивый импорт файлов из src/fires/*.json — не попадают в начальный бандл
const SRC_FIRE_MODULES = import.meta.glob('./fires/*.json');

const PUBLIC_FIRE_FILES = [
  'fire_archive_J1V-C2_847758.json',
  'fire_archive_J1V-C2_847762.json',
  'fire_archive_J1V-C2_847766.json',
  'fire_archive_J2V-C2_847759.json',
  'fire_archive_J2V-C2_847763.json',
  'fire_archive_M-C61_847757.json',
  'fire_archive_M-C61_847761.json',
  'fire_archive_M-C61_847765.json',
  'fire_archive_SV-C2_847760.json',
  'fire_archive_SV-C2_847764.json',
  'fire_archive_SV-C2_847768.json',
  'fire_nrt_J1V-C2_847758.json',
  'fire_nrt_J2V-C2_847759.json',
  'fire_nrt_M-C61_847757.json',
  'fire_nrt_SV-C2_847760.json',
];

function usePageSetup() {
  useLayoutEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    const secs = document.querySelectorAll('.main section:not(#home)');
    secs.forEach(s => s.classList.add('reveal'));

    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.12 }
    );
    secs.forEach(s => io.observe(s));

    const onMove = e => {
      const el = e.target.closest && e.target.closest('.card, .st, .note, .guide-card');
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    document.addEventListener('mousemove', onMove, { passive: true });

    return () => {
      io.disconnect();
      document.removeEventListener('mousemove', onMove);
    };
  }, []);
}

const Legend = ({ m = 1, v = 1, mc = M, vc = V }) => (
  <div className="leg">
    {m ? <span style={{ color: mc }}><b style={{ background: mc }}></b>MODIS</span> : null}
    {v ? <span style={{ color: vc }}><b style={{ background: vc }}></b>VIIRS</span> : null}
  </div>
);

const Bars = ({ labels, series, max, rot, fmt = x => x, vl = "Значение" }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [ready, setReady] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setReady(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", width: "100%", paddingTop: "36px" }} onMouseLeave={() => setHoveredIndex(null)}>
      {hoveredIndex !== null && (
        <div
          className="bar-tooltip"
          style={{
            left: `${((hoveredIndex + 0.5) / labels.length) * 100}%`,
            transform: hoveredIndex > labels.length - 4 ? "translateX(-100%)" : hoveredIndex < 3 ? "translateX(0%)" : "translateX(-50%)"
          }}
        >
          <div className="bar-tooltip-title">{labels[hoveredIndex]}</div>
          {series.map((s, j) => (
            <div className="bar-tooltip-row" key={j}>
              <span style={{ color: s.c, fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: s.c, display: "inline-block" }}></span>
                {s.name || (series.length === 1 ? vl : j === 0 ? "MODIS" : "VIIRS")}
              </span>
              <b>{fmt(s.v[hoveredIndex])}</b>
            </div>
          ))}
        </div>
      )}

      <div className="bars">
        {labels.map((l, i) => {
          const isHovered = hoveredIndex === i;
          return (
            <div
              className={`g ${isHovered ? "active" : ""}`}
              key={l}
              onMouseEnter={() => setHoveredIndex(i)}
              onTouchStart={() => setHoveredIndex(i)}
            >
              {series.map((s, j) => (
                <i
                  key={j}
                  style={{
                    height: ready ? `${(s.v[i] / max) * 100}%` : "0%",
                    transition: `height .9s var(--ease) ${i * 20}ms, filter .15s ease`,
                    background: isHovered ? `linear-gradient(180deg, ${s.c}, ${s.c}cc)` : `linear-gradient(180deg, ${s.c}, ${s.c}66)`,
                    boxShadow: isHovered ? `0 0 16px ${s.c}aa` : `0 0 6px ${s.c}33`,
                    filter: isHovered ? "brightness(1.2)" : "none"
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>

      <div className={"lbl" + (rot ? " rot" : "")}>
        {labels.map((l, i) => (
          <span key={l} style={{ color: hoveredIndex === i ? "var(--tx-strong)" : "var(--mu)", fontWeight: hoveredIndex === i ? "700" : "400", transition: "color 0.15s ease" }}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
};

const Tog = ({ opts, val, set }) => (
  <div className="tg" style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", margin: "14px 0 18px" }}>
    {opts.map(([k, l]) => (
      <LiquidCarveButton
        key={k}
        label={l}
        isActive={val === k}
        onClick={() => set(k)}
        padding="10px 20px"
        rounded={12}
        font={{ fontSize: 13, fontWeight: 600 }}
      />
    ))}
  </div>
);

const Head = ({ t, s }) => (
  <>
    <h2>{t}</h2>
    <p className="sub">{s}</p>
  </>
);

const Select = ({ options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDown = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = e => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className={"sel" + (open ? " open" : "")} ref={ref}>
      <button type="button" className="sel-btn" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span>{options[value]}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 4.5 6 8.5 10 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <ul className="sel-list" role="listbox">
        {options.map((o, i) => (
          <li key={i} role="option" aria-selected={i === value} className={i === value ? "on" : ""} onClick={() => { onChange(i); setOpen(false); }}>
            {o}
          </li>
        ))}
      </ul>
    </div>
  );
};

function Line({ l, mc = M, vc = V }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const L = l === "en" ? ["0 m", "500 m", "1 km", "2 km", "5 km", "10 km", ">10 km"] : l === "kz" ? ["0 м", "500 м", "1 км", "2 км", "5 км", "10 км", ">10 км"] : ["0 м", "500 м", "1 км", "2 км", "5 км", "10 км", ">10 км"];
  const Vv = [2.497, 0.53, 0.6, 0.59, 0.71, 0.6, 0.37];
  const Mm = [0.36, 0.435, 0.48, 0.5, 0.47, 0.515, 0.27];
  const X = i => 50 + i * 100;
  const Yy = v => 240 - (v / 2.6) * 210;

  const D = a => a.map((v, i) => {
    if (!i) return "M" + X(i) + " " + Yy(v);
    const m = (X(i - 1) + X(i)) / 2;
    return `C${m} ${Yy(a[i - 1])} ${m} ${Yy(v)} ${X(i)} ${Yy(v)}`;
  }).join(" ");

  const A = (a, c, id) => (
    <g>
      <path d={D(a) + " L" + X(a.length - 1) + " 240 L50 240 Z"} fill={`url(#${id})`} />
      <path d={D(a)} fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" />
      {a.map((v, i) => {
        const isHovered = hoveredIndex === i;
        return (
          <circle key={i} cx={X(i)} cy={Yy(v)} r={isHovered ? "6" : "4.5"} fill={isHovered ? c : "var(--card)"} stroke={c} strokeWidth={isHovered ? "3.5" : "2.5"} style={{ transition: "all 0.15s ease" }} />
        );
      })}
    </g>
  );

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg viewBox="0 0 700 280" style={{ width: "100%", display: "block" }} onMouseLeave={() => setHoveredIndex(null)}>
        <defs>
          {[["gM", mc], ["gV", vc]].map(([id, c]) => (
            <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={c} stopOpacity=".4" />
              <stop offset="1" stopColor={c} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {[0, 0.65, 1.3, 1.95, 2.6].map(t => (
          <g key={t}>
            <line x1="50" x2="670" y1={Yy(t)} y2={Yy(t)} stroke="var(--bd)" strokeDasharray="3 5" />
            <text x="42" y={Yy(t) + 4} fill="var(--mu)" fontSize="11" textAnchor="end">{t}</text>
          </g>
        ))}
        {A(Mm, mc, "gM")}
        {A(Vv, vc, "gV")}
        {hoveredIndex !== null && <line x1={X(hoveredIndex)} x2={X(hoveredIndex)} y1={20} y2={240} stroke="var(--tx-strong)" strokeWidth="1.5" opacity="0.75" style={{ pointerEvents: "none" }} />}
        {L.map((lblText, i) => (
          <text key={lblText} x={X(i)} y="266" fill={hoveredIndex === i ? "var(--tx-strong)" : "var(--mu)"} fontWeight={hoveredIndex === i ? "700" : "400"} fontSize="11" textAnchor="middle" style={{ transition: "fill 0.15s ease" }}>
            {lblText}
          </text>
        ))}
        {L.map((_, i) => (
          <rect key={i} x={X(i) - 45} y={0} width={90} height={280} fill="transparent" style={{ cursor: "pointer" }} onMouseEnter={() => setHoveredIndex(i)} onTouchStart={() => setHoveredIndex(i)} />
        ))}
      </svg>
      {hoveredIndex !== null && (
        <div className="line-tooltip" style={{ left: `${(X(hoveredIndex) / 700) * 100}%`, transform: hoveredIndex > 3 ? "translate(-112%, -50%)" : "translate(12%, -50%)" }}>
          <div className="line-tooltip-title">{L[hoveredIndex]}</div>
          <div className="line-tooltip-row">
            <span style={{ color: mc, fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: mc, display: "inline-block" }}></span> MODIS
            </span>
            <b>{Mm[hoveredIndex].toString().replace(".", ",")}</b>
          </div>
          <div className="line-tooltip-row">
            <span style={{ color: vc, fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: vc, display: "inline-block" }}></span> VIIRS
            </span>
            <b>{Vv[hoveredIndex].toString().replace(".", ",")}</b>
          </div>
        </div>
      )}
    </div>
  );
}

function Calc({ t }) {
  const [a, sa] = useState(40);
  const [z, sz] = useState(30);
  const [bi, sbi] = useState(0);
  const K = [0.82, 0.74, 0.91, 0.8];
  const k = K[bi];
  const f = 1 + 0.12 * (1 / Math.cos((z * Math.PI) / 180) - 1);
  const r = k * a * f;
  const val = r.toFixed(1);
  const step = d => sa(Math.max(0, Math.round((a + d) * 10) / 10));

  return (
    <div className="card">
      <h3>{t.calc}</h3>
      <p className="sub" style={{ margin: "2px 0" }}>{t.calcn}</p>
      <div className="calc">
        <div className="fld">
          <span className="fl">{t.c1}</span>
          <div className="num">
            <button type="button" aria-label="−5" onClick={() => step(-5)}>−</button>
            <input type="number" min="0" value={a} onChange={e => sa(Math.max(0, +e.target.value || 0))} />
            <button type="button" aria-label="+5" onClick={() => step(5)}>+</button>
          </div>
        </div>
        <div className="fld">
          <span className="fl">{t.c2}: <b>{z}°</b></span>
          <input type="range" className="rng" min="0" max="65" value={z} style={{ "--p": `${(z / 65) * 100}%` }} onChange={e => sz(+e.target.value)} />
        </div>
        <div className="fld">
          <span className="fl">{t.c3}</span>
          <Select options={t.bio} value={bi} onChange={sbi} />
        </div>
        <div className="fld">
          <span className="fl">{t.c4}</span>
          <div className="res"><span key={val} className="pop">{val}</span><small>MW</small></div>
          <div className="chips"><span>k = {k}</span><span>VZA ×{f.toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
}

const tunnelTexts = {
  ru: ["БЕРЕГИ", "ПОСМОТРИ", "УЗНАЙ"],
  en: ["PROTECT", "WATCH", "LEARN"],
  kz: ["ҚОРҒА", "ҚАРА", "БІЛ"],
};

function normalizeChunk(chunk) {
  if (!Array.isArray(chunk)) return [];
  const out = [];
  for (const p of chunk) {
    if (Array.isArray(p)) {
      const [lat, lon, frp, monthIdx, acq_date, satellite] = p;
      const nLat = Number(lat);
      const nLon = Number(lon);
      if (!Number.isFinite(nLat) || !Number.isFinite(nLon)) continue;
      out.push({
        latitude: nLat,
        longitude: nLon,
        frp: Number(frp) || 0,
        monthIdx: Number.isFinite(monthIdx) ? monthIdx : null,
        acq_date,
        satellite,
      });
    } else {
      const nLat = Number(p?.latitude);
      const nLon = Number(p?.longitude);
      if (!Number.isFinite(nLat) || !Number.isFinite(nLon)) continue;
      out.push({
        latitude: nLat,
        longitude: nLon,
        frp: p?.frp !== undefined ? Number(p.frp) : 0,
        satellite: p?.satellite,
        acq_date: p?.acq_date,
        acq_time: p?.acq_time,
        confidence: p?.confidence,
        monthIdx:
          typeof p?.acq_date === 'string' && p.acq_date.length >= 7
            ? Number(p.acq_date.slice(5, 7)) - 1
            : null,
      });
    }
  }
  return out;
}

export default function App() {
  usePageSetup();

  const [l, sl] = useState("ru");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [firePoints, setFirePoints] = useState([]);
  const [fireLoading, setFireLoading] = useState(false);
  const [shouldLoadFires, setShouldLoadFires] = useState(false);
  const mapSecRef = useRef(null);

  // Ленивая подгрузка данных только когда пользователь доходит до секции карты
  useEffect(() => {
    const el = mapSecRef.current;
    if (!el || shouldLoadFires) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadFires(true);
          io.disconnect();
        }
      },
      { rootMargin: "250px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shouldLoadFires]);

  const loadFiresLazy = useCallback(() => {
    setShouldLoadFires(true);
  }, []);

  useEffect(() => {
    if (!shouldLoadFires) return;
    let alive = true;
    setFireLoading(true);

    (async () => {
      const collected = [];
      const srcEntries = Object.entries(SRC_FIRE_MODULES);

      if (srcEntries.length > 0) {
        for (const [, loader] of srcEntries) {
          if (!alive) return;
          try {
            const mod = await loader();
            const raw = mod?.default ?? mod;
            collected.push(...normalizeChunk(raw));
            if (alive) setFirePoints([...collected]);
          } catch (err) {
            console.warn('Ошибка импорта архива из src/fires:', err);
          }
        }
      } else {
        const base = (import.meta?.env?.BASE_URL || './').replace(/\/?$/, '/');
        for (const file of PUBLIC_FIRE_FILES) {
          if (!alive) return;
          try {
            const res = await fetch(`${base}fires/${file}`);
            const ct = res.headers.get('content-type') || '';
            if (!res.ok || !ct.includes('application/json')) continue;
            const raw = await res.json();
            collected.push(...normalizeChunk(raw));
            if (alive) setFirePoints([...collected]);
          } catch (err) {
            console.warn('Ошибка загрузки архива:', file, err);
          }
        }
      }

      if (alive) setFireLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [shouldLoadFires]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const chartColors =
    theme === "light"
      ? { m: "#0284c7", v: "#0d9488" }
      : theme === "blue"
        ? { m: "#2563eb", v: "#06b6d4" }
        : { m: M, v: V };

  const tunnelColor = {
    dark: "#ffffff",
    light: "#000000",
    blue: "#2563eb",
  }[theme];

  const mc = chartColors.m;
  const vc = chartColors.v;

  const t = T[l];
  const [rm, srm] = useState("d");
  const [rs, srs] = useState("B");
  const [dm, sdm] = useState("y");
  const [cv, scv] = useState("B");
  const [open, so] = useState(false);
  const [activeCountry, setActiveCountry] = useState(null);
  const [mapMonth, setMapMonth] = useState(new Date().getMonth());

  const reg = useMemo(
    () => R.map(r => {
      let dM = r[1];
      let dV = r[1] * 1.28;
      if (r[0] === "ШЫМ") dV = 2.12;
      return {
        code: r[0],
        m: rm === "d" ? dM : dM * r[2] * 1000,
        v: rm === "d" ? dV : dV * r[2] * 1000,
      };
    }).sort((a, b) => {
      const primaryA = rs === "V" ? a.v : a.m;
      const primaryB = rs === "V" ? b.v : b.m;
      return primaryB - primaryA;
    }),
    [rm, rs]
  );

  const regSeries = useMemo(() => {
    const out = [];
    if (rs !== "V") out.push({ name: "MODIS", v: reg.map(x => x.m), c: mc });
    if (rs !== "M") out.push({ name: "VIIRS", v: reg.map(x => x.v), c: vc });
    return out;
  }, [reg, rs, mc, vc]);

  const regMax = useMemo(() => {
    const all = regSeries.flatMap(s => s.v);
    return Math.max(...all, 0.001) * 1.15;
  }, [regSeries]);

  const ids = ["home", "abs", "reg", "map", "dyn", "alt", "cov", "inf", "harm", "cmp", "out"];
  const cs = [];
  if (cv !== "V") cs.push({ v: CM, c: mc });
  if (cv !== "M") cs.push({ v: CV, c: vc });

  const go = (e, id) => {
    e.preventDefault();
    so(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const brandTitle = "GeoFlare";

  const guideText = l === "en" ? {
    title: "How to use this dashboard",
    sub: "A quick guide to explore satellite analytics and fire risks efficiently.",
    steps: [
      { title: "1. Navigation & Menu", desc: "Use the left panel (or hamburger menu on mobile) to jump between research sections, or change the theme and language." },
      { title: "2. Interactive Risk Map", desc: "Pick a month, pin fire foci by clicking the map or entering coordinates, and read the risk report for each point. Use 'My location' to check the area around you." },
      { title: "3. Charts & Analytics", desc: "Hover over charts and graphs to view exact values, compare MODIS and VIIRS satellite sensors, and analyze elevation/land cover." }
    ]
  } : l === "kz" ? {
    title: "Бақылау панелін қалай пайдалану керек",
    sub: "Спутниктік аналитика мен өрт қауіптерін тиімді зерттеуге арналған қысқаша нұсқаулық.",
    steps: [
      { title: "1. Навигация және мәзір", desc: "Зерттеу бөлімдері арасында жылдам өту, тілді немесе тақырыпты өзгерту үшін сол жақ панельді пайдаланыңыз." },
      { title: "2. Интерактивті қауіп картасы", desc: "Айды таңдап, картаға басу немесе координат енгізу арқылы ошақтарды бекітіңіз — әр нүкте бойынша мәлімет шығады. Геолокация өз өңіріңізді көрсетеді." },
      { title: "3. Графиктер мен аналитика", desc: "Нақты мәндерді көру, MODIS пен VIIRS сенсорларын салыстыру үшін графиктер мен диаграммаларға курсорды апарыңыз." }
    ]
  } : {
    title: "Инструкция по использованию",
    sub: "Краткое руководство для удобного изучения спутниковой аналитики и рисков пожаров.",
    steps: [
      { title: "1. Навигация по меню", desc: "Используйте левую панель (или меню на смартфоне), чтобы быстро переходить между разделами, менять язык или тему оформления." },
      { title: "2. Интерактивная карта рисков", desc: "Выберите месяц, прикрепите очаги кликом по карте или по координатам — по каждой точке откроются сведения. Геолокация показывает риск рядом с вами." },
      { title: "3. Графики и аналитика", desc: "Наводите курсор на столбцы и линии графиков для просмотра точных значений, сравнивайте сенсоры MODIS и VIIRS, изучайте высоты и типы почв." }
    ]
  };

  return (
    <div>
      <Progress />
      <header className={"side" + (open ? " open" : "")}>
        <div className="brand">
          <DirectionHover title={brandTitle} hoverColor="#6E92FF" />
        </div>
        <button className="burger" onClick={() => so(!open)}>{open ? "✕" : "☰"}</button>
        <div className="links">
          {ids.map((id, i) => (
            <DirLink key={id} href={"#" + id} onClick={e => go(e, id)}>
              <em>{String(i).padStart(2, "0")}</em>
              {t.nav[i]}
            </DirLink>
          ))}
        </div>

        <div className="sl" style={{ marginTop: "auto", marginBottom: "4px" }}>
          <span className={theme === "dark" ? "on" : ""} onClick={() => setTheme("dark")}>{l === "en" ? "Dark" : l === "kz" ? "Қара" : "Тёмная"}</span>
          <span className={theme === "light" ? "on" : ""} onClick={() => setTheme("light")}>{l === "en" ? "Light" : l === "kz" ? "Ақ" : "Светлая"}</span>
          <span className={theme === "blue" ? "on" : ""} onClick={() => setTheme("blue")}>{l === "en" ? "Neon Blue" : l === "kz" ? "Көк" : "Неоново-синяя"}</span>
        </div>

        <div className="sl" style={{ marginTop: 0 }}>
          <span className={l === "ru" ? "on" : ""} onClick={() => sl("ru")}>RU</span>
          <span className={l === "en" ? "on" : ""} onClick={() => sl("en")}>EN</span>
          <span className={l === "kz" ? "on" : ""} onClick={() => sl("kz")}>KZ</span>
        </div>
      </header>

      <div className="main">
        <div className="glow" aria-hidden="true" />
        <Embers />
        <section id="home" style={{ paddingBottom: "110px" }}>
          <h1>{t.h1}</h1>
          <p className="lead">{t.h2}</p>
          <div className="stats">
            <div className="st"><big style={{ color: "var(--tx-strong)" }}><CountUp to={1122137} /></big><small>{t.s[0]}</small></div>
            <div className="st"><big style={{ color: "var(--tx-strong)" }}><CountUp to={1461877} /></big><small>{t.s[1]}</small></div>
            <div className="st"><big style={{ color: "var(--tx-strong)" }}><CountUp to={2.72} dec={2} suffix={l === "ru" ? " млн" : l === "kz" ? " млн" : " M"} /></big><small>{t.s[2]}</small></div>
          </div>
          <div className="tags" style={{ position: "relative", zIndex: 2, marginBottom: "16px" }}>
            {["MODIS", "VIIRS", "FIRMS", "QGIS", "Python", "ESA WorldCover"].map(x => (<span key={x}>{x}</span>))}
          </div>
          <SpinImage />
          <ZoomTextTunnel key={`${l}-${theme}`} texts={tunnelTexts[l]} color={tunnelColor} />
        </section>

        <section id="guide" style={{ padding: "10px 20px 40px" }}>
          <div className="guide-card">
            <h2>{guideText.title}</h2>
            <p className="sub">{guideText.sub}</p>
            <div className="guide-grid">
              {guideText.steps.map((st, idx) => (
                <div className="guide-item" key={idx}>
                  <b>{st.title}</b>
                  <p>{st.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="abs">
          <Head t={t.nav[1]} s="" />
          <div className="cols">{t.abs}</div>
        </section>

        <section id="reg">
          <Head t={t.reg} s={t.regs} />
          <Tog opts={[["d", t.dens], ["a", t.cnt]]} val={rm} set={srm} />
          <Tog
            opts={[
              ["M", "MODIS"],
              ["V", "VIIRS"],
              ["B", "MODIS + VIIRS"],
            ]}
            val={rs}
            set={srs}
          />
          <div className="card">
            <Bars
              rot={1}
              labels={reg.map(x => (l === "en" ? RE[x.code] : x.code))}
              vl={l === "en" ? "Value" : l === "kz" ? "Мәні" : "Значение"}
              series={regSeries}
              max={regMax}
              fmt={x => (rm === "d" ? x.toFixed(3) : Math.round(x).toLocaleString())}
            />
            <Legend m={rs !== "V" ? 1 : 0} v={rs !== "M" ? 1 : 0} mc={mc} vc={vc} />
          </div>
          <div className="kpis">
            {[["1.031", mc], ["2.12", vc], ["0.009", "var(--mu)"]].map(([n, c], i) => (
              <div className="st" key={i}><big style={{ color: "var(--tx-strong)" }}>{n}</big><small>{t.k[i]}</small></div>
            ))}
          </div>
        </section>

        <section id="map" ref={mapSecRef}>
          <Head t={MT[l].title} s={MT[l].sub} />
          <MapSection
            l={l}
            month={mapMonth}
            setMonth={setMapMonth}
            months={t.mo}
            firePoints={firePoints}
            fireLoading={fireLoading}
            onRequestLoadFires={loadFiresLazy}
          />
        </section>

        <section id="dyn">
          <Head t={t.dyn} s={t.dyns} />
          <Tog opts={[["y", t.yr], ["s", t.se]]} val={dm} set={sdm} />
          <div className="card">
            <h3>{dm === "y" ? t.yr + " (2001–2024)" : t.se}</h3>
            <div className="sc">
              <div style={{ minWidth: "620px" }}>
                <Bars
                  labels={dm === "y" ? Y : t.mo}
                  series={dm === "y" ? [{ v: MY, c: mc }, { v: VY, c: vc }] : [{ v: MM, c: mc }, { v: VM, c: vc }]}
                  max={dm === "y" ? 260 : 270}
                  fmt={x => x + "K"}
                />
              </div>
            </div>
            <Legend mc={mc} vc={vc} />
          </div>
        </section>

        <section id="alt">
          <Head t={t.alt} s={t.alts} />
          <div className="card">
            <h3>{t.altt}</h3>
            <Bars
              labels={["0–200", "201–500", "501–1500", "1501–2500", "2501–4500", "4500+"]}
              series={[{ v: [0.41, 0.445, 0.39, 0.083, 0.002, 0], c: mc }, { v: [0.49, 0.615, 0.54, 0.092, 0.004, 0], c: vc }]}
              max={0.8}
              fmt={x => x.toFixed(2)}
            />
            <Legend mc={mc} vc={vc} />
          </div>
          <div className="kpis">
            {[["0–200 м", "460 171", "549 663", 67], ["201–500 м", "466 521", "644 382", 73], ["501–1500 м", "191 588", "263 539", 64]].map(a => (
              <div className="card" key={a[0]}>
                <h3>{l === "en" ? a[0].replace(" м", " m") : l === "kz" ? a[0].replace(" м", " м") : a[0]}</h3>
                <small style={{ color: "var(--mu)" }}>MODIS: {a[1]} · VIIRS: {a[2]}</small>
                <div className="pb"><i style={{ width: a[3] + "%" }}></i></div>
              </div>
            ))}
          </div>
        </section>

        <section id="cov">
          <Head t={t.cov} s="ESA WorldCover 2021" />
          <Tog opts={[["B", t.both], ["M", "MODIS"], ["V", "VIIRS"]]} val={cv} set={scv} />
          <div className="card">
            <h3>{l === "en" ? "Normalized density by land cover" : l === "kz" ? "Жер жабыны бойынша қалыптасқан тығыздық" : "Нормализованная плотность по типам покрова"}</h3>
            <p className="sub">{t.covs}</p>
            <Bars rot={1} labels={l === "en" ? CLE : l === "kz" ? CLE_KZ : CL} series={cs} max={8} fmt={x => x.toFixed(2)} />
            <Legend m={cv !== "V" ? 1 : 0} v={cv !== "M" ? 1 : 0} mc={mc} vc={vc} />
          </div>
        </section>

        <section id="inf">
          <Head t={t.inf} s={t.infs} />
          <div className="card">
            <h3>{t.inft}</h3>
            <Line l={l} mc={mc} vc={vc} />
            <Legend mc={mc} vc={vc} />
          </div>
          <div className="note"><b>{t.key}</b>{t.infn}</div>
        </section>

        <section id="harm">
          <Head t={t.har} s={t.hars} />
          <div className="steps">
            {t.st.map((s, i) => (
              <div className="card" key={i}><em>0{i + 1}</em><h3>{s[0]}</h3><p>{s[1]}</p></div>
            ))}
          </div>
          <Calc t={t} />
        </section>

        <section id="cmp">
          <Head t={t.cmp} s={t.cmps} />
          <div className="card">
            <h3>{t.cmpt}</h3>
            {(() => {
              const maxVal = Math.max(...C.map(c => c[1]));
              return C.map((c, i) => {
                const k = c[0] === "Казахстан";
                const isHovered = activeCountry === i;
                const w = (c[1] / (maxVal * 1.05)) * 100 + "%";
                return (
                  <div
                    className={`lp-item ${isHovered ? "active" : ""}`}
                    key={c[0]}
                    onMouseEnter={() => setActiveCountry(i)}
                    onMouseLeave={() => setActiveCountry(null)}
                    onTouchStart={() => setActiveCountry(i)}
                  >
                    <div className="lp-line">
                      <div className="tr">
                        <u className={k ? "kz" : ""} style={{ width: w }}></u>
                        <i className={k ? "kz" : ""} style={{ left: w, transform: isHovered ? "scale(1.35)" : "scale(1)" }}></i>
                      </div>
                      <b style={{ color: k ? mc : isHovered ? "var(--tx-strong)" : "var(--mu)" }}>{c[1].toFixed(2)}</b>
                    </div>
                    <div className="lp-info">
                      <em>{i + 1}</em>
                      <span style={{ color: k ? "var(--tx-strong)" : isHovered ? "var(--tx-strong)" : "var(--mu)" }}>
                        {l === "en" ? CN[c[0]] || c[0] : l === "kz" ? CN_KZ[c[0]] || c[0] : c[0]}
                      </span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </section>

        <section id="out">
          <Head t={t.out} s="" />
          {t.o.map((o, i) => (
            <div className="card" key={i}>
              <div className="con">
                <em>0{i + 1}</em>
                <div><b>{o[0]}</b><p>{o[1]}</p></div>
              </div>
            </div>
          ))}
        </section>

        <footer>
          NASA FIRMS · ESA WorldCover 2021 · OpenStreetMap · NASADEM · HDX
          <br />
          2001–2024 · MODIS (MCD14ML) · VIIRS (VNP14IMGTDL/VJ114IMGTDL)
        </footer>
      </div>
    </div>
  );
}
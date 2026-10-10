import { useState, useMemo, useEffect, useLayoutEffect, useRef } from 'react';
import { M, V, T, R, Y, MY, VY, MM, VM, CL, CM, CV, C } from './data';
import './App.css';

// Браузер не должен сам восстанавливать позицию прокрутки при обновлении
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

// Сброс якоря/прокрутки при загрузке, плавное появление секций, подсветка карточек под курсором
function usePageSetup() {
  useLayoutEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    const secs = document.querySelectorAll('.main section:not(#home)');
    secs.forEach(s => s.classList.add('reveal'));

    const io = new IntersectionObserver(
      entries =>
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    secs.forEach(s => io.observe(s));

    // «Прожектор»: градиент в карточке следует за курсором
    const onMove = e => {
      const el = e.target.closest && e.target.closest('.card, .st, .note');
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

const Legend = ({ m = 1, v = 1 }) => (
  <div className="leg">
    {m ? (
      <span style={{ color: M }}>
        <b style={{ background: M }}></b>MODIS
      </span>
    ) : null}
    {v ? (
      <span style={{ color: V }}>
        <b style={{ background: V }}></b>VIIRS
      </span>
    ) : null}
  </div>
);

const Bars = ({ labels, series, max, rot, fmt = x => x }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [ready, setReady] = useState(false);
  const ref = useRef(null);

  // Столбики вырастают, когда график попадает в экран
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
    <div
      ref={ref}
      style={{ position: "relative", width: "100%", paddingTop: "36px" }}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {/* Безопасное позиционирование тултипа внутри карточки */}
      {hoveredIndex !== null && (
        <div
          className="bar-tooltip"
          style={{
            left: `${((hoveredIndex + 0.5) / labels.length) * 100}%`,
            transform:
              hoveredIndex > labels.length - 4
                ? "translateX(-100%)"
                : hoveredIndex < 3
                ? "translateX(0%)"
                : "translateX(-50%)"
          }}
        >
          <div className="bar-tooltip-title">{labels[hoveredIndex]}</div>
          {series.map((s, j) => (
            <div className="bar-tooltip-row" key={j}>
              <span style={{ color: s.c, fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: s.c, display: "inline-block" }}></span>
                {series.length === 1 ? "Значение" : j === 0 ? "MODIS" : "VIIRS"}
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
                    background: isHovered
                      ? `linear-gradient(180deg, ${s.c}, ${s.c}88)`
                      : `linear-gradient(180deg, ${s.c}, ${s.c}44)`,
                    boxShadow: isHovered
                      ? `0 0 16px ${s.c}aa`
                      : `0 0 6px ${s.c}22`,
                    filter: isHovered ? "brightness(1.35)" : "none"
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>

      <div className={"lbl" + (rot ? " rot" : "")}>
        {labels.map((l, i) => (
          <span
            key={l}
            style={{
              color: hoveredIndex === i ? "#ffffff" : "var(--mu)",
              fontWeight: hoveredIndex === i ? "700" : "400",
              transition: "color 0.15s ease"
            }}
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
};

const Tog = ({ opts, val, set }) => (
  <div className="tg">
    {opts.map(([k, l]) => (
      <button
        key={k}
        className={val === k ? "on" : ""}
        onClick={() => set(k)}
      >
        {l}
      </button>
    ))}
  </div>
);

const Head = ({ t, s }) => (
  <>
    <h2>{t}</h2>
    <p className="sub">{s}</p>
  </>
);

// Кастомный выпадающий список вместо системного <select>
const Select = ({ options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDown = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = e => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className={"sel" + (open ? " open" : "")} ref={ref}>
      <button
        type="button"
        className="sel-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span>{options[value]}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 4.5 6 8.5 10 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <ul className="sel-list" role="listbox">
        {options.map((o, i) => (
          <li
            key={i}
            role="option"
            aria-selected={i === value}
            className={i === value ? "on" : ""}
            onClick={() => {
              onChange(i);
              setOpen(false);
            }}
          >
            {o}
          </li>
        ))}
      </ul>
    </div>
  );
};

function Line() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const L = ["0 м", "500 м", "1 км", "2 км", "5 км", "10 км", ">10 км"];
  const Vv = [2.497, 0.53, 0.6, 0.59, 0.71, 0.6, 0.37];
  const Mm = [0.36, 0.435, 0.48, 0.5, 0.47, 0.515, 0.27];
  const X = i => 50 + i * 100;
  const Yy = v => 240 - (v / 2.6) * 210;

  const D = a =>
    a
      .map((v, i) => {
        if (!i) return "M" + X(i) + " " + Yy(v);
        const m = (X(i - 1) + X(i)) / 2;
        return `C${m} ${Yy(a[i - 1])} ${m} ${Yy(v)} ${X(i)} ${Yy(v)}`;
      })
      .join(" ");

  const A = (a, c, id) => (
    <g>
      <path
        d={D(a) + " L" + X(a.length - 1) + " 240 L50 240 Z"}
        fill={`url(#${id})`}
      />
      <path
        d={D(a)}
        fill="none"
        stroke={c}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {a.map((v, i) => {
        const isHovered = hoveredIndex === i;
        return (
          <circle
            key={i}
            cx={X(i)}
            cy={Yy(v)}
            r={isHovered ? "6" : "4.5"}
            fill={isHovered ? c : "#000"}
            stroke={c}
            strokeWidth={isHovered ? "3.5" : "2.5"}
            style={{ transition: "all 0.15s ease" }}
          />
        );
      })}
    </g>
  );

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg
        viewBox="0 0 700 280"
        style={{ width: "100%", display: "block" }}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <defs>
          {[
            ["gM", M],
            ["gV", V]
          ].map(([id, c]) => (
            <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={c} stopOpacity=".4" />
              <stop offset="1" stopColor={c} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {[0, 0.65, 1.3, 1.95, 2.6].map(t => (
          <g key={t}>
            <line
              x1="50"
              x2="670"
              y1={Yy(t)}
              y2={Yy(t)}
              stroke="#262626"
              strokeDasharray="3 5"
            />
            <text
              x="42"
              y={Yy(t) + 4}
              fill="#a1a1aa"
              fontSize="11"
              textAnchor="end"
            >
              {t}
            </text>
          </g>
        ))}

        {A(Mm, M, "gM")}
        {A(Vv, V, "gV")}

        {hoveredIndex !== null && (
          <line
            x1={X(hoveredIndex)}
            x2={X(hoveredIndex)}
            y1={20}
            y2={240}
            stroke="#ffffff"
            strokeWidth="1.5"
            opacity="0.75"
            style={{ pointerEvents: "none" }}
          />
        )}

        {L.map((l, i) => (
          <text
            key={l}
            x={X(i)}
            y="266"
            fill={hoveredIndex === i ? "#ffffff" : "#a1a1aa"}
            fontWeight={hoveredIndex === i ? "700" : "400"}
            fontSize="11"
            textAnchor="middle"
            style={{ transition: "fill 0.15s ease" }}
          >
            {l}
          </text>
        ))}

        {L.map((_, i) => (
          <rect
            key={i}
            x={X(i) - 45}
            y={0}
            width={90}
            height={280}
            fill="transparent"
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setHoveredIndex(i)}
            onTouchStart={() => setHoveredIndex(i)}
          />
        ))}
      </svg>

      {hoveredIndex !== null && (
        <div
          className="line-tooltip"
          style={{
            left: `${(X(hoveredIndex) / 700) * 100}%`,
            transform: hoveredIndex > 3 ? "translate(-112%, -50%)" : "translate(12%, -50%)"
          }}
        >
          <div className="line-tooltip-title">{L[hoveredIndex]}</div>
          <div className="line-tooltip-row">
            <span style={{ color: M, fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: M, display: "inline-block" }}></span>
              MODIS
            </span>
            <b>{Mm[hoveredIndex].toString().replace(".", ",")}</b>
          </div>
          <div className="line-tooltip-row">
            <span style={{ color: V, fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: V, display: "inline-block" }}></span>
              VIIRS
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
      <p className="sub" style={{ margin: "2px 0" }}>
        {t.calcn}
      </p>
      <div className="calc">
        <div className="fld">
          <span className="fl">{t.c1}</span>
          <div className="num">
            <button type="button" aria-label="−5" onClick={() => step(-5)}>
              −
            </button>
            <input
              type="number"
              min="0"
              value={a}
              onChange={e => sa(Math.max(0, +e.target.value || 0))}
            />
            <button type="button" aria-label="+5" onClick={() => step(5)}>
              +
            </button>
          </div>
        </div>

        <div className="fld">
          <span className="fl">
            {t.c2}: <b>{z}°</b>
          </span>
          <input
            type="range"
            className="rng"
            min="0"
            max="65"
            value={z}
            style={{ "--p": `${(z / 65) * 100}%` }}
            onChange={e => sz(+e.target.value)}
          />
        </div>

        <div className="fld">
          <span className="fl">{t.c3}</span>
          <Select options={t.bio} value={bi} onChange={sbi} />
        </div>

        <div className="fld">
          <span className="fl">{t.c4}</span>
          <div className="res">
            <span key={val} className="pop">
              {val}
            </span>
            <small>MW</small>
          </div>
          <div className="chips">
            <span>k = {k}</span>
            <span>VZA ×{f.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  usePageSetup();

  const [l, sl] = useState("ru");
  const t = T[l];
  const [rm, srm] = useState("d");
  const [rs, srs] = useState("M");
  const [dm, sdm] = useState("y");
  const [cv, scv] = useState("B");
  const [open, so] = useState(false);
  const [activeCountry, setActiveCountry] = useState(null);

  const reg = useMemo(
    () =>
      R.map(r => {
        let d = r[1] * (rs === "M" ? 1 : 1.28);
        if (rs === "V" && r[0] === "ШЫМ") d = 2.12;
        return [r[0], rm === "d" ? d : d * r[2] * 1000];
      }).sort((a, b) => b[1] - a[1]),
    [rm, rs]
  );

  const ids = ["home", "abs", "reg", "dyn", "alt", "cov", "inf", "harm", "cmp", "out"];
  const cs = [];
  if (cv !== "V") cs.push({ v: CM, c: M });
  if (cv !== "M") cs.push({ v: CV, c: V });

  // Плавный переход по меню без добавления #якоря в адрес
  const go = (e, id) => {
    e.preventDefault();
    so(false);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      <header className={"side" + (open ? " open" : "")}>
        <div className="brand">Лаборатория космического мониторинга ЧС</div>
        <button className="burger" onClick={() => so(!open)}>
          {open ? "✕" : "☰"}
        </button>
        <div className="links">
          {ids.map((id, i) => (
            <a key={id} href={"#" + id} onClick={e => go(e, id)}>
              <em>0{i}</em>
              {t.nav[i]}
            </a>
          ))}
        </div>
        <div className="sl">
          <span className={l === "ru" ? "on" : ""} onClick={() => sl("ru")}>
            RU
          </span>
          <span className={l === "en" ? "on" : ""} onClick={() => sl("en")}>
            EN
          </span>
        </div>
      </header>

      <div className="main">
        <section id="home">
          <h1>{t.h1}</h1>
          <p className="lead">{t.h2}</p>
          <div className="stats">
            <div className="st">
              <big style={{ color: M }}>1 122 137</big>
              <small>{t.s[0]}</small>
            </div>
            <div className="st">
              <big style={{ color: V }}>1 461 877</big>
              <small>{t.s[1]}</small>
            </div>
            <div className="st">
              <big style={{ color: "var(--ac)" }}>2.72 млн</big>
              <small>{t.s[2]}</small>
            </div>
          </div>
          <div className="tags">
            {["MODIS", "VIIRS", "FIRMS", "QGIS", "Python", "ESA WorldCover"].map(
              x => (
                <span key={x}>{x}</span>
              )
            )}
          </div>
        </section>

        <section id="abs">
          <Head t={t.nav[1]} s="" />
          <div className="cols">{t.abs}</div>
        </section>

        <section id="reg">
          <Head t={t.reg} s={t.regs} />
          <Tog
            opts={[
              ["d", t.dens],
              ["a", t.cnt]
            ]}
            val={rm}
            set={srm}
          />
          <Tog
            opts={[
              ["M", "MODIS"],
              ["V", "VIIRS"]
            ]}
            val={rs}
            set={srs}
          />
          <div className="card">
            <Bars
              rot={1}
              labels={reg.map(x => x[0])}
              series={[{ v: reg.map(x => x[1]), c: rs === "M" ? M : V }]}
              max={Math.max(...reg.map(x => x[1])) * 1.15}
              fmt={x => (rm === "d" ? x.toFixed(3) : Math.round(x).toLocaleString())}
            />
          </div>
          <div className="kpis">
            {[
              ["1.031", M],
              ["2.12", V],
              ["0.009", "#a1a1aa"]
            ].map(([n, c], i) => (
              <div className="st" key={i}>
                <big style={{ color: c }}>{n}</big>
                <small>{t.k[i]}</small>
              </div>
            ))}
          </div>
        </section>

        <section id="dyn">
          <Head t={t.dyn} s={t.dyns} />
          <Tog
            opts={[
              ["y", t.yr],
              ["s", t.se]
            ]}
            val={dm}
            set={sdm}
          />
          <div className="card">
            <h3>{dm === "y" ? t.yr + " (2001–2024)" : t.se}</h3>
            <div className="sc">
              <div style={{ minWidth: "620px" }}>
                <Bars
                  labels={dm === "y" ? Y : t.mo}
                  series={
                    dm === "y"
                      ? [
                          { v: MY, c: M },
                          { v: VY, c: V }
                        ]
                      : [
                          { v: MM, c: M },
                          { v: VM, c: V }
                        ]
                  }
                  max={dm === "y" ? 260 : 270}
                  fmt={x => x + "K"}
                />
              </div>
            </div>
            <Legend />
          </div>
        </section>

        <section id="alt">
          <Head t={t.alt} s={t.alts} />
          <div className="card">
            <h3>{t.altt}</h3>
            <Bars
              labels={["0–200", "201–500", "501–1500", "1501–2500", "2501–4500", "4500+"]}
              series={[
                { v: [0.41, 0.445, 0.39, 0.083, 0.002, 0], c: M },
                { v: [0.49, 0.615, 0.54, 0.092, 0.004, 0], c: V }
              ]}
              max={0.8}
              fmt={x => x.toFixed(2)}
            />
            <Legend />
          </div>
          <div className="kpis">
            {[
              ["0–200 м", "460 171", "549 663", 67],
              ["201–500 м", "466 521", "644 382", 73],
              ["501–1500 м", "191 588", "263 539", 64]
            ].map(a => (
              <div className="card" key={a[0]}>
                <h3>{a[0]}</h3>
                <small style={{ color: "var(--mu)" }}>
                  MODIS: {a[1]} · VIIRS: {a[2]}
                </small>
                <div className="pb">
                  <i style={{ width: a[3] + "%" }}></i>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="cov">
          <Head t={t.cov} s="ESA WorldCover 2021" />
          <Tog
            opts={[
              ["B", t.both],
              ["M", "MODIS"],
              ["V", "VIIRS"]
            ]}
            val={cv}
            set={scv}
          />
          <div className="card">
            <h3>{t.altt.replace(/высотным поясам|elevation belt/, "")}</h3>
            <p className="sub">{t.covs}</p>
            <Bars
              rot={1}
              labels={CL}
              series={cs}
              max={8}
              fmt={x => x.toFixed(2)}
            />
            <Legend m={cv !== "V" ? 1 : 0} v={cv !== "M" ? 1 : 0} />
          </div>
        </section>

        <section id="inf">
          <Head t={t.inf} s={t.infs} />
          <div className="card">
            <h3>{t.inft}</h3>
            <Line />
            <Legend />
          </div>
          <div className="note">
            <b>{t.key}</b>
            {t.infn}
          </div>
        </section>

        <section id="harm">
          <Head t={t.har} s={t.hars} />
          <div className="steps">
            {t.st.map((s, i) => (
              <div className="card" key={i}>
                <em>0{i + 1}</em>
                <h3>{s[0]}</h3>
                <p>{s[1]}</p>
              </div>
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
                        <i
                          className={k ? "kz" : ""}
                          style={{
                            left: w,
                            transform: isHovered ? "scale(1.35)" : "scale(1)"
                          }}
                        ></i>
                      </div>
                      <b style={{ color: k ? M : isHovered ? "#fff" : "var(--mu)" }}>
                        {c[1].toFixed(2)}
                      </b>
                    </div>
                    <div className="lp-info">
                      <em>{i + 1}</em>
                      <span style={{ color: k ? "#fff" : isHovered ? "#ffffff" : "var(--mu)" }}>
                        {c[0]}
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
                <div>
                  <b>{o[0]}</b>
                  <p>{o[1]}</p>
                </div>
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
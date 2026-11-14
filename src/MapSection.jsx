import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { REGIONS, MT, risk, level, LEVEL_COLOR, nearestRegion, focusBrief } from './mapdata';

const KZ_BOUNDS = [[40.4, 46.4], [55.6, 87.5]];
const STORE = "fp-foci";
const MAX_FOCI = 20;
const MAX_ARCHIVE_POINTS = 2500;

const insideKZ = ([lat, lon]) =>
  lat > 40.5 && lat < 55.5 && lon > 46.5 && lon < 87.4;

const loadFoci = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .filter(f => f && typeof f.id === "string" && Array.isArray(f.ll) && insideKZ(f.ll))
      .slice(0, MAX_FOCI)
      .map((f, i, arr) => ({ ...f, n: Number.isFinite(f.n) ? f.n : arr.length - i }));
  } catch {
    return [];
  }
};

const round4 = n => Math.round(n * 1e4) / 1e4;

const frpColor = frp => {
  if (frp >= 30) return "#ff3b1f";
  if (frp >= 10) return "#ff7a2f";
  if (frp >= 3) return "#f5c542";
  return "#38bdf8";
};

export default function MapSection({
  l,
  month,
  setMonth,
  months,
  firePoints = [],
  fireLoading = false,
  onRequestLoadFires,
}) {
  const t = MT[l];
  const boxRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const firesRef = useRef(null);
  const pinsRef = useRef(null);
  const meRef = useRef(null);
  const pinModeRef = useRef(false);
  const addRef = useRef(() => {});

  const [status, setStatus] = useState("idle");
  const [me, setMe] = useState(null);
  const [pinMode, setPinMode] = useState(false);
  const [warn, setWarn] = useState("");
  const [foci, setFoci] = useState(loadFoci);
  const [sel, setSel] = useState(() => loadFoci()[0]?.id ?? null);
  const [latIn, setLatIn] = useState("");
  const [lonIn, setLonIn] = useState("");
  const [showArchive, setShowArchive] = useState(false);

  const visibleArchivePoints = useMemo(() => {
    if (!showArchive || !firePoints.length) return [];
    const byMonth = firePoints.filter(p => p.monthIdx === month);
    const source = byMonth.length > 0 ? byMonth : firePoints;
    if (source.length <= MAX_ARCHIVE_POINTS) return source;
    const step = Math.ceil(source.length / MAX_ARCHIVE_POINTS);
    const sampled = [];
    for (let i = 0; i < source.length; i += step) {
      sampled.push(source[i]);
    }
    return sampled;
  }, [showArchive, firePoints, month]);

  const rows = useMemo(
    () =>
      REGIONS.map(r => ({ ...r, v: risk(r, month) })).sort((a, b) => b.v - a.v),
    [month]
  );

  const briefs = useMemo(
    () =>
      foci.map(f => {
        const near = nearestRegion(f.ll);
        const brief = focusBrief(near.r, month);
        const rank = rows.findIndex(r => r.code === near.r.code) + 1;
        return { ...f, near, brief, rank };
      }),
    [foci, month, rows]
  );

  const selected = briefs.find(f => f.id === sel) || briefs[0] || null;

  const summary = useMemo(() => {
    if (!briefs.length) return null;
    const vals = briefs.map(f => f.brief.v);
    const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    const max = Math.max(...vals);
    const highs = briefs.filter(f => f.brief.lv >= 2).length;
    return { avg, max, highs };
  }, [briefs]);

  useEffect(() => {
    pinModeRef.current = pinMode;
  }, [pinMode]);

  useEffect(() => {
    localStorage.setItem(STORE, JSON.stringify(foci));
  }, [foci]);

  const addFocus = ll => {
    if (!insideKZ(ll)) {
      setWarn("out");
      return false;
    }
    if (foci.length >= MAX_FOCI) {
      setWarn("limit");
      return false;
    }
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const n = foci.reduce((m, f) => Math.max(m, f.n || 0), 0) + 1;
    const item = { id, n, ll: [round4(ll[0]), round4(ll[1])] };
    setWarn("");
    setFoci(prev => [item, ...prev].slice(0, MAX_FOCI));
    setSel(id);
    const map = mapRef.current;
    if (map) map.flyTo(item.ll, Math.max(map.getZoom(), 6.5), { duration: 0.7 });
    return true;
  };

  addRef.current = addFocus;

  const removeFocus = id => {
    setFoci(prev => prev.filter(f => f.id !== id));
    setSel(cur => (cur === id ? null : cur));
  };

  useEffect(() => {
    const map = L.map(boxRef.current, {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false,
      minZoom: 4,
      maxZoom: 11,
      preferCanvas: true
    });
    map.fitBounds(KZ_BOUNDS);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    firesRef.current = L.layerGroup().addTo(map);
    pinsRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    const fix = setTimeout(() => map.invalidateSize(), 1000);

    map.on("click", e => {
      map.scrollWheelZoom.enable();
      if (!pinModeRef.current) return;
      addRef.current([e.latlng.lat, e.latlng.lng]);
    });
    map.on("mouseout", () => map.scrollWheelZoom.disable());

    return () => {
      clearTimeout(fix);
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      firesRef.current = null;
      pinsRef.current = null;
      meRef.current = null;
    };
  }, []);

  // Отрисовка точек архива на Canvas без создания тултипов на каждую точку
  useEffect(() => {
    const g = firesRef.current;
    if (!g) return;
    g.clearLayers();
    visibleArchivePoints.forEach(p => {
      const color = frpColor(p.frp);
      const radius = Math.min(8, Math.max(2.5, 2.5 + Math.sqrt(Math.max(0, p.frp)) * 0.55));
      L.circleMarker([p.latitude, p.longitude], {
        radius,
        color,
        weight: 1,
        fillColor: color,
        fillOpacity: 0.7,
        interactive: false
      }).addTo(g);
    });
  }, [visibleArchivePoints]);

  useEffect(() => {
    const g = layerRef.current;
    if (!g) return;
    g.clearLayers();
    rows.forEach(r => {
      const lv = level(r.v);
      const c = LEVEL_COLOR[lv];
      L.circle(r.ll, {
        radius: 45000 + r.v * 4200,
        stroke: false,
        fillColor: c,
        fillOpacity: lv === 0 ? 0.08 : 0.16 + lv * 0.04,
        interactive: false
      }).addTo(g);
      L.circle(r.ll, {
        radius: 20000 + r.v * 1800,
        stroke: false,
        fillColor: c,
        fillOpacity: lv === 0 ? 0.12 : 0.25,
        interactive: false
      }).addTo(g);
      const size = 10 + Math.round(r.v / 6);
      const icon = L.divIcon({
        className: "fp-wrap",
        iconSize: [size, size],
        html: `<span class="fp lv${lv}" style="width:${size}px;height:${size}px"></span>`
      });
      L.marker(r.ll, { icon })
        .bindTooltip(
          `<b>${r[l]}</b><br>${t.risk}: ${r.v}/100 · ${t.lvl[lv]}<br>${t.dens}: ${r.d.toFixed(3)}`,
          { className: "fp-tip", direction: "top", offset: [0, -6] }
        )
        .addTo(g);
    });
  }, [rows, l, t]);

  useEffect(() => {
    const g = pinsRef.current;
    if (!g) return;
    g.clearLayers();
    briefs.forEach(f => {
      const lv = f.brief.lv;
      const on = selected && f.id === selected.id;
      const icon = L.divIcon({
        className: "fp-wrap",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        html: `<span class="focus-pin lv${lv}${on ? " on" : ""}"><b>${f.n}</b></span>`
      });
      const marker = L.marker(f.ll, { icon, zIndexOffset: on ? 800 : 500 })
        .bindTooltip(
          `<b>${t.focus} ${f.n}</b><br>${f.near.r[l]}<br>${t.risk}: ${f.brief.v}/100`,
          { className: "fp-tip", direction: "top", offset: [0, -12] }
        )
        .addTo(g);
      marker.on("click", e => {
        L.DomEvent.stopPropagation(e);
        setSel(f.id);
      });
    });
  }, [briefs, selected, l, t]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (meRef.current) {
      meRef.current.remove();
      meRef.current = null;
    }
    if (!me) return;
    const icon = L.divIcon({
      className: "fp-wrap",
      iconSize: [22, 22],
      html: '<span class="me"></span>'
    });
    meRef.current = L.marker(me.ll, { icon, zIndexOffset: 1000 })
      .bindTooltip(t.you, { className: "fp-tip", direction: "top", permanent: true, offset: [0, -10] })
      .addTo(map);
  }, [me, t]);

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setStatus("unsup");
      return;
    }
    setStatus("busy");
    navigator.geolocation.getCurrentPosition(
      pos => {
        const ll = [pos.coords.latitude, pos.coords.longitude];
        const best = nearestRegion(ll);
        const inside = insideKZ(ll);
        setMe({ ll, region: best.r, d: Math.round(best.d), inside });
        setStatus("ok");
        const map = mapRef.current;
        if (map) {
          if (inside) map.flyTo(ll, 7, { duration: 1.6 });
          else map.flyToBounds([ll, best.r.ll], { duration: 1.6, padding: [60, 60], maxZoom: 6 });
        }
      },
      () => setStatus("denied"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const submitCoords = e => {
    e.preventDefault();
    const lat = Number(String(latIn).replace(",", "."));
    const lon = Number(String(lonIn).replace(",", "."));
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      setWarn("bad");
      return;
    }
    if (addFocus([lat, lon])) {
      setLatIn("");
      setLonIn("");
    } else if (!insideKZ([lat, lon])) {
      setWarn("out");
    }
  };

  const myRisk = me ? risk(me.region, month) : 0;
  const myLv = level(myRisk);

  return (
    <>
      <div className="map-ctl">
        <div className="mo-row" role="group" aria-label={t.month}>
          {months.map((m, i) => (
            <button
              key={m}
              className={month === i ? "on" : ""}
              onClick={() => setMonth(i)}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="map-actions">
          <button
            type="button"
            className={"pin-btn" + (showArchive ? " on" : "")}
            aria-pressed={showArchive}
            onClick={() => {
              if (!showArchive && onRequestLoadFires) onRequestLoadFires();
              setShowArchive(v => !v);
            }}
          >
            {fireLoading ? "FIRMS …" : `FIRMS (${visibleArchivePoints.length})`}
          </button>
          <button
            type="button"
            className={"pin-btn" + (pinMode ? " on" : "")}
            aria-pressed={pinMode}
            onClick={() => {
              setPinMode(v => !v);
              setWarn("");
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
              <circle cx="12" cy="10" r="2.2" />
            </svg>
            {pinMode ? t.pinOn : t.pin}
          </button>
          <button className="loc-btn" onClick={locate} disabled={status === "busy"}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
              <circle cx="12" cy="12" r="8" />
            </svg>
            {status === "busy" ? t.locating : t.locate}
          </button>
        </div>
      </div>

      {pinMode && <div className="note">{t.pinHint}</div>}
      {warn === "out" && <div className="note warn">{t.outkz}</div>}
      {warn === "bad" && <div className="note warn">{t.bad}</div>}
      {warn === "limit" && <div className="note warn">{t.limit}</div>}

      <div className="map-row" style={{ display: "block" }}>
        <div className="map-card card" style={{ width: "100%", marginTop: "16px" }}>
          <div ref={boxRef} className={"map-box" + (pinMode ? " pinning" : "")} />
          <div className="map-leg">
            <span>{t.legend}</span>
            {t.lvl.map((n, i) => (
              <i key={n}>
                <b style={{ background: LEVEL_COLOR[i] }} />
                {n}
              </i>
            ))}
          </div>
        </div>
      </div>

      {status === "denied" && <div className="note warn">{t.denied}</div>}
      {status === "unsup" && <div className="note warn">{t.unsup}</div>}

      {me && status === "ok" && (
        <div className="me-card card" style={{ borderColor: LEVEL_COLOR[myLv] + "88" }}>
          {!me.inside && <p className="sub" style={{ margin: "0 0 10px" }}>{t.outside}</p>}
          <div className="me-row">
            <div>
              <small>{t.near}</small>
              <h3>{me.region[l]}</h3>
              <small>
                ≈ {me.d} {t.km}
              </small>
            </div>
            <div className="gauge">
              <svg viewBox="0 0 120 120" width="110" height="110">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#1d1d1d" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={LEVEL_COLOR[myLv]}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(Math.min(myRisk, 100) / 100) * 314} 314`}
                  transform="rotate(-90 60 60)"
                  style={{ transition: "stroke-dasharray .8s var(--ease), stroke .3s" }}
                />
              </svg>
              <div className="gv">
                <b style={{ color: LEVEL_COLOR[myLv] }}>{myRisk}</b>
                <small>{t.lvl[myLv]}</small>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="focus-head">
          <h3>{t.attached}</h3>
          {foci.length > 0 && (
            <button type="button" className="ghost-btn" onClick={() => { setFoci([]); setSel(null); }}>
              {t.clear}
            </button>
          )}
        </div>
        <p className="sub" style={{ marginTop: 0 }}>{t.manual}</p>
        <form className="coord-form" onSubmit={submitCoords}>
          <label>
            <span>{t.lat}</span>
            <input
              inputMode="decimal"
              placeholder="51.16"
              value={latIn}
              onChange={e => setLatIn(e.target.value)}
            />
          </label>
          <label>
            <span>{t.lon}</span>
            <input
              inputMode="decimal"
              placeholder="71.43"
              value={lonIn}
              onChange={e => setLonIn(e.target.value)}
            />
          </label>
          <button type="submit" className="loc-btn">{t.add}</button>
        </form>

        {!briefs.length && <p className="sub" style={{ marginBottom: 0 }}>{t.empty}</p>}

        {summary && (
          <div className="focus-kpis">
            <div><small>{t.count}</small><b>{briefs.length}</b></div>
            <div><small>{t.avg}</small><b>{summary.avg}</b></div>
            <div><small>{t.max}</small><b style={{ color: LEVEL_COLOR[level(summary.max)] }}>{summary.max}</b></div>
            <div><small>{t.highs}</small><b>{summary.highs}</b></div>
          </div>
        )}

        {briefs.length > 0 && (
          <div className="foci-list">
            {briefs.map(f => (
              <button
                type="button"
                key={f.id}
                className={"focus-row" + (selected && selected.id === f.id ? " on" : "")}
                onClick={() => {
                  setSel(f.id);
                  mapRef.current?.flyTo(f.ll, 7, { duration: 0.7 });
                }}
              >
                <i className={"fp lv" + f.brief.lv} />
                <span>
                  <b>{t.focus} {f.n}</b>
                  <small>{f.near.r[l]} · {f.ll[0].toFixed(2)}, {f.ll[1].toFixed(2)}</small>
                </span>
                <em style={{ color: LEVEL_COLOR[f.brief.lv] }}>{f.brief.v}</em>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="card focus-report" style={{ borderColor: LEVEL_COLOR[selected.brief.lv] + "88" }}>
          <div className="focus-head">
            <div>
              <small>{t.report} · {t.forMonth} {months[month]}</small>
              <h3>{t.focus} {selected.n} — {selected.near.r[l]}</h3>
            </div>
            <button type="button" className="ghost-btn" onClick={() => removeFocus(selected.id)}>{t.remove}</button>
          </div>
          <div className="me-row">
            <div className="focus-meta">
              <div>
                <small>{t.coords}</small>
                <b>{selected.ll[0].toFixed(4)}, {selected.ll[1].toFixed(4)}</b>
              </div>
              <div>
                <small>{t.near}</small>
                <b>≈ {Math.round(selected.near.d)} {t.km}</b>
              </div>
              <div>
                <small>{t.biome}</small>
                <b>{t.biomes[selected.brief.biome]}</b>
              </div>
              <div>
                <small>{t.dens}</small>
                <b>{selected.near.r.d.toFixed(3)}</b>
              </div>
              <div>
                <small>{t.season}</small>
                <b>{selected.brief.season.toFixed(2)}</b>
              </div>
              <div>
                <small>{t.frp}</small>
                <b>{selected.brief.frp} {t.mw}</b>
              </div>
              <div>
                <small>{t.conf}</small>
                <b>{t.confs[selected.brief.conf]}</b>
              </div>
              <div>
                <small>{t.rank}</small>
                <b>{selected.rank} {t.of} {rows.length}</b>
              </div>
            </div>
            <div className="gauge">
              <svg viewBox="0 0 120 120" width="110" height="110">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#1d1d1d" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={LEVEL_COLOR[selected.brief.lv]}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(Math.min(selected.brief.v, 100) / 100) * 314} 314`}
                  transform="rotate(-90 60 60)"
                  style={{ transition: "stroke-dasharray .8s var(--ease), stroke .3s" }}
                />
              </svg>
              <div className="gv">
                <b style={{ color: LEVEL_COLOR[selected.brief.lv] }}>{selected.brief.v}</b>
                <small>{t.lvl[selected.brief.lv]}</small>
              </div>
            </div>
          </div>
          <div className="note" style={{ marginBottom: 0 }}>
            <b>{t.advice}: </b>
            {t.adv[selected.brief.lv]}
          </div>
        </div>
      )}

      <div className="card">
        <h3>
          {t.top} · {months[month]}
        </h3>
        <div className="toprisk">
          {rows.slice(0, 5).map(r => (
            <div className="tr-row" key={r.code}>
              <span>{r[l]}</span>
              <div className="tr-bar">
                <i style={{ width: r.v + "%", background: LEVEL_COLOR[level(r.v)] }} />
              </div>
              <b>{r.v}</b>
            </div>
          ))}
        </div>
      </div>

      <p className="sub" style={{ marginTop: 14 }}>{t.note}</p>
    </>
  );
}
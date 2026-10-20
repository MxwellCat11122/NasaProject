import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { REGIONS, MT, risk, level, LEVEL_COLOR, dist } from './mapdata';

const KZ_BOUNDS = [[40.4, 46.4], [55.6, 87.5]];

// Грубая проверка «точка в пределах Казахстана»
const insideKZ = ([lat, lon]) =>
  lat > 40.5 && lat < 55.5 && lon > 46.5 && lon < 87.4;

export default function MapSection({ l, month, setMonth, months }) {
  const t = MT[l];
  const boxRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const meRef = useRef(null);

  const [status, setStatus] = useState("idle"); // idle | busy | denied | unsup | ok
  const [me, setMe] = useState(null); // { ll, region, d, inside }

  const rows = useMemo(
    () =>
      REGIONS.map(r => ({ ...r, v: risk(r, month) })).sort((a, b) => b.v - a.v),
    [month]
  );

  // Создание карты (один раз)
  useEffect(() => {
    const map = L.map(boxRef.current, {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false,
      minZoom: 4,
      maxZoom: 9
    });
    map.fitBounds(KZ_BOUNDS);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    // OpenStreetMap не требует ключа; тёмный вид даёт CSS-фильтр на .leaflet-tile-pane
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    // секция появляется с анимацией — пересчитываем размер после неё
    const fix = setTimeout(() => map.invalidateSize(), 1000);

    // колесо мыши включаем только после клика, чтобы не мешать прокрутке страницы
    map.on("click", () => map.scrollWheelZoom.enable());
    map.on("mouseout", () => map.scrollWheelZoom.disable());

    return () => {
      clearTimeout(fix);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Перерисовка очагов при смене месяца или языка
  useEffect(() => {
    const g = layerRef.current;
    if (!g) return;
    g.clearLayers();
    rows.forEach(r => {
      const lv = level(r.v);
      const c = LEVEL_COLOR[lv];
      // мягкое «тепловое» свечение
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
      // ядро-точка с пульсацией для высоких уровней
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

  // Маркер пользователя
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
        let best = null;
        REGIONS.forEach(r => {
          const d = dist(ll, r.ll);
          if (!best || d < best.d) best = { r, d };
        });
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
        <button className="loc-btn" onClick={locate} disabled={status === "busy"}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            <circle cx="12" cy="12" r="8" />
          </svg>
          {status === "busy" ? t.locating : t.locate}
        </button>
      </div>

      <div className="map-card card">
        <div ref={boxRef} className="map-box" />
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
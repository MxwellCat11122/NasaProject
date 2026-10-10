// Бело-серая палитра для графиков и диаграмм
export const M = '#ffffff'; // MODIS — белый
export const V = '#71717a'; // VIIRS — серый

export const T = {
  ru: {
    nav: ["Главная", "Абстракт", "Регионы", "Динамика", "Высоты", "Покров", "Инфраструктура", "Гармонизация", "Сравнение", "Выводы"],
    h1: "Пространственно-временной анализ пожарной активности в Казахстане",
    h2: "Комплексное исследование по данным MODIS и VIIRS за 2001–2024 гг. с использованием спутниковых данных NASA FIRMS",
    s: ["Точек MODIS (2001–2024)", "Точек VIIRS (2012–2024)", "км² территории"],
    abs: "Исследование выполнено на основе архивов термальных аномалий NASA FIRMS: продукт MODIS (разрешение ~1 км, 2001–2024) и VIIRS (375 м, 2012–2024). Предобработка включала фильтрацию по типу события и уровню достоверности, перепроецирование в метрическую систему координат. Из-за разницы в разрешении счётчики сенсоров несопоставимы, поэтому интенсивность (FRP) гармонизирована с поправкой на угол обзора и тип биома. Наибольшая плотность пожаров — в степных регионах севера Казахстана; выявлена двухфазная сезонность: весенний пик (сельхозпал) и летний (климатические факторы). Более 80% аномалий — на высотах 0–500 м.",
    reg: "Пространственное распределение",
    regs: "Плотность термальных аномалий по 20 административным единицам Казахстана",
    dens: "Плотность (точек/км²)",
    cnt: "Абсолютное количество",
    k: ["Макс. плотность MODIS (СКО)", "Макс. плотность VIIRS (Шымкент)", "Мин. плотность (Мангистау)"],
    dyn: "Временная динамика",
    dyns: "Годовые и сезонные тренды пожарной активности",
    yr: "Годовая",
    se: "Сезонная",
    alt: "Высотная зональность",
    alts: "Более 80% термальных аномалий — на высотах 0–500 м н.у.м.",
    altt: "Нормализованная плотность по высотным поясам",
    cov: "Земельный покров",
    covs: "VIIRS: аномально высокая плотность для застроенных территорий (4.444)",
    both: "Оба сенсора",
    inf: "Близость к инфраструктуре",
    infs: "MODIS: максимум на 1–10 км; VIIRS: максимум в населённых пунктах",
    inft: "Плотность по дистанционным зонам",
    infn: "VIIRS фиксирует 2.497 непосредственно в населённых пунктах (375 м), тогда как MODIS достигает максимума 0.515 на расстоянии 10 км — зоне крупных растительных пожаров.",
    key: "Ключевое наблюдение: ",
    har: "Гармонизация MODIS и VIIRS",
    hars: "Единый сквозной ряд «горячих точек»: приведение 375 м → 1 км и пересчёт FRP",
    st: [
      ["Сбор данных", "MCD14ML и VNP14IMGTDL / VJ114IMGTDL из NASA FIRMS."],
      ["Коинцидентность", "Сопоставление в пространстве и времени с учётом разницы пролёта."],
      ["Ресемплинг", "Агрегация VIIRS до сетки 1 км: суммарный FRP и число очагов."],
      ["Регрессия", "FRP VIIRS, угол обзора и биом → прогноз FRP MODIS."],
      ["Валидация", "Сверка с Landsat-8/9 и Sentinel-2."]
    ],
    calc: "Калькулятор пересчёта FRP",
    calcn: "Демонстрационные коэффициенты — заменить результатами регрессии.",
    c1: "ΣFRP VIIRS в пикселе MODIS, МВт",
    c2: "Угол обзора VZA, °",
    c3: "Биом",
    bio: ["Степь", "Пашня / сельхозпал", "Лес", "Кустарники"],
    c4: "FRP MODIS (прогноз)",
    cmp: "Межстрановое сравнение",
    cmps: "Сравнение нормализованной плотности пожаров с другими странами мира",
    cmpt: "Нормализованная плотность (MODIS, точки / млн км²)",
    out: "Выводы",
    o: [
      ["Степные регионы — зоны риска", "СКО, Костанайская и Акмолинская области стабильно лидируют по обоим сенсорам."],
      ["Двухфазная сезонность", "Весенний пик (апрель) — сельхозпал, летний — климатические факторы."],
      ["Концентрация на низких высотах", "Более 80% аномалий — на высотах 0–500 м."],
      ["Различия MODIS и VIIRS", "VIIRS фиксирует компактные тепловые источники, MODIS — крупные растительные пожары."],
      ["Гармонизация обязательна", "Без пересчёта FRP и сетки 375 м → 1 км в ряду 2001–2024 возникает ложный скачок в 2012 году."],
      ["Высокие показатели", "Плотность пожаров существенно выше среднеевропейских значений."]
    ],
    mo: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]
  },
  en: {
    nav: ["Home", "Abstract", "Regions", "Dynamics", "Elevation", "Land cover", "Infrastructure", "Harmonization", "Comparison", "Conclusions"],
    h1: "Spatio-temporal analysis of fire activity in Kazakhstan",
    h2: "Study of MODIS and VIIRS data for 2001–2024 using NASA FIRMS satellite data",
    s: ["MODIS points (2001–2024)", "VIIRS points (2012–2024)", "km² of territory"],
    abs: "The study uses NASA FIRMS thermal anomaly archives: MODIS (~1 km, 2001–2024) and VIIRS (375 m, 2012–2024). Preprocessing included filtering by event type and confidence and reprojection to a metric CRS. Because of the resolution gap, sensor counts are not comparable, so FRP was harmonized with view-angle and biome corrections. Fire density peaks in northern steppe regions; two-phase seasonality is found: spring (agricultural burning) and summer (climate). Over 80% of anomalies lie at 0–500 m.",
    reg: "Spatial distribution",
    regs: "Thermal anomaly density across 20 administrative units",
    dens: "Density (points/km²)",
    cnt: "Absolute count",
    k: ["Max MODIS density (North Kazakhstan)", "Max VIIRS density (Shymkent)", "Min density (Mangystau)"],
    dyn: "Temporal dynamics",
    dyns: "Annual and seasonal fire activity trends",
    yr: "Annual",
    se: "Seasonal",
    alt: "Elevation zonality",
    alts: "Over 80% of anomalies at 0–500 m a.s.l.",
    altt: "Normalized density by elevation belt",
    cov: "Land cover",
    covs: "VIIRS: anomalously high density in built-up areas (4.444)",
    both: "Both sensors",
    inf: "Proximity to infrastructure",
    infs: "MODIS: peak at 1–10 km; VIIRS: peak in settlements",
    inft: "Density by distance zone",
    infn: "VIIRS records 2.497 right at settlements (375 m), while MODIS peaks at 0.515 at 10 km — the zone of large vegetation fires.",
    key: "Key finding: ",
    har: "MODIS–VIIRS harmonization",
    hars: "One continuous hotspot series: 375 m → 1 km aggregation and FRP conversion",
    st: [
      ["Data collection", "MCD14ML and VNP14IMGTDL / VJ114IMGTDL from NASA FIRMS."],
      ["Coincidence", "Space-time matching accounting for overpass offset."],
      ["Resampling", "VIIRS aggregated to a 1 km grid: total FRP and count."],
      ["Regression", "VIIRS FRP, view angle and biome → predicted MODIS FRP."],
      ["Validation", "Checked against Landsat-8/9 and Sentinel-2."]
    ],
    calc: "FRP conversion calculator",
    calcn: "Demo coefficients — replace with regression results.",
    c1: "VIIRS ΣFRP in MODIS pixel, MW",
    c2: "View zenith angle, °",
    c3: "Biome",
    bio: ["Steppe", "Cropland / burning", "Forest", "Shrubland"],
    c4: "Predicted MODIS FRP",
    cmp: "Cross-country comparison",
    cmps: "Comparison of normalized fire density with other countries",
    cmpt: "Normalized density (MODIS, points / M km²)",
    out: "Conclusions",
    o: [
      ["Steppe regions are risk zones", "North Kazakhstan, Kostanay and Akmola lead in both sensors."],
      ["Two-phase seasonality", "Spring peak (April) — agricultural burning; summer — climate."],
      ["Low-elevation concentration", "Over 80% of anomalies at 0–500 m."],
      ["MODIS vs VIIRS", "VIIRS sees compact heat sources, MODIS large vegetation fires."],
      ["Harmonization is required", "Without it the 2001–2024 series shows a false jump in 2012."],
      ["High figures", "Fire density is significantly higher than European averages."]
    ],
    mo: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  }
};

export const R = [["СКО", 1.031, 97], ["КОС", .73, 196], ["АКМ", .68, 146], ["ЗКО", .57, 151], ["ПВЛ", .52, 124], ["АКТ", .41, 300], ["АБА", .385, 198], ["АЛМ", .385, 105], ["ШЫМ", .36, 117], ["КРГ", .35, 116], ["КЗО", .34, 125], ["АСТ", .33, 1], ["ЖАМ", .31, 167], ["ЖЕТ", .305, 119], ["УЛЫ", .285, 190], ["ВКО", .27, 97], ["ТУР", .25, 117], ["АТР", .225, 118], ["АЛГ", .215, 105], ["МАН", .009, 166]];
export const Y = [...Array(24)].map((_, i) => 2001 + i);
export const MY = [32, 102, 100, 93, 66, 75, 52, 72, 37, 57, 22, 52, 15, 35, 38, 20, 70, 28, 48, 34, 29, 17, 13, 6];
export const VY = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 176, 55, 133, 138, 70, 246, 96, 172, 115, 108, 72, 53, 27];
export const MM = [3, 12, 75, 190, 95, 60, 70, 80, 55, 35, 8, 2];
export const VM = [4, 15, 98, 252, 120, 85, 100, 110, 72, 45, 10, 3];
export const CL = ["Водно-болотные угодья", "Пашни", "Луга", "Застройка", "Кустарники", "Леса", "Водоёмы", "Редкая раст."];
export const CM = [1.7, .95, .38, .33, .33, .3, .1, .05];
export const CV = [3.7, 1.03, .48, 4.444, .35, .42, .18, .13];

export const C = [
  ["Ангола", 1.45],
  ["Замбия", 1.20],
  ["Мозамбик", 0.95],
  ["Боливия", 0.82],
  ["Парагвай", 0.65],
  ["Казахстан", 0.41],
  ["Испания", 0.35],
  ["Турция", 0.28],
  ["ЮАР", 0.22],
  ["Украина", 0.19],
  ["Португалия", 0.16],
  ["Италия", 0.12],
  ["Греция", 0.09],
  ["Франция", 0.05],
  ["Германия", 0.02]
];
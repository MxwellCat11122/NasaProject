import { R, MM } from './data';
const MAXS = Math.max(...MM);
export const season = m => MM[m] / MAXS;

const MAXD = Math.max(...R.map(r => r[1]));

export const GEO = {
  "СКО": { ll: [54.2, 69.4], ru: "Северо-Казахстанская обл.", en: "North Kazakhstan", kz: "Солтүстік Қазақстан облысы" },
  "КОС": { ll: [52.5, 63.6], ru: "Костанайская обл.", en: "Kostanay", kz: "Қостанай облысы" },
  "АКМ": { ll: [51.9, 69.4], ru: "Акмолинская обл.", en: "Akmola", kz: "Ақмола облысы" },
  "ЗКО": { ll: [50.6, 50.9], ru: "Западно-Казахстанская обл.", en: "West Kazakhstan", kz: "Батыс Қазақстан облысы" },
  "ПВЛ": { ll: [52.3, 76.9], ru: "Павлодарская обл.", en: "Pavlodar", kz: "Павлодар облысы" },
  "АКТ": { ll: [49.8, 58.2], ru: "Актюбинская обл.", en: "Aktobe", kz: "Ақтөбе облысы" },
  "АБА": { ll: [49.9, 80.3], ru: "обл. Абай", en: "Abai", kz: "Абай облысы" },
  "АЛМ": { ll: [44.2, 77.9], ru: "Алматинская обл.", en: "Almaty Region", kz: "Алматы облысы" },
  "ШЫМ": { ll: [42.3, 69.6], ru: "г. Шымкент", en: "Shymkent", kz: "Шымкент қ." },
  "КРГ": { ll: [49.3, 73.1], ru: "Карагандинская обл.", en: "Karaganda", kz: "Қарағанды облысы" },
  "КЗО": { ll: [45.0, 65.5], ru: "Кызылординская обл.", en: "Kyzylorda", kz: "Қызылорда облысы" },
  "АСТ": { ll: [51.15, 71.45], ru: "г. Астана", en: "Astana", kz: "Астана қ." },
  "ЖАМ": { ll: [43.6, 71.4], ru: "Жамбылская обл.", en: "Zhambyl", kz: "Жамбыл облысы" },
  "ЖЕТ": { ll: [45.2, 79.0], ru: "обл. Жетісу", en: "Jetisu", kz: "Жетісу облысы" },
  "УЛЫ": { ll: [48.0, 67.0], ru: "обл. Ұлытау", en: "Ulytau", kz: "Ұлытау облысы" },
  "ВКО": { ll: [48.6, 83.8], ru: "Восточно-Казахстанская обл.", en: "East Kazakhstan", kz: "Шығыс Қазақстан облысы" },
  "ТУР": { ll: [43.9, 67.9], ru: "Туркестанская обл.", en: "Turkestan", kz: "Түркістан облысы" },
  "АТР": { ll: [47.5, 52.5], ru: "Атырауская обл.", en: "Atyrau", kz: "Атырау облысы" },
  "АЛГ": { ll: [43.25, 76.9], ru: "г. Алматы", en: "Almaty city", kz: "Алматы қ." },
  "МАН": { ll: [44.0, 54.0], ru: "Мангистауская обл.", en: "Mangystau", kz: "Маңғыстау облысы" }
};

export const REGIONS = R.map(([code, d]) => ({
  code,
  d,
  ll: GEO[code].ll,
  ru: GEO[code].ru,
  en: GEO[code].en,
  kz: GEO[code].kz
}));

export const risk = (r, m) => Math.round((r.d / MAXD) * season(m) * 100);

export const level = v =>
  v >= 55 ? 3 : v >= 28 ? 2 : v >= 10 ? 1 : 0;

export const LEVEL_COLOR = ["#52525b", "#f5c542", "#ff7a2f", "#ff3b1f"];

export const dist = (a, b) => {
  const rad = x => (x * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLon = rad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
};

export const MT = {
  ru: {
    title: "Карта риска очагов",
    sub: "Где пожары возможны по историческим данным MODIS в выбранный месяц",
    month: "Месяц",
    locate: "Моё местоположение",
    locating: "Определяю…",
    denied: "Нет доступа к геолокации — разрешите её в браузере.",
    unsup: "Браузер не поддерживает геолокацию.",
    outside: "Вы вне Казахстана — ближайший регион показан для примера:",
    near: "Ближайший регион",
    risk: "Индекс риска",
    lvl: ["Низкий", "Умеренный", "Высокий", "Очень высокий"],
    legend: "Уровень риска",
    you: "Вы здесь",
    km: "км",
    note: "Индекс = плотность аномалий региона × сезонный коэффициент месяца. Модель иллюстративная, это не оперативный прогноз: актуальные пожары смотрите в NASA FIRMS.",
    top: "Самые опасные регионы месяца",
    dens: "плотность",
    pin: "Отметить очаг",
    pinOn: "Клик по карте",
    pinHint: "Режим отметки включён: кликните по территории Казахстана, чтобы прикрепить очаг.",
    outkz: "Очаг можно прикрепить только внутри Казахстана.",
    attached: "Прикреплённые очаги",
    empty: "Очагов пока нет. Включите «Отметить очаг» и кликните по карте — по точке появятся сведения.",
    coords: "Координаты",
    lat: "Широта",
    lon: "Долгота",
    add: "Прикрепить",
    remove: "Убрать",
    clear: "Очистить",
    report: "Сведения по очагу",
    forMonth: "Расчёт для месяца",
    biome: "Тип ландшафта",
    biomes: ["Степь", "Пашня / сельхозпал", "Лес и горы", "Кустарники и пустыня"],
    frp: "Оценка FRP",
    conf: "Достоверность модели",
    confs: ["Низкая", "Средняя", "Высокая"],
    season: "Сезонный коэффициент",
    advice: "Рекомендация",
    adv: [
      "Историческая активность низкая. Достаточно обычного мониторинга.",
      "Умеренный риск. Сверьте точку с оперативными данными NASA FIRMS.",
      "Высокий риск для этого месяца. Ограничьте открытый огонь и следите за ветром.",
      "Очень высокий исторический риск. Точка в зоне частых крупных пожаров — приоритет для наблюдения."
    ],
    summary: "Сводка по очагам",
    count: "Очагов",
    avg: "Средний риск",
    max: "Максимум",
    highs: "Высокий и выше",
    manual: "Или введите координаты",
    bad: "Нужны числа: широта и долгота внутри Казахстана.",
    limit: "Не больше 20 очагов. Уберите лишний, чтобы добавить новый.",
    rank: "Место региона в месяце",
    of: "из",
    mw: "МВт",
    focus: "Очаг"
  },
  en: {
    title: "Fire risk map",
    sub: "Where fires are likely based on historical MODIS data for the selected month",
    month: "Month",
    locate: "My location",
    locating: "Locating…",
    denied: "Location access denied — allow it in your browser.",
    unsup: "Geolocation is not supported by this browser.",
    outside: "You are outside Kazakhstan — the nearest region is shown as an example:",
    near: "Nearest region",
    risk: "Risk index",
    lvl: ["Low", "Moderate", "High", "Very high"],
    legend: "Risk level",
    you: "You are here",
    km: "km",
    note: "Index = regional anomaly density × monthly seasonal factor. Illustrative model, not an operational forecast: see NASA FIRMS for live fires.",
    top: "Highest-risk regions this month",
    dens: "density",
    pin: "Pin a fire",
    pinOn: "Click the map",
    pinHint: "Pin mode is on: click inside Kazakhstan to attach a fire focus.",
    outkz: "A focus can only be pinned inside Kazakhstan.",
    attached: "Pinned foci",
    empty: "No foci yet. Turn on “Pin a fire” and click the map — details will appear for that point.",
    coords: "Coordinates",
    lat: "Latitude",
    lon: "Longitude",
    add: "Attach",
    remove: "Remove",
    clear: "Clear",
    report: "Focus details",
    forMonth: "Calculated for",
    biome: "Landscape",
    biomes: ["Steppe", "Cropland / burning", "Forest and mountains", "Shrub and desert"],
    frp: "Estimated FRP",
    conf: "Model confidence",
    confs: ["Low", "Medium", "High"],
    season: "Seasonal factor",
    advice: "Guidance",
    adv: [
      "Historical activity is low. Routine monitoring is enough.",
      "Moderate risk. Check the point against live NASA FIRMS data.",
      "High risk this month. Limit open flame and watch the wind.",
      "Very high historical risk. This point sits in a zone of frequent large fires — watch it first."
    ],
    summary: "Foci summary",
    count: "Foci",
    avg: "Average risk",
    max: "Maximum",
    highs: "High or above",
    manual: "Or enter coordinates",
    bad: "Enter numeric latitude and longitude inside Kazakhstan.",
    limit: "20 foci maximum. Remove one before adding another.",
    rank: "Region rank this month",
    of: "of",
    mw: "MW",
    focus: "Focus"
  },
  kz: {
    title: "Ошақтардың қауіп картасы",
    sub: "Таңдалған айда MODIS тарихи деректері бойынша өрт қай жерде болуы мүмкін",
    month: "Ай",
    locate: "Менің орналасқан жерім",
    locating: "Анықталуда…",
    denied: "Геолокацияға қолжетімсіз — браузерден рұқсат беріңіз.",
    unsup: "Браузер геолокацияны қолдамайды.",
    outside: "Сіз Қазақстаннан тыс жердесіз — мысал ретінде ең жақын аймақ көрсетілген:",
    near: "Ең жақын аймақ",
    risk: "Қауіп индексі",
    lvl: ["Төмен", "Орташа", "Жоғары", "Өте жоғары"],
    legend: "Қауіп деңгейі",
    you: "Сіз мұндасыз",
    km: "км",
    note: "Индекс = аймақтың аномалия тығыздығы × айдың маусымдық коэффициенті. Модель иллюстрациялық болып табылады, бұл жедел болжам емес: нақты өрттерді NASA FIRMS сайтынан қараңыз.",
    top: "Айдың ең қауіпті аймақтары",
    dens: "тығыздық",
    pin: "Ошақ белгілеу",
    pinOn: "Картаға басыңыз",
    pinHint: "Белгілеу режимі қосулы: Қазақстан аумағына басып, ошақты бекітіңіз.",
    outkz: "Ошақты тек Қазақстан ішінде бекітуге болады.",
    attached: "Бекітілген ошақтар",
    empty: "Ошақтар әзір жоқ. «Ошақ белгілеу» режимін қосып, картаға басыңыз — нүкте бойынша мәлімет шығады.",
    coords: "Координаттар",
    lat: "Ендік",
    lon: "Бойлық",
    add: "Бекіту",
    remove: "Алу",
    clear: "Тазалау",
    report: "Ошақ бойынша мәлімет",
    forMonth: "Есеп айы",
    biome: "Ландшафт түрі",
    biomes: ["Дала", "Егістік / өртеу", "Орман және тау", "Бұта және шөл"],
    frp: "FRP бағасы",
    conf: "Модель сенімділігі",
    confs: ["Төмен", "Орташа", "Жоғары"],
    season: "Маусымдық коэффициент",
    advice: "Ұсыным",
    adv: [
      "Тарихи белсенділік төмен. Қалыпты мониторинг жеткілікті.",
      "Орташа қауіп. Нүктені NASA FIRMS жедел деректерімен салыстырыңыз.",
      "Бұл айда қауіп жоғары. Ашық отты шектеп, желді бақылаңыз.",
      "Тарихи қауіп өте жоғары. Нүкте ірі өрттер жиі болатын аймақта — бақылау басымдығы."
    ],
    summary: "Ошақтар жиынтығы",
    count: "Ошақ",
    avg: "Орташа қауіп",
    max: "Максимум",
    highs: "Жоғары және одан да жоғары",
    manual: "Немесе координат енгізіңіз",
    bad: "Қазақстан ішіндегі ендік пен бойлық сандарын енгізіңіз.",
    limit: "Ең көбі 20 ошақ. Жаңасын қосу үшін біреуін алып тастаңыз.",
    rank: "Аймақтың айдағы орны",
    of: "/",
    mw: "МВт",
    focus: "Ошақ"
  }
};

const BIOME_I = {
  "СКО": 1, "КОС": 1, "АКМ": 1, "ПВЛ": 1, "АСТ": 1,
  "ЗКО": 0, "АКТ": 0, "КРГ": 0, "УЛЫ": 0, "АТР": 0,
  "АБА": 2, "ВКО": 2, "АЛМ": 2, "ЖЕТ": 2, "АЛГ": 2,
  "ШЫМ": 3, "КЗО": 3, "ЖАМ": 3, "ТУР": 3, "МАН": 3
};

export const nearestRegion = ll => {
  let best = null;
  REGIONS.forEach(r => {
    const d = dist(ll, r.ll);
    if (!best || d < best.d) best = { r, d };
  });
  return best;
};

export const focusBrief = (region, month) => {
  const v = risk(region, month);
  const s = season(month);
  const frp = Math.max(4, Math.round((10 + region.d * 58) * (0.55 + s * 0.85)));
  const conf = region.d >= 0.5 ? 2 : region.d >= 0.25 ? 1 : 0;
  return { v, lv: level(v), season: s, frp, conf, biome: BIOME_I[region.code] ?? 0 };
};
import { R, VM } from './data';

// Центры административных единиц Казахстана (широта, долгота) и названия.
// Ключ — тот же код, что и в data.js (R).
export const GEO = {
  "СКО": { ll: [54.2, 69.4], ru: "Северо-Казахстанская обл.", en: "North Kazakhstan" },
  "КОС": { ll: [52.5, 63.6], ru: "Костанайская обл.", en: "Kostanay" },
  "АКМ": { ll: [51.9, 69.4], ru: "Акмолинская обл.", en: "Akmola" },
  "ЗКО": { ll: [50.6, 50.9], ru: "Западно-Казахстанская обл.", en: "West Kazakhstan" },
  "ПВЛ": { ll: [52.3, 76.9], ru: "Павлодарская обл.", en: "Pavlodar" },
  "АКТ": { ll: [49.8, 58.2], ru: "Актюбинская обл.", en: "Aktobe" },
  "АБА": { ll: [49.9, 80.3], ru: "обл. Абай", en: "Abai" },
  "АЛМ": { ll: [44.2, 77.9], ru: "Алматинская обл.", en: "Almaty Region" },
  "ШЫМ": { ll: [42.3, 69.6], ru: "г. Шымкент", en: "Shymkent" },
  "КРГ": { ll: [49.3, 73.1], ru: "Карагандинская обл.", en: "Karaganda" },
  "КЗО": { ll: [45.0, 65.5], ru: "Кызылординская обл.", en: "Kyzylorda" },
  "АСТ": { ll: [51.15, 71.45], ru: "г. Астана", en: "Astana" },
  "ЖАМ": { ll: [43.6, 71.4], ru: "Жамбылская обл.", en: "Zhambyl" },
  "ЖЕТ": { ll: [45.2, 79.0], ru: "обл. Жетісу", en: "Jetisu" },
  "УЛЫ": { ll: [48.0, 67.0], ru: "обл. Ұлытау", en: "Ulytau" },
  "ВКО": { ll: [48.6, 83.8], ru: "Восточно-Казахстанская обл.", en: "East Kazakhstan" },
  "ТУР": { ll: [43.9, 67.9], ru: "Туркестанская обл.", en: "Turkestan" },
  "АТР": { ll: [47.5, 52.5], ru: "Атырауская обл.", en: "Atyrau" },
  "АЛГ": { ll: [43.25, 76.9], ru: "г. Алматы", en: "Almaty city" },
  "МАН": { ll: [44.0, 54.0], ru: "Мангистауская обл.", en: "Mangystau" }
};

const MAXD = Math.max(...R.map(r => r[1]));
const MAXS = Math.max(...VM);

// Список регионов с базовой плотностью (MODIS, точек/км²)
export const REGIONS = R.map(([code, d]) => ({
  code,
  d,
  ll: GEO[code].ll,
  ru: GEO[code].ru,
  en: GEO[code].en
}));

// Сезонный коэффициент месяца (0..1): пик в апреле
export const season = m => VM[m] / MAXS;

// Индекс риска региона в заданном месяце, 0..100.
// Это иллюстративная модель на исторической плотности, а не оперативный прогноз.
export const risk = (r, m) => Math.round((r.d / MAXD) * season(m) * 100);

export const level = v =>
  v >= 55 ? 3 : v >= 28 ? 2 : v >= 10 ? 1 : 0;

export const LEVEL_COLOR = ["#52525b", "#f5c542", "#ff7a2f", "#ff3b1f"];

// Расстояние по сфере, км
export const dist = (a, b) => {
  const rad = x => (x * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLon = rad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
};

// Тексты секции карты
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
    dens: "плотность"
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
    dens: "density"
  }
};
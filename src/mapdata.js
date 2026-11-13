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
    dens: "тығыздық"
  }
};
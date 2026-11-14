const DEFAULT_FILES = [
  'fire_archive_SV-C2_847764.json',
];

function getBaseUrl() {
  const base = import.meta?.env?.BASE_URL || './';
  return base.endsWith('/') ? base : `${base}/`;
}

export async function loadFireArchives(files = DEFAULT_FILES) {
  const baseUrl = getBaseUrl();

  const loaded = await Promise.all(
    files.map(async (fileName) => {
      const url = `${baseUrl}fires/${fileName}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Ошибка загрузки ${url}: ${res.status}`);
      }
      return res.json();
    })
  );

  return loaded.flat().map((item) => ({
    ...item,
    latitude: Number(item.latitude),
    longitude: Number(item.longitude),
    frp: item.frp !== undefined ? Number(item.frp) : 0,
    brightness: item.brightness !== undefined ? Number(item.brightness) : null,
    bright_t31: item.bright_t31 !== undefined ? Number(item.bright_t31) : null,
  }));
}
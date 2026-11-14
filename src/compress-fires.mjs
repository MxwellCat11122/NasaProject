// src/compress-fires.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// По умолчанию ищет JSON в src/fires; если лежат в public/fires — замени на '../public/fires'
const dir = path.resolve(__dirname, 'fires');

if (!fs.existsSync(dir)) {
  console.error('Папка не найдена:', dir);
  process.exit(1);
}

const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

for (const file of files) {
  const full = path.join(dir, file);
  const raw = JSON.parse(fs.readFileSync(full, 'utf8'));
  if (!Array.isArray(raw)) continue;

  const compact = raw
    .filter(p => Number.isFinite(Number(p?.latitude)) && Number.isFinite(Number(p?.longitude)))
    .map(p => {
      const m =
        typeof p.acq_date === 'string' && p.acq_date.length >= 7
          ? Number(p.acq_date.slice(5, 7)) - 1
          : -1;
      return [
        Math.round(Number(p.latitude) * 1000) / 1000,
        Math.round(Number(p.longitude) * 1000) / 1000,
        Math.round((Number(p.frp) || 0) * 10) / 10,
        m,
        p.acq_date || '',
        p.satellite || '',
      ];
    });

  fs.writeFileSync(full, JSON.stringify(compact));
  console.log(`${file}: ${raw.length} -> ${compact.length}`);
}
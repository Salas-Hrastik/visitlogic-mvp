/**
 * Tjedni agent - cijeli lanac u jednom pozivu.
 * Pokretanje: node scripts/sentiment-sb/run.mjs
 * Svaki korak se biljezi; pad izrade izvjestaja ne brise vec prikupljene podatke.
 */
import { prikupi } from './collect.mjs';
import { analiziraj } from './analyze.mjs';
import { izvjestaj } from './report.mjs';

const t0 = Date.now();
const log = (...a) => console.log(`[${((Date.now()-t0)/1000).toFixed(1)}s]`, ...a);

try {
  log('01-02  Prikupljanje i normalizacija...');
  const sirovo = await prikupi({ log });
  const pali = sirovo.statusi.filter(s => s.status === 'nedostupan');
  if (pali.length === sirovo.statusi.length) throw new Error('Nijedan izvor nije dostupan - prekid.');
  if (pali.length) log(`UPOZORENJE: ${pali.length} izvor(a) nedostupno: ${pali.map(p=>p.izvor_id).join(', ')}`);

  log('03-10  Analiza i agregacija...');
  const a = await analiziraj({ log });

  log('12     Izrada izvjestaja...');
  const put = await izvjestaj({ log });

  log(`Gotovo. OSG=${a.indeksi.OSG.vrijednost ?? '-'}, spominjanja=${a.obrada.spominjanja_ukupno}, upozorenja=${a.upozorenja.length}`);
  log(`Izvjestaj: ${put}`);
} catch (e) {
  console.error('PAD IZVODJENJA:', e.message);
  process.exitCode = 1;
}

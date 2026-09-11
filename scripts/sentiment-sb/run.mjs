/**
 * Tjedni agent - cijeli lanac u jednom pozivu.
 * Pokretanje: node scripts/sentiment-sb/run.mjs
 * Svaki korak se biljezi; pad izrade izvjestaja ne brise vec prikupljene podatke.
 */
import { prikupi } from './collect.mjs';
import { analiziraj } from './analyze.mjs';
import { izvjestaj } from './report.mjs';
import { dostupan, ucitajRegistar, dohvatiOcjene, fixture, procjenaKvote } from './places.mjs';

const t0 = Date.now();
const log = (...a) => console.log(`[${((Date.now()-t0)/1000).toFixed(1)}s]`, ...a);

try {
  log('01-02  Prikupljanje i normalizacija...');
  const sirovo = await prikupi({ log });
  const pali = sirovo.statusi.filter(s => s.status === 'nedostupan');
  if (pali.length === sirovo.statusi.length) throw new Error('Nijedan izvor nije dostupan - prekid.');
  if (pali.length) log(`UPOZORENJE: ${pali.length} izvor(a) nedostupno: ${pali.map(p=>p.izvor_id).join(', ')}`);

  /* Sloj ocjena: stvarni Google Places ako postoji kljuc, inace fixture na
     zahtjev (SB_FIXTURE=1), inace se preskace i kategorije ostaju prazne. */
  let ocjene = null;
  if (dostupan()) {
    log('01b    Google Places - ocjene i recenzije...');
    const registar = await ucitajRegistar();
    if (!registar.objekti.length) {
      log('  UPOZORENJE: registar objekata je prazan. Pokreni otkrivanje: node scripts/sentiment-sb/discover-places.mjs');
    } else {
      ocjene = await dohvatiOcjene({ kljuc: process.env.GOOGLE_MAPS_API_KEY, registar, log });
      ocjene._izvor = 'google_places';
      const q = procjenaKvote(registar.objekti.length);
      log(`  kvota: ~${q.poziva} poziva/mj, besplatno ${q.besplatno}, naplativo ${q.naplativo} (~$${q.trosak_usd}/mj)`);
    }
  } else if (process.env.SB_FIXTURE === '1') {
    log('01b    Sloj ocjena: SINTETICKI FIXTURE (nije stvarni podatak)');
    ocjene = await fixture(log);
    ocjene._izvor = 'FIXTURE';
  } else {
    log('01b    Sloj ocjena preskocen: nema GOOGLE_MAPS_API_KEY');
  }

  log('03-10  Analiza i agregacija...');
  const a = await analiziraj({ log, ocjene });

  log('12     Izrada izvjestaja...');
  const put = await izvjestaj({ log, fixture: ocjene?._izvor === 'FIXTURE' });

  log(`Gotovo. OSG=${a.indeksi.OSG.vrijednost ?? '-'}, spominjanja=${a.obrada.spominjanja_ukupno}, upozorenja=${a.upozorenja.length}`);
  log(`Izvjestaj: ${put}`);
} catch (e) {
  console.error('PAD IZVODJENJA:', e.message);
  process.exitCode = 1;
}

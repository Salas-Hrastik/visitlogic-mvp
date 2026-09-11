/**
 * Jednokratno otkrivanje objekata u Slavonskom Brodu preko Text Search API-ja.
 * Sprema SAMO place_id i osnovne podatke (dopusteno trajno cuvati).
 * Pokretanje: GOOGLE_MAPS_API_KEY=... node scripts/sentiment-sb/discover-places.mjs
 */
import { otkrij, procjenaKvote } from './places.mjs';

const kljuc = process.env.GOOGLE_MAPS_API_KEY;
if (!kljuc) { console.error('Nedostaje GOOGLE_MAPS_API_KEY.'); process.exit(1); }

const UPITI = [
  { upit: 'restorani u Slavonskom Brodu', kategorija: 'G' },
  { upit: 'kafići u Slavonskom Brodu', kategorija: 'G' },
  { upit: 'pizzerije u Slavonskom Brodu', kategorija: 'G' },
  { upit: 'slastičarnice u Slavonskom Brodu', kategorija: 'G' },
  { upit: 'hoteli u Slavonskom Brodu', kategorija: 'S' },
  { upit: 'apartmani i sobe u Slavonskom Brodu', kategorija: 'S' },
  { upit: 'hosteli u Slavonskom Brodu', kategorija: 'S' },
  { upit: 'znamenitosti i muzeji u Slavonskom Brodu', kategorija: 'A' },
  { upit: 'Tvrđava Brod Slavonski Brod', kategorija: 'A' }
];

const r = await otkrij({ kljuc, upiti: UPITI });
const q = procjenaKvote(r.objekti.length);
console.log(`\nRegistar: ${r.objekti.length} objekata.`);
console.log(`Tjedni dohvat: ~${q.poziva} poziva mjesecno; besplatno ${q.besplatno}; naplativo ${q.naplativo} (~$${q.trosak_usd}/mj).`);

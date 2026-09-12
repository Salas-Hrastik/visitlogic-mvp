/**
 * Provjera Google API kljuca PRIJE nego potrosi kvotu.
 *
 * Salje dva poziva:
 *   1. Text Search s minimalnom maskom polja  -> je li kljuc valjan i API ukljucen
 *   2. Place Details s punom maskom           -> jesu li ocjene i recenzije dostupne
 *
 * Pokretanje: GOOGLE_MAPS_API_KEY=... node scripts/sentiment-sb/check-key.mjs
 */
import { objasniGresku, procjenaKvote, izvuciPoveznicu, SERVIS } from './places.mjs';

const kljuc = process.env.GOOGLE_MAPS_API_KEY;
const ok = t => console.log(`  \x1b[32m✓\x1b[0m ${t}`);
const ne = t => console.log(`  \x1b[31m✕\x1b[0m ${t}`);

if (!kljuc) {
  ne('Varijabla GOOGLE_MAPS_API_KEY nije postavljena.');
  console.log('\n  Pokrenite ovako:\n    GOOGLE_MAPS_API_KEY=AIza... node scripts/sentiment-sb/check-key.mjs\n');
  process.exit(1);
}
if (!/^AIza[\w-]{30,}$/.test(kljuc)) {
  ne(`Ključ ne izgleda kao Google API ključ (očekuje se oblik "AIza..." duljine oko 39 znakova). Dobiveno: ${kljuc.length} znakova.`);
  process.exit(1);
}
ok(`Ključ je postavljen (${kljuc.slice(0,6)}…${kljuc.slice(-4)}, ${kljuc.length} znakova).`);

async function zovi(url, maska, tijelo) {
  const res = await fetch(url, {
    method: tijelo ? 'POST' : 'GET',
    headers: { 'X-Goog-Api-Key': kljuc, 'X-Goog-FieldMask': maska,
               ...(tijelo ? { 'Content-Type': 'application/json' } : {}) },
    body: tijelo ? JSON.stringify(tijelo) : undefined
  });
  const tekst = await res.text();
  return { ok: res.ok, status: res.status, tekst };
}

console.log('\n1/2  Text Search — je li ključ valjan i API uključen…');
const a = await zovi('https://places.googleapis.com/v1/places:searchText',
  'places.id,places.displayName',
  { textQuery: 'Tvrđava Brod Slavonski Brod', languageCode: 'hr', regionCode: 'HR', maxResultCount: 1 });

if (!a.ok) {
  ne(`HTTP ${a.status}`);
  console.log('  Odgovor:', a.tekst.slice(0, 400));
  console.log(`\n  \x1b[33mŠto napraviti:\x1b[0m ${objasniGresku(a.tekst)}`);
  const veza = izvuciPoveznicu(a.tekst);
  if (veza) console.log(`  \x1b[36mGoogle nudi izravnu poveznicu:\x1b[0m ${veza}`);
  console.log(`  \x1b[36mStranica za uključivanje:\x1b[0m https://console.cloud.google.com/apis/library/${SERVIS}\n`);
  process.exit(1);
}
const pa = JSON.parse(a.tekst);
const prvi = (pa.places || [])[0];
if (!prvi) { ne('API radi, ali upit nije vratio nijedan objekt. Provjerite naziv upita.'); process.exit(1); }
ok(`Text Search radi. Pronađeno: "${prvi.displayName?.text}" (place_id ${prvi.id.slice(0,18)}…).`);

console.log('\n2/2  Place Details — jesu li ocjene i recenzije dostupne…');
const b = await zovi(`https://places.googleapis.com/v1/places/${encodeURIComponent(prvi.id)}`,
  'id,rating,userRatingCount,reviews');

if (!b.ok) {
  ne(`HTTP ${b.status}`);
  console.log('  Odgovor:', b.tekst.slice(0, 400));
  console.log(`\n  \x1b[33mŠto napraviti:\x1b[0m ${objasniGresku(b.tekst)}`);
  console.log('  Napomena: polja rating i reviews pripadaju skupljim SKU-ovima (Enterprise, Enterprise + Atmosphere).');
  console.log('  Ako Text Search radi a ovo ne, ograničenje je najvjerojatnije na razini polja ili naplatnog računa.\n');
  process.exit(1);
}
const pb = JSON.parse(b.tekst);
ok(`Place Details radi. Ocjena: ${pb.rating ?? 'nema'}, broj ocjena: ${pb.userRatingCount ?? 0}, recenzija u odgovoru: ${(pb.reviews||[]).length}.`);

const q = procjenaKvote(190);
console.log(`\n\x1b[32mSve je spremno.\x1b[0m Sljedeći korak:`);
console.log('  GOOGLE_MAPS_API_KEY=… node scripts/sentiment-sb/discover-places.mjs');
console.log(`\nPodsjetnik na kvotu: uz ~190 objekata i tjedni dohvat to je ~${q.poziva} poziva mjesečno,`);
console.log(`unutar besplatnih ${q.besplatno} (Place Details Enterprise + Atmosphere). Potrošeno na ovu provjeru: 2 poziva.\n`);

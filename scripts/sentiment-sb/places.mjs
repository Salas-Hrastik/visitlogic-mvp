/**
 * Google Places API (New) - sloj ocjena i recenzija za ugostiteljstvo i smjestaj.
 *
 * PRAVNI OKVIR (provjereno na developers.google.com/maps/.../policies, 11.09.2026.):
 *   "You must not pre-fetch, cache, or store Places API content beyond the allowed
 *    exceptions, although the place_id is exempt from caching restrictions."
 *
 * Iz toga slijedi arhitektura ovog modula:
 *   - place_id se SMIJE trajno pohraniti  -> registar objekata na disku
 *   - ocjene, broj ocjena i tekst recenzija NE pohranjuju se na disk. Prolaze kroz
 *     memoriju do agregacije; na disk ide samo IZVEDENA vrijednost (indeks, broj
 *     novih recenzija, delta), koja nije reprodukcija Googleova sadrzaja.
 *   - struganje Google Mapsa nije implementirano niti ce biti: protivno uvjetima.
 *
 * SKU (provjereno u sluzbenom cjeniku, 11.09.2026.):
 *   Place Details Pro                      5.000 poziva/mj besplatno, zatim $17/1.000
 *   Place Details Enterprise               1.000 poziva/mj besplatno, zatim $20/1.000  (rating, userRatingCount)
 *   Place Details Enterprise + Atmosphere  1.000 poziva/mj besplatno, zatim $25/1.000  (reviews)
 *   Text Search Enterprise                 1.000 poziva/mj besplatno, zatim $35/1.000
 *
 * Bez varijable okoline GOOGLE_MAPS_API_KEY modul se ponasa kao nedostupan izvor
 * i ne rusi izvodjenje.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const REGISTAR = path.join(ROOT, 'data/sentiment-sb/place-registry.json');
const BAZA = 'https://places.googleapis.com/v1';

/** Polja koja trazimo. Field mask je obavezan - bez njega API vraca gresku. */
const MASKA_DETALJI = 'id,rating,userRatingCount,reviews';
const MASKA_TRAZI = 'places.id,places.displayName,places.primaryType,places.location';

const spava = ms => new Promise(r => setTimeout(r, ms));

/* Gornja granica poziva po jednom izvodjenju. Stiti od toga da narastao
   registar tiho probije besplatnu kvotu. Nadjacava se s SB_MAX_POZIVA. */
export const MAX_POZIVA = Number(process.env.SB_MAX_POZIVA || 230);

/** Servis Places API-ja (New) - potvrdjeno iz Googleova odgovora na gresku. */
export const SERVIS = 'places.googleapis.com';

/** Iz Googleova odgovora vadi poveznicu za ukljucivanje API-ja, ako je ima. */
export function izvuciPoveznicu(poruka) {
  const m = String(poruka).match(/https?:\/\/console\.(?:developers|cloud)\.google\.com\/[^\s"'\\]+/);
  return m ? m[0] : null;
}

/** Iz Googleova odgovora vadi broj projekta, ako je naveden. */
export function izvuciProjekt(poruka) {
  const m = String(poruka).match(/project[\s:=]+(\d{6,})/i);
  return m ? m[1] : null;
}

/** Prevodi Googleove greske u uputu sto tocno treba popraviti. */
export function objasniGresku(poruka) {
  const p = String(poruka);
  if (/API key not valid|API_KEY_INVALID/i.test(p))
    return 'Ključ nije valjan. Provjerite jeste li kopirali cijeli ključ (počinje s "AIza") i da pripada ovom projektu.';
  if (/SERVICE_DISABLED|has not been used in project|is disabled/i.test(p)) {
    const projekt = izvuciProjekt(p);
    return 'Places API (New) nije uključen u projektu. Otvorite izravno: '
      + `https://console.cloud.google.com/apis/library/${SERVIS}`
      + (projekt ? `?project=${projekt}` : '') + ' pa kliknite Enable.';
  }
  if (/API_KEY_SERVICE_BLOCKED|blocked/i.test(p))
    return 'Ključ ima ograničenje koje ne dopušta Places API. Cloud Console → Credentials → vaš ključ → API restrictions → dodajte "Places API (New)". '
      + `Ako se u popisu ne pojavljuje, API još nije uključen: https://console.cloud.google.com/apis/library/${SERVIS}`;
  if (/billing|BILLING_DISABLED/i.test(p))
    return 'Projekt nema aktivan naplatni račun. Cloud Console → Billing → povežite projekt s naplatnim računom (besplatna kvota i dalje vrijedi).';
  if (/PERMISSION_DENIED|REQUEST_DENIED|403/i.test(p))
    return 'Zahtjev odbijen. Najčešći uzroci: ključ ograničen na IP adrese (a poziv dolazi s drugog stroja) ili API nije uključen.';
  if (/RESOURCE_EXHAUSTED|429|quota/i.test(p))
    return 'Prekoračena kvota. Pričekajte ili povisite ograničenje u Cloud Console → APIs & Services → Places API → Quotas.';
  return 'Nepoznata greška — cijeli odgovor je ispisan iznad.';
}

async function poziv(url, { kljuc, maska, tijelo = null, timeout = 20000 }) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, {
      method: tijelo ? 'POST' : 'GET',
      headers: {
        'X-Goog-Api-Key': kljuc,
        'X-Goog-FieldMask': maska,
        ...(tijelo ? { 'Content-Type': 'application/json' } : {})
      },
      body: tijelo ? JSON.stringify(tijelo) : undefined,
      signal: ctrl.signal
    });
    const tekst = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${tekst.slice(0, 160)}`);
    return JSON.parse(tekst);
  } finally { clearTimeout(t); }
}

/** Jednokratno otkrivanje objekata. place_id se pohranjuje trajno (dopusteno). */
export async function otkrij({ kljuc, upiti, log = console.log }) {
  const registar = await ucitajRegistar();
  let novih = 0;
  for (const { upit, kategorija } of upiti) {
    const odg = await poziv(`${BAZA}/places:searchText`, {
      kljuc, maska: MASKA_TRAZI,
      tijelo: { textQuery: upit, languageCode: 'hr', regionCode: 'HR', maxResultCount: 20 }
    });
    for (const p of odg.places || []) {
      if (registar.objekti.some(o => o.place_id === p.id)) continue;
      registar.objekti.push({
        place_id: p.id,
        naziv: p.displayName?.text || '(bez naziva)',
        tip: p.primaryType || null,
        kategorija,
        lat: p.location?.latitude ?? null,
        lon: p.location?.longitude ?? null,
        dodan: new Date().toISOString().slice(0, 10)
      });
      novih++;
    }
    await spava(400);
    log(`  otkrivanje "${upit}": ukupno ${registar.objekti.length} objekata (+${novih})`);
  }
  registar.azurirano = new Date().toISOString();
  await fs.writeFile(REGISTAR, JSON.stringify(registar, null, 1));
  return registar;
}

export async function ucitajRegistar() {
  try { return JSON.parse(await fs.readFile(REGISTAR, 'utf8')); }
  catch { return { _napomena: 'Samo place_id i osnovni podaci o objektu. Ocjene i recenzije se NE pohranjuju (uvjeti Places API-ja).', azurirano: null, objekti: [] }; }
}

/**
 * Tjedni dohvat ocjena i recenzija.
 * Vraca podatke SAMO u memoriji - pozivatelj ih ne smije zapisati na disk.
 */
export async function dohvatiOcjene({ kljuc, registar, log = console.log, razmak = 250 }) {
  const out = [];
  if (registar.objekti.length > MAX_POZIVA)
    log(`  UPOZORENJE: registar ima ${registar.objekti.length} objekata, a granica po izvođenju je ${MAX_POZIVA}. Obrađujem prvih ${MAX_POZIVA}. Povisite s SB_MAX_POZIVA ako želite više (pazite na kvotu).`);
  for (const o of registar.objekti.slice(0, MAX_POZIVA)) {
    try {
      const p = await poziv(`${BAZA}/places/${encodeURIComponent(o.place_id)}`, { kljuc, maska: MASKA_DETALJI });
      out.push({
        place_id: o.place_id, naziv: o.naziv, kategorija: o.kategorija,
        ocjena: p.rating ?? null,
        broj_ocjena: p.userRatingCount ?? 0,
        recenzije: (p.reviews || []).map(r => ({
          ocjena: r.rating ?? null,
          tekst: r.originalText?.text || r.text?.text || '',
          jezik: r.originalText?.languageCode || r.text?.languageCode || null,
          vrijeme: r.publishTime || null
        }))
      });
    } catch (e) {
      log(`    ! ${o.naziv}: ${e.message}`);
    }
    await spava(razmak);
  }
  log(`  places: ${out.length}/${registar.objekti.length} objekata, ${out.reduce((s,x)=>s+x.recenzije.length,0)} recenzija`);
  return out;
}

/** Procjena mjesecne potrosnje i troska prema stvarnom cjeniku. */
export function procjenaKvote(brojObjekata, dohvataMjesecno = 4.33) {
  const poziva = Math.round(brojObjekata * dohvataMjesecno);
  const besplatno = 1000;                       // Place Details Enterprise + Atmosphere
  const naplativo = Math.max(0, poziva - besplatno);
  return { poziva, besplatno, naplativo, trosak_usd: +(naplativo / 1000 * 25).toFixed(2) };
}

/** Ucitava fixture umjesto stvarnog API-ja - za provjeru koda bez kljuca. */
export async function fixture(log = console.log) {
  const p = path.join(import.meta.dirname, 'fixtures/places-fixture.json');
  const d = JSON.parse(await fs.readFile(p, 'utf8'));
  log(`  places (FIXTURE): ${d.objekti.length} objekata, ${d.objekti.reduce((s,x)=>s+x.recenzije.length,0)} recenzija`);
  return d.objekti;
}

export const dostupan = () => !!process.env.GOOGLE_MAPS_API_KEY;

/**
 * KORACI 03-10: dedupikacija, relevantnost, aspekti, sentiment, agregacija, anomalije.
 * Formule prate docs/sentiment-agent-slavonski-brod.html, pogl. 4.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { POZITIVNO, NEGATIVNO, POJACIVACI, UMANJIVACI, NEGACIJE,
         IRONIJA_OBRASCI, KATEGORIJE, GEO_GRAD, GEO_ZUPANIJA, GEO_NEGATIVNO, norm } from './lexicon.mjs';

/* Podudaranje ISKLJUCIVO na granici rijeci + korijen.
   Bez toga "ugostili" pada u Smjestaj, a "sudjelovanje" u negativni sentiment. */
const naGranici = korijen => new RegExp('(?:^|[^a-z0-9])' + korijen.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
const RX_POZ = Object.entries(POZITIVNO).map(([k,v]) => [naGranici(k), v, k]);
const RX_NEG = Object.entries(NEGATIVNO).map(([k,v]) => [naGranici(k), v, k]);
const RX_KAT = Object.fromEntries(Object.entries(KATEGORIJE).map(([k,d]) => [k, d.kljucne.map(kw => naGranici(norm(kw)))]));
const RX_GRAD = GEO_GRAD.map(naGranici);
const RX_ZUP = GEO_ZUPANIJA.map(naGranici);
// Nazivi mjesta se podudaraju kao podniz: "Donjoandrijevcani" sadrzi "andrijevc"
// bez granice rijeci, a i dalje je rijec o Donjim Andrijevcima.
const RX_NEGGEO = GEO_NEGATIVNO.map(k => new RegExp(k));
const broji = (rxs, t) => rxs.reduce((a, rx) => a + (rx.test(t) ? 1 : 0), 0);

const ROOT = path.resolve(import.meta.dirname, '../..');
const RAZRED_KVALITETE = { sbplus:0.80, brodportal:0.80, grad_sb:0.85, gdelt:0.40 };
const PONDERI_OSG = { O:0.40, K:0.20, P:0.15, B:0.10, D:0.075, A:0.075 };
const PRAG_PUNO = 15, PRAG_INDIKATIVNO = 5;
/* Prior dosega izvora (prihvati objavu hiperlokalnog portala i kad grad nije imenovan).
   ISKLJUCEN na temelju mjerenja na zlatnom uzorku od 25 spominjanja (2026-09-11):
   preciznost relevantnosti s priorom 0,50 (5/10) naspram 0,93 (14/15) bez njega.
   Ukljuciti tek kad prolaz 2 (povezivanje s registrom objekata) bude implementiran. */
const PRIOR_UKLJUCEN = process.env.SB_PRIOR === '1';

const hash = s => crypto.createHash('sha256').update(s).digest('hex').slice(0,16);

/* ---------- KORAK 04: relevantnost ---------- */
/** Tri prolaza iz spec. 3.1.
 *  Prolaz 3 ("prior dosega izvora"): hiperlokalni portal pise o svom gradu i kad ga
 *  ne imenuje ("u gradu", "na Korzu"). Ako nije imenovano NIJEDNO drugo mjesto,
 *  objava se uvjetno prihvaca, ali s oznakom `prior` i nizom pouzdanoscu -
 *  u izvjestaju se broji odvojeno. Prava zamjena za ovo je povezivanje s
 *  registrom objekata (spec. 3.1, prolaz 2), koje iteracija 1 jos nema.
 */
function relevantnost(naslov, tekst) {
  const n = norm(tekst), nn = norm(naslov);
  const grad = broji(RX_GRAD, n), gradNaslov = broji(RX_GRAD, nn);
  const zup = broji(RX_ZUP, n), drugi = broji(RX_NEGGEO, n);
  if (grad === 0 && drugi > 0) return { v: 0.15, prior: false };
  if (grad === 0 && zup > 0)   return { v: 0.50, prior: false };
  if (grad === 0)              return { v: PRIOR_UKLJUCEN ? 0.62 : 0.45, prior: true };
  if (drugi > grad)            return { v: 0.55, prior: false };
  return { v: Math.min(1, 0.80 + 0.05 * grad + (gradNaslov ? 0.10 : 0)), prior: false };
}

/* ---------- KORAK 06: aspekti ---------- */
/** Pogodak u naslovu vrijedi 3x. Kategorija ulazi tek s rezultatom >= 3,
 *  sto sprjecava da jedna usputna rijec iz tijela teksta otvori kategoriju. */
function aspekti(naslov, tekst) {
  const n = norm(tekst), nn = norm(naslov);
  const bodovi = Object.entries(RX_KAT)
    .map(([k, rxs]) => ({ kategorija: k, bod: 3 * broji(rxs, nn) + broji(rxs, n) }))
    .filter(x => x.bod >= 3)
    .sort((a,b) => b.bod - a.bod);
  // Nista ne dosize prag: objava je relevantna za grad, ali bez jasne teme ->
  // pripada opcem gradskom sentimentu (O), uz oznaku da je rijec o rezervi.
  if (bodovi.length === 0) return { kategorije: ['O'], rezerva: true };
  return { kategorije: bodovi.slice(0, 2).map(x => x.kategorija), rezerva: false };
}

/* ---------- KORAK 07: sentiment (leksicki MVP) ---------- */
function sentiment(tekst) {
  const rijeci = norm(tekst).replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(Boolean);
  let zbroj = 0, pogodaka = 0;
  for (let i = 0; i < rijeci.length; i++) {
    const r = rijeci[i];
    let w = 0;
    for (const [, t, korijen] of RX_POZ) if (r.startsWith(korijen)) { w = t; break; }
    if (w === 0) for (const [, t, korijen] of RX_NEG) if (r.startsWith(korijen)) { w = t; break; }
    if (w === 0) continue;
    let mnoz = 1;
    for (let j = Math.max(0, i-2); j < i; j++) {
      const p = rijeci[j];
      for (const [k,v] of Object.entries(POJACIVACI)) if (p.startsWith(k)) mnoz *= v;
      for (const [k,v] of Object.entries(UMANJIVACI)) if (p.startsWith(k)) mnoz *= v;
      if (NEGACIJE.includes(p)) mnoz *= -0.8;
    }
    zbroj += w * mnoz; pogodaka++;
  }
  if (pogodaka === 0) return { polaritet: 0, pouzdanost: 0.20, pogodaka: 0, mjesovito: false };
  const sirovi = zbroj / Math.sqrt(pogodaka);          // prigusenje po broju pogodaka
  const polaritet = Math.max(-1, Math.min(1, sirovi / 2.2));
  const ironija = IRONIJA_OBRASCI.some(re => re.test(norm(tekst)));
  const mjesovito = pogodaka >= 4 && Math.abs(polaritet) < 0.12;
  let pouzdanost = Math.min(0.85, 0.30 + 0.10 * pogodaka);
  if (ironija) pouzdanost *= 0.6;
  if (mjesovito) pouzdanost *= 0.8;
  return { polaritet, pouzdanost, pogodaka, mjesovito, ironija };
}

/* ---------- statistika ---------- */
const tjedanKljuc = (d, kraj) => Math.floor((kraj - d) / (7*864e5));  // 0 = zadnjih 7 dana

function bootstrapCI(vrijednosti, tezine, n = 600) {
  if (vrijednosti.length < 3) return [null, null];
  const out = [];
  for (let b = 0; b < n; b++) {
    let sw = 0, sv = 0;
    for (let i = 0; i < vrijednosti.length; i++) {
      const k = Math.floor(Math.random() * vrijednosti.length);
      sw += tezine[k]; sv += tezine[k] * vrijednosti[k];
    }
    out.push(sw ? sv/sw : 0);
  }
  out.sort((a,b)=>a-b);
  return [out[Math.floor(n*0.05)], out[Math.floor(n*0.95)]];
}

function winsoriziraj(v) {
  if (v.length < 5) return v;
  const s = [...v].sort((a,b)=>a-b);
  const lo = s[Math.floor(s.length*0.05)], hi = s[Math.floor(s.length*0.95)];
  return v.map(x => Math.max(lo, Math.min(hi, x)));
}

function indeks(spominjanja) {
  const n = spominjanja.length;
  if (n === 0) return { vrijednost:null, n:0, izvora:0, pouzdanost:'nema', ci:[null,null], udio_neg:null, udio_poz:null, status:'nedovoljno' };
  const pol = winsoriziraj(spominjanja.map(m => m.polaritet));
  const tez = spominjanja.map(m => m.tezina);
  const sw = tez.reduce((a,b)=>a+b,0);
  const S = sw ? pol.reduce((a,p,i)=>a+p*tez[i],0)/sw : 0;
  const [lo,hi] = bootstrapCI(pol, tez);
  const izvora = new Set(spominjanja.map(m => m.izvor_id)).size;
  const pouzdanost = n >= PRAG_PUNO && izvora >= 2 ? 'visoka'
                   : n >= PRAG_INDIKATIVNO ? 'srednja' : 'niska';
  return {
    vrijednost: n >= PRAG_INDIKATIVNO ? +(50*(S+1)).toFixed(1) : null,
    n, izvora, pouzdanost,
    ci: [lo===null?null:+(50*(lo+1)).toFixed(1), hi===null?null:+(50*(hi+1)).toFixed(1)],
    udio_neg: +(spominjanja.filter(m=>m.polaritet < -0.2).length / n).toFixed(3),
    udio_poz: +(spominjanja.filter(m=>m.polaritet > 0.2).length / n).toFixed(3),
    status: n >= PRAG_PUNO ? 'puno' : n >= PRAG_INDIKATIVNO ? 'indikativno' : 'nedovoljno'
  };
}

export async function analiziraj({ log = console.log } = {}) {
  const dir = path.join(ROOT, 'data/sentiment-sb');
  const sirovo = JSON.parse(await fs.readFile(path.join(dir, 'raw-latest.json'), 'utf8'));
  const kraj = new Date(sirovo.dohvaceno).getTime();

  /* KORAK 03: dedupikacija po normaliziranom naslovu */
  const vidjeni = new Map();
  const stavke = [];
  let duplikata = 0, bezDatuma = 0;
  for (const s of sirovo.stavke) {
    const kljuc = hash(norm(s.naslov).slice(0,90));
    if (vidjeni.has(kljuc)) { duplikata++; continue; }
    vidjeni.set(kljuc, true);
    if (!s.objavljeno) { bezDatuma++; continue; }        // nedatirano -> izvan tjednog prozora
    stavke.push(s);
  }

  /* KORACI 04-08 */
  const spominjanja = [];
  let odbaceno_rel = 0, nesvrstano = 0, priorom = 0;
  for (const s of stavke) {
    const rel = relevantnost(s.naslov, s.tekst);
    if (rel.v < 0.60) { odbaceno_rel++; continue; }
    if (rel.prior) priorom++;
    const d = new Date(s.objavljeno).getTime();
    const tj = tjedanKljuc(d, kraj);
    if (tj < 0 || tj > 3) continue;                       // zadnja 4 tjedna
    const { kategorije: kats, rezerva } = aspekti(s.naslov, s.tekst);
    if (rezerva) nesvrstano++;
    const sent = sentiment(s.tekst);
    const q = RAZRED_KVALITETE[s.izvor_id] ?? 0.5;
    const f = Math.pow(0.5, ((kraj - d)/864e5) / 21);
    for (const k of kats) {
      spominjanja.push({
        item_url: s.url, izvor_id: s.izvor_id, naslov: s.naslov,
        objavljeno: s.objavljeno, tjedan: tj, kategorija: k,
        polaritet: +sent.polaritet.toFixed(3), pouzdanost_modela: +sent.pouzdanost.toFixed(3),
        mjesovito: sent.mjesovito, ironija: !!sent.ironija, pogodaka: sent.pogodaka,
        relevantnost: +rel.v.toFixed(2), geo_prior: rel.prior, rezervna_kategorija: rezerva,
        tezina: +(sent.pouzdanost * f * q * (1/kats.length) * (rel.prior ? 0.8 : 1)).toFixed(4),
        citat: s.naslov.slice(0, 140)
      });
    }
  }

  /* KORAK 09: agregacija */
  const tekuci = spominjanja.filter(m => m.tjedan === 0);
  const poKategoriji = {};
  for (const k of Object.keys(KATEGORIJE)) poKategoriji[k] = indeks(tekuci.filter(m => m.kategorija === k));

  const povijest = [0,1,2,3].map(tj => {
    const sk = spominjanja.filter(m => m.tjedan === tj);
    return { tjedan: tj, ...indeks(sk) };
  });

  // OSG s renormalizacijom pondera na dostupne kategorije (spec. 4.4)
  let sumaP = 0, sumaV = 0; const koristene = [], izostavljene = [];
  for (const [k,p] of Object.entries(PONDERI_OSG)) {
    if (poKategoriji[k].vrijednost !== null) { sumaP += p; sumaV += p * poKategoriji[k].vrijednost; koristene.push(k); }
    else izostavljene.push(k);
  }
  const OSG = sumaP > 0 ? +(sumaV/sumaP).toFixed(1) : null;

  /* KORAK 10: anomalije */
  const upozorenja = [];
  for (const st of sirovo.statusi.filter(s => s.status === 'nedostupan')) {
    upozorenja.push({ tip:'izvor_nedostupan', ozbiljnost:'srednje', kategorija:'-',
      obrazlozenje:`Izvor "${st.naziv}" nije odgovorio: ${st.greska}. Indeksi su izračunati bez njega.` });
  }
  const prosl = povijest[1]?.vrijednost, tek = povijest[0]?.vrijednost;
  if (prosl !== null && tek !== null && prosl !== undefined && tek !== undefined) {
    const d = tek - prosl;
    if (Math.abs(d) >= 3) upozorenja.push({ tip:'razina', ozbiljnost: Math.abs(d)>=8?'visoko':'srednje', kategorija:'ukupno',
      obrazlozenje:`Ukupni tekstualni sentiment promijenio se za ${d>0?'+':''}${d.toFixed(1)} boda u odnosu na prethodnih 7 dana.` });
  }
  for (const [k,v] of Object.entries(poKategoriji)) {
    if (v.status !== 'nedovoljno' && v.udio_neg >= 0.45)
      upozorenja.push({ tip:'negativnost', ozbiljnost: v.udio_neg>=0.6?'visoko':'srednje', kategorija:k,
        obrazlozenje:`Udio negativnih spominjanja u kategoriji "${KATEGORIJE[k].naziv}" iznosi ${(v.udio_neg*100).toFixed(0)} % (n=${v.n}).` });
  }

  const rezultat = {
    run_id: sirovo.run_id, izradeno: new Date().toISOString(),
    prozor: { kraj: sirovo.dohvaceno, duljina_dana: 7, napomena: 'Pomicni prozor od 7 dana, a ne pon-ned: dohvat pokriva samo naslovnice portala.' },
    konfiguracija: { prior_dosega_izvora: PRIOR_UKLJUCEN },
    statusi: sirovo.statusi,
    obrada: { ulaznih: sirovo.stavke.length, duplikata, bez_datuma: bezDatuma, odbaceno_relevantnost: odbaceno_rel, bez_jasne_teme: nesvrstano, prihvaceno_priorom: priorom,
              u_prozoru: tekuci.length, spominjanja_ukupno: spominjanja.length },
    indeksi: { OSG: { vrijednost: OSG, koristene_kategorije: koristene, izostavljene_kategorije: izostavljene },
               TSI: { vrijednost: null, razlog: 'Nema recenzijskih izvora u iteraciji 1 \u2014 turistički sloj se ne može izračunati.' },
               po_kategoriji: poKategoriji },
    povijest, upozorenja, spominjanja,
    pageviews: sirovo.pageviews
  };
  await fs.writeFile(path.join(dir, 'analysis-latest.json'), JSON.stringify(rezultat, null, 1));
  log(`Analiza: ${spominjanja.length} spominjanja, OSG=${OSG}, upozorenja=${upozorenja.length}`);
  return rezultat;
}

if (import.meta.url === `file://${process.argv[1]}`) analiziraj();

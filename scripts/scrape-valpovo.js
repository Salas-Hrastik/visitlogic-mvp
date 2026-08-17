/**
 * scrape-valpovo.js
 * Periodički skraper za tz.valpovo.hr i valpovo.hr
 * Pokreće se dnevno via GitHub Actions.
 * Output: api/_scraped_content.js
 *
 * Što se skrapa:
 *   - Novosti s tz.valpovo.hr/novosti/
 *   - Vijesti s valpovo.hr (RSS feed grada)
 *   - Godišnje manifestacije s tz.valpovo.hr/manifestacije/
 *   - DOGAĐANJA S DATUMIMA (novo):
 *       • valpovo.hr — Modern Events Calendar (/wp-json/wp/v2/mec-events + stranica događaja)
 *       • tz.valpovo.hr — objave (/wp-json/wp/v2/posts) iz kojih se datum izvlači iz teksta
 *     Rezultat je jedinstvena lista `dogadanja` s ISO datumima (datum_od / datum_do).
 *
 * VAŽNO: prošlo / u tijeku / buduće NE određuje se ovdje, nego u api/chat.js u trenutku
 * upita — datoteka se osvježava periodički pa bi statusi zapisani u njoj brzo zastarjeli.
 *
 * Strategija dohvata (fallback lanac):
 *   1. Node fetch s browser User-Agent
 *   2. Playwright Chromium headless (zaobilazi bot detekciju)
 */

import { writeFileSync, readFileSync } from 'fs';
import { load } from 'cheerio';

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'hr,en-US;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Upgrade-Insecure-Requests': '1',
};

// Koliko unatrag/unaprijed zadržavamo događanja u izlaznoj datoteci
const MAX_PROSLIH_DOGADANJA = 25;
const MEC_EVENTS_LIMIT = 50;   // koliko zadnjih događaja s valpovo.hr dohvaćamo
const TZ_POSTS_LIMIT = 25;     // koliko zadnjih objava s tz.valpovo.hr analiziramo

// ─── Playwright helper (lazy-loaded) ────────────────────────────────────────

let _browser = null;

async function getPlaywrightBrowser() {
  if (_browser) return _browser;
  try {
    const { chromium } = await import('playwright');
    _browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    return _browser;
  } catch {
    return null;
  }
}

async function fetchWithPlaywright(url) {
  const browser = await getPlaywrightBrowser();
  if (!browser) return null;

  const context = await browser.newContext({
    userAgent: FETCH_HEADERS['User-Agent'],
    locale: 'hr-HR',
    extraHTTPHeaders: { 'Accept-Language': 'hr,en-US;q=0.9,en;q=0.8' },
  });
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);
    const html = await page.content();
    return html;
  } catch (e) {
    console.warn(`⚠️  Playwright nije mogao dohvatiti ${url}: ${e.message}`);
    return null;
  } finally {
    await context.close();
  }
}

async function fetchHtml(url) {
  // Pokušaj 1: Node fetch
  try {
    const res = await fetch(url, {
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (e) {
    console.warn(`⚠️  fetch nije uspio za ${url}: ${e.message} — pokušavam Playwright...`);
  }

  // Pokušaj 2: Playwright Chromium headless
  return await fetchWithPlaywright(url);
}

async function fetchJson(url) {
  try {
    const res = await fetch(url, {
      headers: { ...FETCH_HEADERS, Accept: 'application/json' },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`⚠️  JSON dohvat nije uspio za ${url}: ${e.message}`);
    return null;
  }
}

// Ograničeni paralelizam — da ne zatrpamo web stranice grada
async function pool(items, size, fn) {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(size, queue.length) }, async () => {
    while (queue.length) {
      const item = queue.shift();
      try {
        await fn(item);
      } catch (e) {
        console.warn(`⚠️  obrada stavke nije uspjela: ${e.message}`);
      }
    }
  });
  await Promise.all(workers);
}

// ─── Tekstualni helperi ─────────────────────────────────────────────────────

const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  hellip: '…', ndash: '–', mdash: '—', minus: '−',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', bdquo: '„',
  laquo: '«', raquo: '»', sbquo: '‚', bull: '•', middot: '·',
  deg: '°', eacute: 'é', scaron: 'š', Scaron: 'Š', euro: '€',
};

function decodeEntities(str) {
  if (!str) return '';
  return String(str)
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, name) => NAMED_ENTITIES[name] ?? NAMED_ENTITIES[name.toLowerCase()] ?? m);
}

function stripTags(html) {
  if (!html) return '';
  return String(html)
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
}

function clean(html, max = 0) {
  const txt = decodeEntities(stripTags(html)).replace(/\s+/g, ' ').trim();
  return max > 0 ? txt.substring(0, max) : txt;
}

function normalizeTitle(s) {
  return decodeEntities(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// ─── Hrvatski datumi ────────────────────────────────────────────────────────

// Puni oblici (genitiv + nominativ) — koriste se za parsiranje slobodnog teksta
const MJESEC_PUNI = {
  siječnja: 1, sijecnja: 1, siječanj: 1, sijecanj: 1,
  veljače: 2, veljace: 2, veljača: 2, veljaca: 2,
  ožujka: 3, ozujka: 3, ožujak: 3, ozujak: 3,
  travnja: 4, travanj: 4,
  svibnja: 5, svibanj: 5,
  lipnja: 6, lipanj: 6,
  srpnja: 7, srpanj: 7,
  kolovoza: 8, kolovoz: 8,
  rujna: 9, rujan: 9,
  listopada: 10, listopad: 10,
  studenoga: 11, studenog: 11, studeni: 11,
  prosinca: 12, prosinac: 12,
};

// Kratice (npr. "kol 14, 2026" u listingu TZ novosti)
const MJESEC_KRATICE = {
  sij: 1, velj: 2, ožu: 3, ozu: 3, tra: 4, svi: 5, lip: 6,
  srp: 7, kol: 8, ruj: 9, lis: 10, stu: 11, pro: 12,
};

const MJ_RE_SRC = Object.keys(MJESEC_PUNI)
  .sort((a, b) => b.length - a.length)
  .join('|');

// Datum iz listinga TZ novosti: "kol 14, 2026" → "2026-08-14"
function parseKraticaDatum(txt) {
  if (!txt) return '';
  const m = String(txt).toLowerCase().trim()
    .match(/^([a-zžčćšđ]{3,4})\s+(\d{1,2}),?\s*(\d{4})$/);
  if (!m) return '';
  const mj = MJESEC_KRATICE[m[1]] ?? MJESEC_KRATICE[m[1].substring(0, 3)];
  return mj ? (isoDate(+m[3], mj, +m[2]) || '') : '';
}

function isoDate(y, m, d) {
  if (!y || !m || !d) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return dt.toISOString().substring(0, 10);
}

function danaIzmedu(isoA, isoB) {
  return (Date.parse(`${isoB}T00:00:00Z`) - Date.parse(`${isoA}T00:00:00Z`)) / 86400000;
}

/**
 * Parsira MEC oznaku datuma s valpovo.hr:
 *   "29. 08. 2026."            → jednodnevni događaj
 *   "03. - 05. 07. 2026."      → raspon unutar istog mjeseca
 *   "28. 12. - 03. 01. 2027."  → raspon preko granice mjeseca/godine
 */
function parseMecLabel(label) {
  if (!label) return null;
  const s = decodeEntities(label).replace(/\s+/g, ' ').trim();

  let m = s.match(/^(\d{1,2})\.\s*(\d{1,2})\.\s*[-–—]\s*(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/);
  if (m) {
    const [d1, m1, d2, m2, god] = [+m[1], +m[2], +m[3], +m[4], +m[5]];
    const god1 = m1 > m2 ? god - 1 : god;
    const od = isoDate(god1, m1, d1);
    const doDat = isoDate(god, m2, d2);
    return od ? { od, do: doDat || od, tekst: s } : null;
  }

  m = s.match(/^(\d{1,2})\.\s*[-–—]\s*(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/);
  if (m) {
    const od = isoDate(+m[4], +m[3], +m[1]);
    const doDat = isoDate(+m[4], +m[3], +m[2]);
    return od ? { od, do: doDat || od, tekst: s } : null;
  }

  m = s.match(/^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/);
  if (m) {
    const od = isoDate(+m[3], +m[2], +m[1]);
    return od ? { od, do: od, tekst: s } : null;
  }

  return null;
}

/**
 * Izvlači datum događanja iz slobodnog teksta objave.
 * refIso = datum objave (ISO) — služi za pogađanje godine i za odbacivanje
 * datuma koji su predaleko od objave (npr. povijesni podaci "od 1968. godine").
 *
 * Prepoznaje: "od 3. do 5. srpnja 2026.", "24. i 25. srpnja", "29. kolovoza 2026.",
 *             "18. srpnja", "29.08.2026."
 */
function parseDatesFromText(text, refIso) {
  if (!text) return null;
  const t = decodeEntities(text).replace(/\s+/g, ' ');
  const refGod = refIso ? +refIso.substring(0, 4) : new Date().getUTCFullYear();
  const kandidati = [];

  const odaberiGodinu = (raw, mjesec, dan) => {
    if (raw) return +raw;
    if (!refIso) return refGod;
    let najbolja = refGod;
    let najmanjaRazlika = Infinity;
    for (const g of [refGod, refGod + 1, refGod - 1]) {
      const kandidat = isoDate(g, mjesec, dan);
      if (!kandidat) continue;
      const razlika = Math.abs(danaIzmedu(refIso, kandidat));
      if (razlika < najmanjaRazlika) {
        najmanjaRazlika = razlika;
        najbolja = g;
      }
    }
    return najbolja;
  };

  const dodaj = (idx, od, doDat, tekst) => {
    if (od) kandidati.push({ idx, od, do: doDat || od, raspon: !!(doDat && doDat !== od), tekst });
  };

  // 1) "od 3. (srpnja) do 5. srpnja 2026."
  for (const m of t.matchAll(new RegExp(`od\\s+(\\d{1,2})\\.\\s*(?:(${MJ_RE_SRC})\\s*)?do\\s+(\\d{1,2})\\.\\s*(${MJ_RE_SRC})\\s*(\\d{4})?`, 'gi'))) {
    const mj2 = MJESEC_PUNI[m[4].toLowerCase()];
    const mj1 = m[2] ? MJESEC_PUNI[m[2].toLowerCase()] : mj2;
    const g1 = odaberiGodinu(m[5], mj1, +m[1]);
    const g2 = mj2 < mj1 ? g1 + 1 : g1;
    dodaj(m.index, isoDate(g1, mj1, +m[1]), isoDate(g2, mj2, +m[3]), m[0]);
  }

  // 2) "24. i 25. srpnja 2026." / "3. – 5. srpnja"
  for (const m of t.matchAll(new RegExp(`(\\d{1,2})\\.\\s*(?:i|te|[-–—])\\s*(\\d{1,2})\\.\\s*(${MJ_RE_SRC})\\s*(\\d{4})?`, 'gi'))) {
    const mj = MJESEC_PUNI[m[3].toLowerCase()];
    const g = odaberiGodinu(m[4], mj, +m[1]);
    dodaj(m.index, isoDate(g, mj, +m[1]), isoDate(g, mj, +m[2]), m[0]);
  }

  // 3) "29. kolovoza 2026." / "18. srpnja"
  for (const m of t.matchAll(new RegExp(`(\\d{1,2})\\.\\s*(${MJ_RE_SRC})\\s*(\\d{4})?`, 'gi'))) {
    const mj = MJESEC_PUNI[m[2].toLowerCase()];
    const g = odaberiGodinu(m[3], mj, +m[1]);
    dodaj(m.index, isoDate(g, mj, +m[1]), null, m[0]);
  }

  // 4) "29. 08. 2026." / "29.08.2026."
  for (const m of t.matchAll(/(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/g)) {
    dodaj(m.index, isoDate(+m[3], +m[2], +m[1]), null, m[0]);
  }

  if (!kandidati.length) return null;

  // Odbaci datume predaleko od objave (povijesne godine, najave za "dogodine")
  const prihvatljivi = refIso
    ? kandidati.filter(k => {
        const razmak = danaIzmedu(refIso, k.od);
        return razmak >= -100 && razmak <= 400;
      })
    : kandidati;

  const izbor = (prihvatljivi.length ? prihvatljivi : []).sort((a, b) =>
    a.idx - b.idx || Number(b.raspon) - Number(a.raspon)
  )[0];

  return izbor ? { od: izbor.od, do: izbor.do, tekst: izbor.tekst.trim() } : null;
}

// ─── Novosti s tz.valpovo.hr ────────────────────────────────────────────────

async function scrapeNovostiTZ() {
  const html = await fetchHtml('https://tz.valpovo.hr/novosti/');
  if (!html) return [];

  const $ = load(html);
  const items = [];
  const seen = new Set();

  $('article.side-post').each((_, el) => {
    const titleEl = $(el).find('.post-title h3 a, .post-title a').first();
    const title = clean(titleEl.text());
    const link = titleEl.attr('href') || '';
    const date = clean($(el).find('.post-date a, .post-date').first().text());
    const excerpt = clean($(el).find('.post-body').first().text(), 280);
    const imgEl = $(el).find('img.thumb-placeholder, .side-post-image img').first();
    const imgUrl = imgEl.attr('src') || imgEl.attr('data-src') || '';

    if (title && title.length > 3 && !seen.has(title)) {
      seen.add(title);
      items.push({
        naslov: title.substring(0, 120),
        datum: date.substring(0, 20),
        datum_iso: parseKraticaDatum(date),
        kratki_opis: excerpt,
        link: link.startsWith('http') ? link : `https://tz.valpovo.hr${link}`,
        IMAGE_URL: imgUrl,
      });
    }
  });

  console.log(`✅ TZ novosti: ${items.length} stavki`);
  return items.slice(0, 10);
}

// ─── Novosti s valpovo.hr (RSS feed) ────────────────────────────────────────

async function scrapeNovostiGrad() {
  const xml = await fetchHtml('https://valpovo.hr/feed/');
  if (!xml) return [];

  const items = [];
  const entries = xml.split('<item>').slice(1);

  for (const entry of entries.slice(0, 8)) {
    const title = decodeEntities((entry.match(/<title><!\[CDATA\[([^\]]+)\]\]><\/title>/) ||
                   entry.match(/<title>([^<]+)<\/title>/))?.[1]?.trim() || '');
    const link  = entry.match(/<link>([^<]+)<\/link>/)?.[1]?.trim() || '';
    const date  = entry.match(/<pubDate>([^<]+)<\/pubDate>/)?.[1]?.trim() || '';
    const desc  = clean((entry.match(/<description><!\[CDATA\[([^\]]+)\]\]><\/description>/) ||
                   entry.match(/<description>([^<]+)<\/description>/))?.[1] || '', 200);

    const skip = /natječaj|javna nabava|zakon|odluka o.*zakup|oglas|pravilnik|javni poziv/i.test(title);
    const dateParsed = new Date(date);
    const dateFormatted = isNaN(dateParsed) ? date.substring(0, 16) :
      dateParsed.toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (title && !skip) {
      items.push({
        naslov: title.substring(0, 120),
        datum: dateFormatted,
        kratki_opis: desc,
        link,
      });
    }
  }

  console.log(`✅ Grad novosti: ${items.length} stavki`);
  return items;
}

// ─── Godišnje manifestacije (tz.valpovo.hr/manifestacije/) ──────────────────

async function scrapeManifestacije() {
  const html = await fetchHtml('https://tz.valpovo.hr/manifestacije/');
  if (!html) return [];

  const $ = load(html);
  const links = [];

  $('article.card-post').each((_, el) => {
    const titleEl = $(el).find('.post-body h3 a, h3 a, h2 a').first();
    const title = clean(titleEl.text());
    const link = titleEl.attr('href') || $(el).find('a').first().attr('href') || '';
    const imgEl = $(el).find('img').first();
    const imgUrl = imgEl.attr('src') || imgEl.attr('data-src') || '';
    if (title && link) links.push({ naziv: title, link, imgUrl });
  });

  const items = [];
  for (const { naziv, link, imgUrl } of links.slice(0, 13)) {
    const pageHtml = await fetchHtml(link);
    if (!pageHtml) {
      items.push({ naziv: naziv.substring(0, 100), datum: '', opis: '', link });
      continue;
    }
    const $p = load(pageHtml);
    const datum = clean($p('.post-date a, .post-date, time').first().text(), 40);
    const opis = clean($p('.entry-content p, .post-content p, article p').first().text(), 250);
    items.push({
      naziv: naziv.substring(0, 100),
      datum,
      opis,
      link,
      IMAGE_URL: imgUrl,
    });
  }

  console.log(`✅ Manifestacije: ${items.length} stavki`);
  return items;
}

// ─── Događanja s datumima — valpovo.hr (Modern Events Calendar) ─────────────

async function scrapeDogadanjaGrad() {
  const posts = await fetchJson(
    `https://valpovo.hr/wp-json/wp/v2/mec-events?per_page=${MEC_EVENTS_LIMIT}` +
    `&orderby=date&order=desc&_fields=id,date,link,title,excerpt`
  );

  if (!Array.isArray(posts) || !posts.length) {
    console.warn('⚠️  valpovo.hr: MEC događanja nisu dohvaćena');
    return [];
  }

  const items = [];

  await pool(posts, 5, async (p) => {
    const naziv = clean(p.title?.rendered, 140);
    if (!naziv) return;

    const objavljeno = (p.date || '').substring(0, 10);
    const opis = clean(p.excerpt?.rendered, 260).replace(/\s*\[…\]\s*$/, '…');

    let datum = null;
    let vrijeme = '';
    let img = '';

    const html = await fetchHtml(p.link);
    if (html) {
      const $ = load(html);
      datum = parseMecLabel($('.mec-start-date-label').first().text());
      const kraj = parseMecLabel($('.mec-end-date-label').first().text());
      if (datum && kraj?.od && kraj.od > datum.od) datum.do = kraj.od;
      vrijeme = clean($('.mec-single-event-time abbr').first().text(), 40);
      img = $('meta[property="og:image"]').attr('content')
        || $('img.wp-post-image').first().attr('src') || '';
    }

    // Rezerva: ako stranica nije dostupna ili nema MEC oznaku — datum iz teksta
    if (!datum?.od) datum = parseDatesFromText(`${naziv}. ${opis}`, objavljeno);
    if (!datum?.od) {
      console.warn(`⚠️  bez datuma (preskačem): ${naziv.substring(0, 60)}`);
      return;
    }

    items.push({
      naziv,
      datum_od: datum.od,
      datum_do: datum.do || datum.od,
      datum_tekst: datum.tekst || '',
      vrijeme,
      opis,
      link: p.link,
      izvor: 'valpovo.hr',
      IMAGE_URL: img,
    });
  });

  console.log(`✅ Događanja (valpovo.hr): ${items.length} s datumom / ${posts.length} pregledano`);
  return items;
}

// ─── Događanja s datumima — tz.valpovo.hr (objave) ──────────────────────────

async function scrapeDogadanjaTZ() {
  const posts = await fetchJson(
    `https://tz.valpovo.hr/wp-json/wp/v2/posts?per_page=${TZ_POSTS_LIMIT}&_embed=wp:featuredmedia`
  );

  if (!Array.isArray(posts) || !posts.length) {
    console.warn('⚠️  tz.valpovo.hr: objave nisu dohvaćene');
    return [];
  }

  const items = [];

  for (const p of posts) {
    const naziv = clean(p.title?.rendered, 140);
    if (!naziv) continue;

    const objavljeno = (p.date || '').substring(0, 10);
    const tijelo = clean(p.content?.rendered, 4000);
    const opis = clean(p.excerpt?.rendered, 260).replace(/\s*\[…\]\s*$/, '…');

    const datum = parseDatesFromText(`${naziv}. ${tijelo}`, objavljeno);
    if (!datum?.od) continue;

    const media = p._embedded?.['wp:featuredmedia']?.[0];

    items.push({
      naziv,
      datum_od: datum.od,
      datum_do: datum.do || datum.od,
      datum_tekst: datum.tekst || '',
      vrijeme: '',
      opis,
      link: p.link,
      izvor: 'tz.valpovo.hr',
      IMAGE_URL: media?.source_url || '',
    });
  }

  console.log(`✅ Događanja (tz.valpovo.hr): ${items.length} s datumom / ${posts.length} objava`);
  return items;
}

// ─── Spajanje i čišćenje liste događanja ────────────────────────────────────

function mergeDogadanja(...liste) {
  const svi = liste.flat().filter(e => e?.datum_od);
  const poKljucu = new Map();

  // valpovo.hr (MEC) ima strukturirani datum → ima prednost nad TZ objavom
  const prioritet = e => (e.izvor === 'valpovo.hr' ? 2 : 1);

  for (const e of svi) {
    const kljuc = normalizeTitle(e.naziv).substring(0, 45) || `${e.izvor}:${e.datum_od}`;
    const postojeci = poKljucu.get(kljuc);
    if (!postojeci) {
      poKljucu.set(kljuc, e);
      continue;
    }
    if (prioritet(e) > prioritet(postojeci)) {
      // zadrži sliku i alternativni link iz zamijenjene stavke
      poKljucu.set(kljuc, {
        ...e,
        IMAGE_URL: e.IMAGE_URL || postojeci.IMAGE_URL,
        link_alt: postojeci.link,
      });
    } else if (!postojeci.link_alt && postojeci.link !== e.link) {
      postojeci.link_alt = e.link;
      postojeci.IMAGE_URL = postojeci.IMAGE_URL || e.IMAGE_URL;
    }
  }

  const danas = new Date().toISOString().substring(0, 10);
  const sortirano = [...poKljucu.values()].sort((a, b) => a.datum_od.localeCompare(b.datum_od));

  const prosla = sortirano.filter(e => (e.datum_do || e.datum_od) < danas);
  const ostalo = sortirano.filter(e => (e.datum_do || e.datum_od) >= danas);

  // Zadrži samo zadnjih N prošlih događanja (najnovija prošla su relevantna)
  return [...prosla.slice(-MAX_PROSLIH_DOGADANJA), ...ostalo];
}

// ─── Zapis rezultata ─────────────────────────────────────────────────────────

// Usporedi novi sadržaj sa zapisanim, ignorirajući vremensku oznaku ažuriranja
function hasChanged(newData) {
  try {
    const existing = readFileSync('api/_scraped_content.js', 'utf8');
    const json = existing.match(/export const scrapedContent = ([\s\S]+);\s*$/)?.[1];
    if (!json) return true;
    const staro = JSON.parse(json);
    const bezTimestampa = (d) => {
      const kopija = JSON.parse(JSON.stringify(d));
      delete kopija?.meta?.zadnje_azuriranje;
      return JSON.stringify(kopija);
    };
    return bezTimestampa(staro) !== bezTimestampa(newData);
  } catch {
    return true;
  }
}

function writeOutput(data) {
  const ts = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const output = `// AUTO-GENERATED — ne editiraj ručno!
// Zadnje skrapanje: ${ts} UTC
// Izvor: tz.valpovo.hr, valpovo.hr
// GitHub Actions job: scrape-valpovo (dnevno u 6:00 UTC)
//
// dogadanja[] sadrži prošla, tekuća i buduća događanja s ISO datumima
// (datum_od / datum_do). Status (prošlo / u tijeku / nadolazeće) računa
// api/chat.js u trenutku upita — NE zapisuje se ovdje.

export const scrapedContent = ${JSON.stringify(data, null, 2)};
`;
  writeFileSync('api/_scraped_content.js', output, 'utf8');
  console.log('✅ Zapisano: api/_scraped_content.js');
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔍 Pokrećem scraping...\n');

  const [novostiTZ, novostiGrad, manifestacije, dogadanjaGrad, dogadanjaTZ] = await Promise.all([
    scrapeNovostiTZ(),
    scrapeNovostiGrad(),
    scrapeManifestacije(),
    scrapeDogadanjaGrad(),
    scrapeDogadanjaTZ(),
  ]);

  if (_browser) await _browser.close();

  const dogadanja = mergeDogadanja(dogadanjaGrad, dogadanjaTZ);
  const danas = new Date().toISOString().substring(0, 10);

  const data = {
    meta: {
      zadnje_azuriranje: new Date().toISOString(),
      izvori: ['https://tz.valpovo.hr', 'https://valpovo.hr'],
      broj_dogadanja: dogadanja.length,
    },
    novosti_tz: novostiTZ,
    novosti_grad: novostiGrad,
    manifestacije_aktualne: manifestacije,
    dogadanja,
  };

  const total = novostiTZ.length + novostiGrad.length + manifestacije.length + dogadanja.length;

  if (total === 0) {
    console.warn('⚠️  Nije dohvaćen nikakav sadržaj. Provjeri dostupnost web stranica.');
    process.exit(0);
  }

  const prosla = dogadanja.filter(e => (e.datum_do || e.datum_od) < danas).length;
  const uTijeku = dogadanja.filter(e => e.datum_od <= danas && (e.datum_do || e.datum_od) >= danas).length;
  const buduca = dogadanja.filter(e => e.datum_od > danas).length;
  console.log(`\n📅 Događanja — prošla: ${prosla}, u tijeku: ${uTijeku}, buduća: ${buduca}`);

  if (!hasChanged(data)) {
    console.log('ℹ️  Sadržaj je nepromijenjen — datoteka se ne prepisuje.');
    return;
  }

  writeOutput(data);
  console.log(`\n✅ Ukupno: ${total} stavki skrapano i zapisano.`);
}

main().catch(err => {
  console.error('❌ Scraping neuspješan:', err);
  process.exit(1);
});

// valpovstina.info — NESLUŽBENI regionalni portal, SEKUNDARNI izvor.
// Dohvaća se u trenutku pitanja (WP API), uz pamćenje CACHE_MS po instanci, jer se
// najave (prekidi struje, događanja) mijenjaju tijekom dana. Ako dohvat ne uspije,
// koristi se zadnji dnevni scrape (scrapedContent.valpovstina).
// Samo AKTUALNE objave: zadnjih 30 dana, bez crne kronike, o Valpovu ili naseljima,
// s datumom od danas do +90 dana.

const API = 'https://valpovstina.info/wp-json/wp/v2/posts';
const CRNA_KRONIKA = 57;
const CACHE_MS = 30 * 60 * 1000;
const TIMEOUT_MS = 4000;
const VALPOVO_RE = /valpov|ladimirev|\bnard|\bšag\b|\bsag\b|harkanov|ivanovc|zelčin|zelcin|marjanč|marjanc/i;
const MJESECI = { siječ: 1, sijec: 1, veljač: 2, veljac: 2, ožuj: 3, ozuj: 3, trav: 4, svib: 5, lip: 6,
  srp: 7, kolov: 8, ruj: 9, listop: 10, studen: 11, prosin: 12 };

let cache = { at: 0, items: null };

const iso = (g, m, d) => (m >= 1 && m <= 12 && d >= 1 && d <= 31)
  ? `${g}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` : null;

function tekstIzHtml(html) {
  return String(html || '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|li|h\d)>/gi, ' . ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/(\s\.)+/g, '.')
    .trim();
}

function datumi(tekst, objavljeno) {
  const g0 = +objavljeno.slice(0, 4), m0 = +objavljeno.slice(5, 7);
  const god = (raw, m) => (raw ? +raw : m < m0 - 2 ? g0 + 1 : g0);
  const out = new Set();
  for (const m of tekst.matchAll(/\b(\d{1,2})\.\s?(\d{1,2})\.\s?(\d{4})?/g)) {
    const d = iso(god(m[3], +m[2]), +m[2], +m[1]);
    if (d) out.add(d);
  }
  for (const m of tekst.matchAll(/\b(\d{1,2})\.\s*([a-zčćšžđ]+)(?:\s+(\d{4}))?/gi)) {
    const k = Object.keys(MJESECI).find(x => m[2].toLowerCase().startsWith(x));
    if (!k) continue;
    const d = iso(god(m[3], MJESECI[k]), MJESECI[k], +m[1]);
    if (d) out.add(d);
  }
  return [...out];
}

async function dohvati() {
  const danas = new Date().toISOString().slice(0, 10);
  const horizont = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
  const after = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 19);
  const url = (page) => `${API}?per_page=100&page=${page}&after=${after}&categories_exclude=${CRNA_KRONIKA}` +
    '&_fields=date,link,title,content,categories';
  const res = await fetch(url(1), { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`valpovstina.info ${res.status}`);
  const posts = await res.json();
  // Ostale stranice (30 dana ≈ 150–200 objava) usporedno
  const ukupno = Math.min(+(res.headers.get('x-wp-totalpages') || '1'), 3);
  const ostale = await Promise.all(
    Array.from({ length: ukupno - 1 }, (_, i) =>
      fetch(url(i + 2), { signal: AbortSignal.timeout(TIMEOUT_MS) })
        .then(r => (r.ok ? r.json() : []))
        .catch(() => [])),
  );
  for (const b of ostale) if (Array.isArray(b)) posts.push(...b);
  const items = [];
  for (const p of Array.isArray(posts) ? posts : []) {
    if (p.categories?.includes(CRNA_KRONIKA)) continue;
    const naslov = tekstIzHtml(p.title?.rendered).slice(0, 160);
    const tekst = tekstIzHtml(p.content?.rendered).slice(0, 2500);
    if (!naslov || tekst.length < 80 || !VALPOVO_RE.test(`${naslov} ${tekst}`)) continue;
    const objavljeno = (p.date || '').slice(0, 10);
    const buduci = datumi(`${naslov} ${tekst}`, objavljeno).filter(d => d >= danas && d <= horizont).sort();
    if (!buduci.length) continue;
    items.push({ naslov, objavljeno, vrijedi_do: buduci[buduci.length - 1], link: p.link, tekst });
  }
  return items;
}

/** Aktualne objave: svježe (≤ 30 min) ili, ako dohvat ne uspije, rezervne iz dnevnog scrapea. */
export async function getValpovstina(rezerva = []) {
  if (cache.items && Date.now() - cache.at < CACHE_MS) return cache.items;
  try {
    const items = await dohvati();
    cache = { at: Date.now(), items };
    return items;
  } catch (e) {
    console.warn('[valpovstina] dohvat nije uspio, koristim dnevni scrape:', e?.message || e);
    // Kratko pamćenje i rezerve, da se neuspjeli dohvat ne ponavlja pri svakom pitanju
    cache = { at: Date.now() - CACHE_MS + 5 * 60 * 1000, items: rezerva };
    return rezerva;
  }
}

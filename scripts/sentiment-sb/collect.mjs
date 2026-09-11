/**
 * KORAK 01-02: prikupljanje i normalizacija.
 *
 * Nacela (spec. 5.1): izvor koji padne NE rusi izvodjenje - biljezi se kao
 * "izvor nedostupan" i zavrsava u upozorenjima. Svaki dohvat je pristojan:
 * vlastiti User-Agent s kontaktom, razmak izmedju zahtjeva, bez zaobilazenja
 * ikakve zastite.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const UA = 'VisitLogic-SentimentRadar/0.1 (tjedna analiza sentimenta za TZ Slavonski Brod; kontakt: druzic@bak.hr)';
const ROOT = path.resolve(import.meta.dirname, '../..');

const spava = ms => new Promise(r => setTimeout(r, ms));

async function dohvati(url, { timeout = 25000, pokusaji = 2 } = {}) {
  let zadnja;
  for (let i = 0; i <= pokusaji; i++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), timeout);
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, 'Accept-Language': 'hr,en;q=0.8' },
        signal: ctrl.signal, redirect: 'follow'
      });
      clearTimeout(t);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      zadnja = e;
      if (i < pokusaji) await spava(1500 * Math.pow(2, i));
    }
  }
  throw zadnja;
}

// --- izvlacenje metapodataka iz HTML-a clanka ---
const meta = (h, kljuc) => {
  const re = new RegExp(`<meta[^>]*(?:property|name)=["']${kljuc}["'][^>]*content=["']([^"']*)["']`, 'i');
  const re2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${kljuc}["']`, 'i');
  return (h.match(re) || h.match(re2) || [])[1] || null;
};
const jsonLdPolje = (h, kljuc) => (h.match(new RegExp(`"${kljuc}"\\s*:\\s*"([^"]{3,400})"`)) || [])[1] || null;

const dekodiraj = s => (s || '')
  .replace(/&quot;/g,'"').replace(/&#0?39;/g,"'").replace(/&apos;/g,"'")
  .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
  .replace(/&nbsp;/g,' ').replace(/&hellip;/g,'…')
  .replace(/&#(\d+);/g, (_,n)=>String.fromCharCode(+n));

/** Tekst iz odlomaka - rezerva kad og:description nije clanak nego opis portala. */
function tekstIzOdlomaka(html, maxZnak = 1500) {
  const bez = html
    .replace(/<script[\s\S]*?<\/script>/gi,' ')
    .replace(/<style[\s\S]*?<\/style>/gi,' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi,' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi,' ');
  const odlomci = [...bez.matchAll(/<p[^>]*>([\s\S]{40,1200}?)<\/p>/gi)]
    .map(m => dekodiraj(m[1].replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim())
    .filter(t => t.length > 40 && !/cookie|kolaci|pretplat|copyright|sva prava/i.test(t));
  return odlomci.join(' ').slice(0, maxZnak);
}

function apsolutni(href, baza) {
  try { return new URL(href, baza).href.replace(/#.*$/,'').replace(/\?.*$/,''); }
  catch { return null; }
}

/** Skuplja poveznice na clanke s listing stranice. */
function poveznice(html, izvor) {
  const re = new RegExp(izvor.selektori.link);
  const svi = [...html.matchAll(/href=["']([^"']{5,200})["']/gi)].map(m => m[1]);
  const baza = new URL(izvor.url);
  const out = new Set();
  for (const h of svi) {
    const apso = apsolutni(dekodiraj(h), izvor.url);
    if (!apso) continue;
    const u = new URL(apso);
    if (u.hostname.replace(/^www\./,'') !== baza.hostname.replace(/^www\./,'')) continue;
    if (re.test(u.pathname)) out.add(apso);
  }
  return [...out];
}

async function skupiPortal(izvor, log) {
  const stavke = [];
  const listing = await dohvati(izvor.url);
  const linkovi = poveznice(listing, izvor).slice(0, izvor.ogranicenje.max_clanaka);
  log(`  ${izvor.id}: ${linkovi.length} poveznica s naslovnice`);
  for (const url of linkovi) {
    await spava(izvor.ogranicenje.razmak_ms);
    try {
      const h = await dohvati(url, { pokusaji: 1 });
      const naslov = dekodiraj(meta(h, 'og:title') || jsonLdPolje(h, 'headline') || (h.match(/<title>([^<]+)<\/title>/i)||[])[1] || '');
      const datum = jsonLdPolje(h, 'datePublished') || meta(h, 'article:published_time') || meta(h, 'datePublished');
      let opis = dekodiraj(meta(h, 'og:description') || '');
      // og:description koji je opis portala, a ne clanka -> uzmi odlomke
      if (!opis || opis.length < 80 || /news portal|portal sa dogadjanjima|portal s vijestima/i.test(opis)) {
        opis = tekstIzOdlomaka(h);
      }
      if (!naslov) continue;
      stavke.push({
        izvor_id: izvor.id, url, naslov,
        tekst: opis ? `${naslov}. ${opis}` : naslov,
        objavljeno: datum || null,
        rubrika: new URL(url).pathname.split('/').filter(Boolean)[0] || null
      });
    } catch (e) {
      log(`    ! ${url} -> ${e.message}`);
    }
  }
  return stavke;
}

async function skupiWikimedia(izvor, log, od, do_) {
  const nizovi = [];
  for (const c of izvor.clanci) {
    await spava(izvor.ogranicenje.razmak_ms);
    const url = `${izvor.url}/${c.wiki}/all-access/user/${encodeURIComponent(c.naslov)}/daily/${od}/${do_}`;
    const json = JSON.parse(await dohvati(url));
    nizovi.push({ wiki: c.wiki, naslov: c.naslov, dani: (json.items||[]).map(i => ({ dan: i.timestamp.slice(0,8), pregledi: i.views })) });
    log(`  wikimedia ${c.wiki}: ${(json.items||[]).length} dana`);
  }
  return nizovi;
}

async function skupiGdelt(izvor, log) {
  const url = `${izvor.url}?query=${encodeURIComponent(izvor.upit)}&mode=artlist&maxrecords=75&format=json&timespan=14d`;
  const tekst = await dohvati(url, { pokusaji: 1 });
  let json;
  try { json = JSON.parse(tekst); }
  catch { throw new Error(`odgovor nije JSON (vjerojatno ogranicenje brzine): ${tekst.slice(0,80)}`); }
  const arts = json.articles || [];
  log(`  gdelt: ${arts.length} clanaka`);
  return arts.map(a => ({
    izvor_id: 'gdelt', url: a.url, naslov: a.title || '',
    tekst: a.title || '',
    objavljeno: a.seendate ? `${a.seendate.slice(0,4)}-${a.seendate.slice(4,6)}-${a.seendate.slice(6,8)}T00:00:00Z` : null,
    rubrika: a.domain || null
  }));
}

export async function prikupi({ log = console.log } = {}) {
  const reg = JSON.parse(await fs.readFile(path.join(import.meta.dirname, 'sources.json'), 'utf8'));
  const run_id = new Date().toISOString().replace(/[:.]/g,'-');
  const danas = new Date();
  const od = new Date(danas.getTime() - 60*864e5).toISOString().slice(0,10).replace(/-/g,'');
  const do_ = danas.toISOString().slice(0,10).replace(/-/g,'');

  const stavke = [], pageviews = [], statusi = [];
  for (const izvor of reg.izvori.filter(i => i.aktivan)) {
    const t0 = Date.now();
    try {
      if (izvor.tip === 'html_listing') {
        const s = await skupiPortal(izvor, log);
        stavke.push(...s);
        statusi.push({ izvor_id: izvor.id, naziv: izvor.naziv, status: 'ok', broj: s.length, ms: Date.now()-t0 });
      } else if (izvor.id === 'wikimedia_pageviews') {
        pageviews.push(...await skupiWikimedia(izvor, log, od, do_));
        statusi.push({ izvor_id: izvor.id, naziv: izvor.naziv, status: 'ok', broj: pageviews.length, ms: Date.now()-t0 });
      } else if (izvor.id === 'gdelt') {
        const s = await skupiGdelt(izvor, log);
        stavke.push(...s);
        statusi.push({ izvor_id: izvor.id, naziv: izvor.naziv, status: 'ok', broj: s.length, ms: Date.now()-t0 });
      }
    } catch (e) {
      log(`  IZVOR NEDOSTUPAN: ${izvor.id} -> ${e.message}`);
      statusi.push({ izvor_id: izvor.id, naziv: izvor.naziv, status: 'nedostupan', broj: 0, ms: Date.now()-t0, greska: e.message });
    }
  }

  const izlaz = { run_id, dohvaceno: new Date().toISOString(), statusi, stavke, pageviews };
  const dir = path.join(ROOT, 'data/sentiment-sb');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'raw-latest.json'), JSON.stringify(izlaz, null, 1));
  log(`Prikupljeno: ${stavke.length} stavki, ${pageviews.length} nizova pregleda`);
  return izlaz;
}

if (import.meta.url === `file://${process.argv[1]}`) prikupi();

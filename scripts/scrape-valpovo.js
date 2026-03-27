/**
 * scrape-valpovo.js
 * Periodički skraper za tz.valpovo.hr i valpovo.hr
 * Pokreće se tjedno via GitHub Actions.
 * Output: api/_scraped_content.js
 *
 * Što se skrapa:
 *   - Novosti s tz.valpovo.hr/novosti/
 *   - Aktualne manifestacije s datumima s tz.valpovo.hr/manifestacije/
 *   - Vijesti s valpovo.hr (gradske obavijesti)
 */

import { writeFileSync, readFileSync } from 'fs';
import { load } from 'cheerio';

const HEADERS = {
  'User-Agent': 'ValpovoChatbotScraper/1.0 (tourist-info-bot)',
  'Accept-Language': 'hr,en;q=0.8',
};

async function fetchHtml(url) {
  try {
    const res = await fetch(url, {
      headers: HEADERS,
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (e) {
    console.warn(`⚠️  Nije moguće dohvatiti ${url}: ${e.message}`);
    return null;
  }
}

// ─── Novosti s tz.valpovo.hr ────────────────────────────────────────────────
// HTML struktura: article.side-post > .post-title h3 a (naslov+link),
//                 .post-date a (datum), .post-body (kratki opis)

async function scrapeNovostiTZ() {
  const html = await fetchHtml('https://tz.valpovo.hr/novosti/');
  if (!html) return [];

  const $ = load(html);
  const items = [];
  const seen = new Set();

  $('article.side-post').each((_, el) => {
    const titleEl = $(el).find('.post-title h3 a, .post-title a').first();
    const title = titleEl.text().trim();
    const link = titleEl.attr('href') || '';
    const date = $(el).find('.post-date a, .post-date').first().text().trim();
    const excerpt = $(el).find('.post-body').first().text().trim()
      .replace(/\s+/g, ' ').substring(0, 280);
    const imgEl = $(el).find('img.thumb-placeholder, .side-post-image img').first();
    const imgUrl = imgEl.attr('src') || imgEl.attr('data-src') || '';

    if (title && title.length > 3 && !seen.has(title)) {
      seen.add(title);
      items.push({
        naslov: title.substring(0, 120),
        datum: date.substring(0, 20),
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
    const title = (entry.match(/<title><!\[CDATA\[([^\]]+)\]\]><\/title>/) ||
                   entry.match(/<title>([^<]+)<\/title>/))?.[1]?.trim() || '';
    const link  = entry.match(/<link>([^<]+)<\/link>/)?.[1]?.trim() || '';
    const date  = entry.match(/<pubDate>([^<]+)<\/pubDate>/)?.[1]?.trim() || '';
    const desc  = (entry.match(/<description><!\[CDATA\[([^\]]+)\]\]><\/description>/) ||
                   entry.match(/<description>([^<]+)<\/description>/))?.[1]
                    ?.replace(/<[^>]+>/g, '').trim().substring(0, 200) || '';

    // Preskočimo administrativne/pravne dokumente koji nisu turistički relevantni
    const skip = /natječaj|javna nabava|zakon|odluka o.*zakup|oglas|pravilnik|javni poziv/i.test(title);
    // Pretvori RSS datum u čitljivi oblik: "Tue, 17 Mar 2026 13:00:00 +0000" → "17. 03. 2026."
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

// ─── Manifestacije s datumima ───────────────────────────────────────────────
// HTML struktura: article.card-post > .card-post-content .post-body h3 a
// Datumi su dostupni na stranicama pojedinih manifestacija — skrapamo ih posebno

async function scrapeManifestacije() {
  const html = await fetchHtml('https://tz.valpovo.hr/manifestacije/');
  if (!html) return [];

  const $ = load(html);
  const links = [];

  // Izvuci linkove i slike svih manifestacija s listing stranice
  $('article.card-post').each((_, el) => {
    const titleEl = $(el).find('.post-body h3 a, h3 a, h2 a').first();
    const title = titleEl.text().trim();
    const link = titleEl.attr('href') || $(el).find('a').first().attr('href') || '';
    const imgEl = $(el).find('img').first();
    const imgUrl = imgEl.attr('src') || imgEl.attr('data-src') || '';
    if (title && link) links.push({ naziv: title, link, imgUrl });
  });

  // Za svaku manifestaciju dohvati detalje (datum, opis)
  const items = [];
  for (const { naziv, link, imgUrl } of links.slice(0, 13)) {
    const pageHtml = await fetchHtml(link);
    if (!pageHtml) {
      items.push({ naziv: naziv.substring(0, 100), datum: '', opis: '', link });
      continue;
    }
    const $p = load(pageHtml);
    // Datum iz meta ili post-date
    const datum = $p('.post-date a, .post-date, time').first().text().trim();
    // Kratki opis — prvi paragraf sadržaja
    const opis = $p('.entry-content p, .post-content p, article p').first()
      .text().trim().replace(/\s+/g, ' ').substring(0, 250);
    items.push({
      naziv: naziv.substring(0, 100),
      datum: datum.substring(0, 40),
      opis,
      link,
      IMAGE_URL: imgUrl,
    });
  }

  console.log(`✅ Manifestacije: ${items.length} stavki`);
  return items;
}

// ─── Provjeri je li sadržaj promijenjen ─────────────────────────────────────

function hasChanged(newData) {
  try {
    const existing = readFileSync('api/_scraped_content.js', 'utf8');
    // Uspoređuje samo JSON dio (preskačemo timestamp liniju)
    const existingJson = existing.replace(/\/\/ Zadnje skrapanje:.*\n/, '');
    const newJson = JSON.stringify(newData);
    return !existingJson.includes(newJson.substring(20, 200));
  } catch {
    return true; // datoteka ne postoji — svakako piši
  }
}

// ─── Zapis rezultata ─────────────────────────────────────────────────────────

function writeOutput(data) {
  const ts = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const output = `// AUTO-GENERATED — ne editiraj ručno!
// Zadnje skrapanje: ${ts} UTC
// Izvor: tz.valpovo.hr, valpovo.hr
// GitHub Actions job: scrape-valpovo (tjedno, ponedjeljkom u 6:00)

export const scrapedContent = ${JSON.stringify(data, null, 2)};
`;
  writeFileSync('api/_scraped_content.js', output, 'utf8');
  console.log('✅ Zapisano: api/_scraped_content.js');
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔍 Pokrećem scraping...\n');

  const [novostiTZ, novostiGrad, manifestacije] = await Promise.all([
    scrapeNovostiTZ(),
    scrapeNovostiGrad(),
    scrapeManifestacije(),
  ]);

  const data = {
    meta: {
      zadnje_azuriranje: new Date().toISOString(),
      izvori: ['https://tz.valpovo.hr', 'https://valpovo.hr'],
    },
    novosti_tz: novostiTZ,
    novosti_grad: novostiGrad,
    manifestacije_aktualne: manifestacije,
  };

  const total = novostiTZ.length + novostiGrad.length + manifestacije.length;

  if (total === 0) {
    console.warn('⚠️  Nije dohvaćen nikakav sadržaj. Provjeri dostupnost web stranica.');
    process.exit(0);
  }

  writeOutput(data);
  console.log(`\n✅ Ukupno: ${total} stavki skrapano i zapisano.`);
}

main().catch(err => {
  console.error('❌ Scraping neuspješan:', err);
  process.exit(1);
});

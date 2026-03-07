import OpenAI from "openai";
import { db } from "./_database.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Ukloni IMAGE_URL polja iz konteksta — AI ih ne treba, samo povećavaju tokene
function stripImages(data) {
  if (Array.isArray(data)) return data.map(stripImages);
  if (data && typeof data === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(data)) {
      if (k === 'IMAGE_URL') continue;
      out[k] = stripImages(v);
    }
    return out;
  }
  return data;
}

const CATEGORY_CONTEXTS = {
  smjestaj:     (db) => ({ grad: db.grad, smjestaj: db.smjestaj }),
  gastronomija: (db) => ({ grad: db.grad, gastronomija: db.gastronomija }),
  dogadanja:    (db) => ({ grad: db.grad, dogadanja: db.dogadanja }),
  znamenitosti: (db) => ({ grad: db.grad, znamenitosti: db.znamenitosti }),
  sport:        (db) => ({ grad: db.grad, sport: db.sport }),
  kupovina:     (db) => ({ grad: db.grad, kupovina: db.kupovina }),
  opcenito:     (db) => ({ grad: db.grad, opcenito: db.opcenito }),
  benzinske:    (db) => ({ grad: db.grad, benzinske_stanice: db.usluge.benzinske_stanice }),
  frizeraji:    (db) => ({ grad: db.grad, frizeraji: db.usluge.frizeraji }),
  parking:      (db) => ({ grad: db.grad, parkiralista: db.usluge.parkiralista }),
  usluge:       (db) => ({ grad: db.grad, usluge: db.usluge }),
  priroda:      (db) => ({ grad: db.grad, priroda: db.priroda }),
  okolica:      (db) => ({ grad: db.grad, okolica: db.okolica }),
};

const MONTH_MAP = {
  'Siječanj':1,'Veljača':2,'Ožujak':3,'Travanj':4,'Svibanj':5,'Lipanj':6,
  'Srpanj':7,'Kolovoz':8,'Rujan':9,'Listopad':10,'Studeni':11,'Prosinac':12
};

function eventMaxMonth(vrijeme) {
  const months = (vrijeme || '').split('/').map(p => MONTH_MAP[p.trim()]).filter(Boolean);
  return months.length ? Math.max(...months) : 12;
}

// Vrati { context, category } — category se pamti i šalje nazad klijentu
function getRelevantContext(message, db, lastCategory) {
  const msg = message.toLowerCase();

  // HR + EN + DE ključne riječi
  if (msg.includes('povijest') || msg.includes('histori') || msg.includes('osnovan') || msg.includes('općenito') || msg.includes('o gradu') || msg.includes('o valpovu') || msg.includes('stanovic') || msg.includes('stanovništv') || msg.includes('naselje') || msg.includes('geografij') || msg.includes('gospodar') || msg.includes('industrij') || msg.includes('poznat') || msg.includes('zanimljiv') || msg.includes('iovallium') || msg.includes('prandau') || msg.includes('rimsk') || msg.includes('osmansk') || msg.includes('gradonačelnik') || msg.includes('udaljenost')
    // EN
    || msg.includes('history') || msg.includes('about') || msg.includes('general') || msg.includes('population') || msg.includes('founded') || msg.includes('tell me about') || msg.includes('what is valpovo') || msg.includes('economy') || msg.includes('industry') || msg.includes('famous')
    // DE
    || msg.includes('geschichte') || msg.includes('über') || msg.includes('einwohner') || msg.includes('gegründet') || msg.includes('wirtschaft'))
    return { context: CATEGORY_CONTEXTS.opcenito(db), category: 'opcenito' };

  if (msg.includes('smještaj') || msg.includes('hotel') || msg.includes('noćen') || msg.includes('apartman') || msg.includes('sobe') || msg.includes('villa') || msg.includes('ruralni')
    // EN
    || msg.includes('accommodation') || msg.includes('sleep') || msg.includes('stay') || msg.includes('room') || msg.includes('bed') || msg.includes('lodge') || msg.includes('hostel')
    // DE
    || msg.includes('unterkunft') || msg.includes('schlafen') || msg.includes('übernacht') || msg.includes('zimmer'))
    return { context: CATEGORY_CONTEXTS.smjestaj(db), category: 'smjestaj' };

  if (msg.includes('jelo') || msg.includes('restoran') || msg.includes('hrana') || msg.includes('pizza') || msg.includes('burger') || msg.includes('jesti') || msg.includes('ručati') || msg.includes('ručak') || msg.includes('večerati') || msg.includes('večera') || msg.includes('doručak') || msg.includes('kafić') || msg.includes('kava') || msg.includes('bar') || msg.includes('ugostit')
    // EN
    || msg.includes('restaurant') || msg.includes('food') || msg.includes('eat') || msg.includes('dinner') || msg.includes('lunch') || msg.includes('breakfast') || msg.includes('cafe') || msg.includes('coffee') || msg.includes('drink') || msg.includes('where to eat') || msg.includes('place to eat')
    // DE
    || msg.includes('essen') || msg.includes('speise') || msg.includes('trinken') || msg.includes('café') || msg.includes('gaststätte') || msg.includes('mittagessen') || msg.includes('abendessen'))
    return { context: CATEGORY_CONTEXTS.gastronomija(db), category: 'gastronomija' };

  if (msg.includes('događ') || msg.includes('festival') || msg.includes('manifestac') || msg.includes('karneval') || msg.includes('advent')
    // EN
    || msg.includes('event') || msg.includes('events') || msg.includes('festival') || msg.includes('carnival') || msg.includes('celebration')
    // DE
    || msg.includes('veranstaltung') || msg.includes('fest') || msg.includes('feier'))
    return { context: CATEGORY_CONTEXTS.dogadanja(db), category: 'dogadanja' };

  if (msg.includes('znamenitost') || msg.includes('dvorac') || msg.includes('muzej') || msg.includes('kula') || msg.includes('katančić') || msg.includes('posjet')
    // EN
    || msg.includes('attraction') || msg.includes('sightseeing') || msg.includes('castle') || msg.includes('museum') || msg.includes('monument') || msg.includes('visit') || msg.includes('landmark') || msg.includes('sight')
    // DE
    || msg.includes('sehenswürdigkeit') || msg.includes('burg') || msg.includes('schloss') || msg.includes('museum') || msg.includes('besichtigung'))
    return { context: CATEGORY_CONTEXTS.znamenitosti(db), category: 'znamenitosti' };

  if (msg.includes('sport') || msg.includes('tenis') || msg.includes('nogomet') || msg.includes('futsal') || msg.includes('rukomet') || msg.includes('odbojka') || msg.includes('košark') || msg.includes('karate') || msg.includes('fitness') || msg.includes('teretana') || msg.includes('stadion') || msg.includes('klub') || msg.includes('rekreacij')
    // EN
    || msg.includes('tennis') || msg.includes('football') || msg.includes('soccer') || msg.includes('handball') || msg.includes('volleyball') || msg.includes('basketball') || msg.includes('gym') || msg.includes('stadium') || msg.includes('club') || msg.includes('recreation')
    // DE
    || msg.includes('tennis') || msg.includes('fußball') || msg.includes('handball') || msg.includes('volleyball') || msg.includes('basketball') || msg.includes('fitnessstudio') || msg.includes('stadion') || msg.includes('verein'))
    return { context: CATEGORY_CONTEXTS.sport(db), category: 'sport' };

  if (msg.includes('kupin') || msg.includes('kupovat') || msg.includes('shopping') || msg.includes('trgovin') || msg.includes('supermarket') || msg.includes('dućan') || msg.includes('suveniri') || msg.includes('market') || msg.includes('agropark')
    // EN
    || msg.includes('shop') || msg.includes('store') || msg.includes('buy') || msg.includes('souvenir') || msg.includes('market') || msg.includes('mall') || msg.includes('grocery')
    // DE
    || msg.includes('einkaufen') || msg.includes('einkauf') || msg.includes('laden') || msg.includes('souvenir') || msg.includes('markt') || msg.includes('kaufen'))
    return { context: CATEGORY_CONTEXTS.kupovina(db), category: 'kupovina' };

  if (msg.includes('benzin') || msg.includes('goriv') || msg.includes('pumpa')
    // EN
    || msg.includes('gas station') || msg.includes('petrol') || msg.includes('fuel')
    // DE
    || msg.includes('tankstelle') || msg.includes('benzin') || msg.includes('kraftstoff'))
    return { context: CATEGORY_CONTEXTS.benzinske(db), category: 'benzinske' };

  if (msg.includes('frizer') || msg.includes('brica') || msg.includes('kozmet') || msg.includes('salon') || msg.includes('barber')
    // EN
    || msg.includes('hairdresser') || msg.includes('haircut') || msg.includes('barber') || msg.includes('beauty salon')
    // DE
    || msg.includes('friseur') || msg.includes('frisör') || msg.includes('haarschnitt'))
    return { context: CATEGORY_CONTEXTS.frizeraji(db), category: 'frizeraji' };

  if (msg.includes('parking') || msg.includes('parkir')
    // EN (parking is same)
    // DE
    || msg.includes('parken') || msg.includes('parkplatz'))
    return { context: CATEGORY_CONTEXTS.parking(db), category: 'parking' };

  if (msg.includes('ljekar') || msg.includes('banka') || msg.includes('bankomat') || msg.includes('taksi') || msg.includes('taxi') || msg.includes('autobus') || msg.includes('uslug')
    // EN
    || msg.includes('doctor') || msg.includes('pharmacy') || msg.includes('bank') || msg.includes('atm') || msg.includes('cash') || msg.includes('bus') || msg.includes('service') || msg.includes('post office')
    // DE
    || msg.includes('arzt') || msg.includes('apotheke') || msg.includes('bank') || msg.includes('geldautomat') || msg.includes('bus') || msg.includes('taxi') || msg.includes('post'))
    return { context: CATEGORY_CONTEXTS.usluge(db), category: 'usluge' };

  if (msg.includes('šetn') || msg.includes('bicikl') || msg.includes('perivoj') || msg.includes('park') || msg.includes('priroda') || msg.includes('ribolov') || msg.includes('drava') || msg.includes('šuma')
    // EN
    || msg.includes('walk') || msg.includes('hiking') || msg.includes('cycling') || msg.includes('nature') || msg.includes('fishing') || msg.includes('river') || msg.includes('forest') || msg.includes('outdoor') || msg.includes('picnic')
    // DE
    || msg.includes('wandern') || msg.includes('radfahren') || msg.includes('natur') || msg.includes('angeln') || msg.includes('fluss') || msg.includes('wald') || msg.includes('spazier'))
    return { context: CATEGORY_CONTEXTS.priroda(db), category: 'priroda' };

  if (msg.includes('izlet') || msg.includes('okolica') || msg.includes('blizin') || msg.includes('kopački') || msg.includes('osijek') || msg.includes('đakovo') || msg.includes('bizovac') || msg.includes('toplice') || msg.includes('vino') || msg.includes('baranj')
    // EN
    || msg.includes('trip') || msg.includes('excursion') || msg.includes('nearby') || msg.includes('surroundings') || msg.includes('day trip') || msg.includes('wine') || msg.includes('spa') || msg.includes('around valpovo')
    // DE
    || msg.includes('ausflug') || msg.includes('umgebung') || msg.includes('in der nähe') || msg.includes('wein') || msg.includes('therme'))
    return { context: CATEGORY_CONTEXTS.okolica(db), category: 'okolica' };

  // Nema ključnih riječi — koristi zadnju kategoriju razgovora ako postoji
  if (lastCategory && CATEGORY_CONTEXTS[lastCategory])
    return { context: CATEGORY_CONTEXTS[lastCategory](db), category: lastCategory };

  return { context: db, category: null };
}

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {

    const { message, history, category: lastCategory, weather } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Poruka je prazna." });
    }

    const { context, category } = getRelevantContext(message, db, lastCategory);

    // Događanja listing: filtriraj prošle i generiraj direktno bez AI
    if (category === 'dogadanja' && lastCategory !== 'dogadanja') {
      const currentMonth = new Date().getMonth() + 1;
      const upcoming = db.dogadanja.filter(e => eventMaxMonth(e.vrijeme) >= currentMonth);
      let reply = upcoming.length
        ? `Predstojeće manifestacije u Valpovu (${new Date().getFullYear()}):\n\n`
        : 'Nema predstojećih manifestacija za ostatak ove godine.';
      for (const e of upcoming) {
        reply += `**${e.naziv}**\n`;
        reply += `📅 ${e.vrijeme}\n`;
        reply += `${e.opis}\n`;
        reply += e.web ? `[Više informacija](${e.web})\n` : `[Više informacija na TZ Valpovo](https://tz.valpovo.hr/manifestacije/)\n`;
        reply += '\n';
      }
      return res.status(200).json({ reply, category });
    }

    // Smještaj listing: generiraj direktno bez AI (brzo, kompletno, bez token limita)
    const isSmjestajListing = category === 'smjestaj' && lastCategory !== 'smjestaj';
    if (isSmjestajListing) {
      const s = db.smjestaj;
      const sections = [
        { key: 'hoteli',         icon: '🏨', label: 'Hoteli' },
        { key: 'ruralni_smjestaj', icon: '🌿', label: 'Ruralni smještaj' },
        { key: 'apartmani',      icon: '🏠', label: 'Apartmani' },
        { key: 'prenocista',     icon: '🛏', label: 'Prenoćišta' },
        { key: 'sobe',           icon: '🔑', label: 'Sobe' },
      ];
      let reply = 'Evo svih smještajnih opcija u Valpovu:\n\n';
      for (const { key, icon, label } of sections) {
        const items = s[key];
        if (!items?.length) continue;
        reply += `${icon} **${label}**\n\n`;
        for (const item of items) {
          reply += `**${item.naziv}**\n`;
          if (item.opis) reply += `${item.opis}\n`;
          reply += `[Otvori na karti](${item.maps_url})\n`;
          reply += item.web ? `[Više informacija](${item.web})\n` : `[Više informacija na TZ Valpovo](https://tz.valpovo.hr/smjestaj-u-valpovu/)\n`;
          reply += '\n';
        }
      }
      return res.status(200).json({ reply, category });
    }

    // Gastronomija listing: generiraj direktno bez AI (eliminira hallucination restorana)
    const isGastroListing = category === 'gastronomija' && lastCategory !== 'gastronomija';
    if (isGastroListing) {
      const gastro = db.gastronomija || [];

      // Pomoćna funkcija za maps_url — koristi polje ili generira iz adrese/naziva
      const mapsUrl = (item) =>
        item.maps_url ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.naziv + ' Valpovo')}`;

      // Grupiraj po tipu
      const restorani = gastro.filter(g =>
        /restoran|hotel.*restoran/i.test(g.naziv)
      );
      const brzaHrana = gastro.filter(g =>
        /burger|pizza|pizzeria|brze prehrane|gurman/i.test(g.naziv)
      );
      const caffeBarovi = gastro.filter(g =>
        !restorani.includes(g) && !brzaHrana.includes(g)
      );

      let reply = 'Valpovo ima bogatu ugostiteljsku ponudu — od tradicionalnih slavonskih restorana do caffe barova. Evo kompletnog pregleda:\n\n';

      if (restorani.length) {
        reply += '🍽️ **Restorani**\n\n';
        for (const item of restorani) {
          reply += `**${item.naziv}**\n`;
          if (item.opis) reply += `${item.opis}\n`;
          if (item.adresa) reply += `📍 ${item.adresa}\n`;
          if (item.telefon) reply += `📞 ${item.telefon}\n`;
          reply += `[Otvori na karti](${mapsUrl(item)})\n`;
          if (item.web) reply += `[Više informacija](${item.web})\n`;
          reply += '\n';
        }
      }

      if (brzaHrana.length) {
        reply += '🍕 **Brza hrana i pizzerije**\n\n';
        for (const item of brzaHrana) {
          reply += `**${item.naziv}**\n`;
          if (item.opis) reply += `${item.opis}\n`;
          if (item.adresa) reply += `📍 ${item.adresa}\n`;
          reply += `[Otvori na karti](${mapsUrl(item)})\n`;
          if (item.web) reply += `[Više informacija](${item.web})\n`;
          reply += '\n';
        }
      }

      if (caffeBarovi.length) {
        reply += '☕ **Caffe barovi i kavane**\n\n';
        for (const item of caffeBarovi) {
          reply += `**${item.naziv}**\n`;
          if (item.opis) reply += `${item.opis}\n`;
          reply += `[Otvori na karti](${mapsUrl(item)})\n`;
          if (item.web) reply += `[Više informacija](${item.web})\n`;
          reply += '\n';
        }
      }

      return res.status(200).json({ reply, category });
    }

    // Sport listing: generiraj direktno bez AI (opći upit o sportu/klubovima)
    const isSportListing = category === 'sport' && lastCategory !== 'sport';
    if (isSportListing) {
      const s = db.sport;
      const sportEmoji = {
        'Nogomet': '⚽', 'Futsal (malonogometni)': '⚽', 'Rukomet': '🤾', 'Odbojka': '🏐',
        'Košarka': '🏀', 'Tenis': '🎾', 'Stolni tenis': '🏓', 'Karate': '🥋',
        'Savate (francuski boks)': '🥊', 'Šah': '♟️', 'Sportski ribolov': '🎣'
      };
      let reply = 'Sportski klubovi i sadržaji u Valpovu:\n\n';
      if (s?.klubovi?.length) {
        reply += '**🏆 Sportski klubovi**\n\n';
        for (const k of s.klubovi) {
          const emoji = sportEmoji[k.sport] || '🏅';
          reply += `${emoji} **${k.naziv}**\n`;
          if (k.opis) reply += `${k.opis}\n`;
          if (k.maps_url) reply += `[Otvori na karti](${k.maps_url})\n`;
          if (k.web) reply += `[Više informacija](${k.web})\n`;
          reply += '\n';
        }
      }
      if (s?.objekti?.length) {
        reply += '**🏟️ Sportski objekti**\n\n';
        for (const o of s.objekti) {
          reply += `**${o.naziv}**\n`;
          if (o.opis) reply += `${o.opis}\n`;
          if (o.maps_url) reply += `[Otvori na karti](${o.maps_url})\n`;
          if (o.web) reply += `[Više informacija](${o.web})\n`;
          reply += '\n';
        }
      }
      if (s?.rekreacija?.length) {
        reply += '**🚴 Rekreacija i aktivni odmor**\n\n';
        for (const r of s.rekreacija) {
          reply += `**${r.naziv}**\n`;
          if (r.opis) reply += `${r.opis}\n`;
          if (r.maps_url) reply += `[Otvori na karti](${r.maps_url})\n`;
          reply += '\n';
        }
      }
      return res.status(200).json({ reply, category });
    }

    // Okolica listing: generiraj direktno bez AI samo kad korisnik traži opći popis izleta
    // (sadrži 'izlet') — specifična pitanja (vinske ceste, Kopački rit...) idu na AI
    const msgLower = message.toLowerCase();
    const isOkolicaListing = category === 'okolica' && msgLower.includes('izlet');
    if (isOkolicaListing) {
      const izleti = db.okolica?.izleti || [];
      let reply = 'Preporučeni izleti iz Valpova — od najbližeg prema daljem:\n\n';
      for (const item of izleti) {
        reply += `**${item.naziv}**\n`;
        if (item.udaljenost) reply += `📍 ${item.udaljenost}\n`;
        if (item.opis)       reply += `${item.opis}\n`;
        if (item.cijena)     reply += `💶 ${item.cijena}\n`;
        reply += `[Otvori na karti](${item.maps_url})\n`;
        if (item.web)        reply += `[Više informacija](${item.web})\n`;
        reply += '\n';
      }
      return res.status(200).json({ reply, category });
    }

    // Datum i godišnje doba (server-side, uvijek točno)
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1; // 1-12
    const year = now.getFullYear();
    const months = ['siječnja','veljače','ožujka','travnja','svibnja','lipnja',
                    'srpnja','kolovoza','rujna','listopada','studenog','prosinca'];
    const dateStr = `${day}. ${months[month - 1]} ${year}.`;

    function getSeason(m, d) {
      if ((m === 3 && d >= 21) || m === 4 || m === 5 || (m === 6 && d <= 20)) return 'proljeće';
      if ((m === 6 && d >= 21) || m === 7 || m === 8 || (m === 9 && d <= 22)) return 'ljeto';
      if ((m === 9 && d >= 23) || m === 10 || m === 11 || (m === 12 && d <= 21)) return 'jesen';
      return 'zima';
    }
    const season = getSeason(month, day);

    const weatherLine = weather?.temperature !== undefined
      ? `Trenutno vrijeme u Valpovu: ${weather.temperature}°C, vjetar ${weather.windspeed} km/h.`
      : '';

    const systemPrompt = `
KONTEKST TRENUTNOG TRENUTKA:
- Datum: ${dateStr}
- Godišnje doba: ${season}
${weatherLine ? `- Trenutno vrijeme u Valpovu: ${weatherLine}` : ''}
Koristi ovaj kontekst prirodno u preporukama — npr. ljeti predloži rijeku i izlete na otvorenom, zimi toplice i advent, u proljeće šetnje i biciklizam, u jesen vinska sela i berbu.

KRITIČNO PRAVILO — JEZIK: Uvijek odgovaraj ISKLJUČIVO na jeziku kojim je napisano korisnikovo pitanje. Ovo je apsolutni prioritet koji se nikad ne smije zanemariti.
- Pitanje na engleskom → cijeli odgovor na engleskom, uključujući labele linkova ([Open on map], [More information])
- Pitanje na njemačkom → cijeli odgovor na njemačkom ([Auf der Karte öffnen], [Mehr Informationen])
- Pitanje na talijanskom → cijeli odgovor na talijanskom ([Apri sulla mappa], [Più informazioni])
- Pitanje na hrvatskom → odgovor na hrvatskom ([Otvori na karti], [Više informacija])
- Za bilo koji drugi jezik → odgovaraj na tom jeziku
Podatke iz baze prevedi na jezik korisnika. Nazive mjesta, ulica i institucija ostavi u izvornom obliku.

Ti si digitalni turistički informator grada Valpova.

Za svaku lokaciju, restoran ili smještaj koristi TOČNO ovu strukturu (labele linkova na jeziku korisnika):

**Naziv**
Kratki opis.
[Otvori na karti](Google Maps URL)
[Više informacija](URL web stranice)

PRAVILA FORMATIRANJA:
- UVOD: Prije nego počneš nabrajati lokacije ili stavke, uvijek napiši 1-2 kratke uvodni rečenice koje kontekstualiziraju odgovor. Primjer: umjesto da odmah počneš s "**Restoran Jovalija**...", napiši "U Valpovu možete pronaći nekoliko odličnih restorana koji nude tradicijsku slavonsku kuhinju. Evo pregleda:" — a zatim nastavi s nabrajanjem. Rečenice prilagodi temi i jeziku pitanja.
- NIKAD ne koristi ### ili ## naslove
- NIKAD ne uključuj slike niti ![]() sintaksu
- Za "Otvori na karti" koristi polje maps_url iz baze (svaka lokacija ga ima)
- Svaki unos odijeli praznim redom
- Ako lokacija nema web u bazi, umjesto "Web: nije dostupno" napiši aktivan link: [Više informacija na TZ Valpovo](https://tz.valpovo.hr)
- NIKAD ne izmišljaj URL-ove koji nisu u bazi — koristi SAMO URL adrese iz polja "web" u bazi podataka

PRAVILA ZA BROJ REZULTATA:
- Za kategoriju SMJEŠTAJ: prikaži SVE opcije, grupirane po tipu (Hoteli, Apartmani, Prenoćišta, Sobe, Ruralni smještaj). Za svaku lokaciju samo: naziv, kratki opis (ako postoji), [Otvori na karti] i [Više informacija].
- Za kategoriju SPORT (opći upit): prikaži SVE klubove grupirane po sportu, pa objekte i rekreaciju. Koristi emoji po sportu: ⚽ Nogomet, 🎾 Tenis, 🤾 Rukomet, 🏐 Odbojka, 🥊 Borilački, ♟️ Šah, 🎣 Ribolov, 💪 Fitness itd.
- Za kategoriju KUPOVINA (opći upit): prikaži sve u logičnom redoslijedu — prvo 🏬 Trading centri (s popisom trgovina unutra), zatim 🛒 Supermarketi, 🏪 Specijalizirane trgovine, 🎁 Lokalni proizvodi i suveniri, 🥬 Tržnica. Za svaku stavku napiši naziv, opis, radno vrijeme i [Otvori na karti]. Za STOP SHOP dodatno navedi popis svih trgovina unutra.
- Za kategoriju OPĆENITO / O GRADU: odgovaraj slobodnim tekstom koristeći podatke iz baze. Struktura ovisno o pitanju — za opći upit o gradu daj: osnovni podaci → kratka povijest → naselja → gospodarske aktivnosti → zanimljivosti. NE koristi tablice, koristi boldane naslove sekcija i kratke paragrafe.
- Za kategoriju PRIRODA (opći upit): prikaži sve sadržaje grupirane: 🚶 Šetnice i parkovi, 🚴 Biciklizam, 🎣 Ribolov. Za svaki unos: naziv, opis. Gdje postoji maps_url — dodaj [Otvori na karti].
- Za kategoriju OKOLICA — SPECIFIČNO pitanje (npr. "vinske ceste", "Kopački rit", "toplice", "Baranja"): odgovaraj SAMO o traženoj temi — ne listaj sve destinacije. Navedi udaljenost, opis i [Više informacija](web) samo za relevantne unose.
- Za kategoriju OKOLICA — OPĆI upit ("što ima u okolici", "preporuči izlet"): prikaži sve destinacije s udaljenošću, kratkim opisom i cijenom (ako postoji). Koristi emoji 📍. Za svaku dodaj [Više informacija](web). Grupiraj po udaljenosti: bliže → dalje.
- Za sve ostale kategorije: prikaži MAKSIMALNO 5 lokacija po odgovoru
- Ako ih ima više od prikazanih (N > 0), na kraju dodaj: "Ima još [N] rezultata — pitajte za više!" — AKO NEMA VIŠE, NE DODAJ NIŠTA
- Ako korisnik traži "još" ili "više" — prikaži sljedećih 5 koje NISU već navedene
- Nikad ne ponavljaj iste lokacije u istom razgovoru

PRAVILO: AKO PODATAK NIJE U BAZI — odgovori iskreno: "Trenutno nemam te podatke. Za više informacija obratite se Turističkoj zajednici Valpovo: [tz.valpovo.hr](https://tz.valpovo.hr) ili tel. 031 651 256." NIKAD ne izmišljaj podatke koji nisu u bazi.

Baza podataka:
${JSON.stringify(stripImages(context))}
`;

    const historyMessages = Array.isArray(history)
      ? history.slice(-6).map(m => ({ role: m.role, content: m.content }))
      : [];

    // SSE streaming — tekst se prikazuje čim stignu prvi tokeni
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Accel-Buffering', 'no');

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...historyMessages,
        { role: "user", content: message }
      ],
      temperature: 0.3,
      max_tokens: category === 'opcenito' ? 900 : 500,
      stream: true
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) res.write(`data: ${JSON.stringify({ t: content })}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ done: true, category: category || null })}\n\n`);
    res.end();

  } catch (error) {

    console.error("CHAT ERROR:", error);
    try {
      res.write(`data: ${JSON.stringify({ error: true })}\n\n`);
      res.end();
    } catch {
      res.status(500).json({ reply: "Došlo je do greške na serveru." });
    }

  }

}

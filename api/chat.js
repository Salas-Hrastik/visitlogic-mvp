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

  if (msg.includes('povijest') || msg.includes('histori') || msg.includes('osnovan') || msg.includes('nastao') || msg.includes('kad je') || msg.includes('kada je') || msg.includes('općenito') || msg.includes('opcenito') || msg.includes('o gradu') || msg.includes('o valpovu') || msg.includes('stanovic') || msg.includes('stanovništv') || msg.includes('koliko ima') || msg.includes('naselje') || msg.includes('geografij') || msg.includes('površin') || msg.includes('gospodar') || msg.includes('industrij') || msg.includes('poznat') || msg.includes('zanimljiv') || msg.includes('iovallium') || msg.includes('prandau') || msg.includes('normann') || msg.includes('rimsk') || msg.includes('osmansk') || msg.includes('gradonacelnik') || msg.includes('gradonačelnik') || msg.includes('župani') || msg.includes('prometn') || msg.includes('željeznic') || msg.includes('vlak') || msg.includes('udaljenost'))
    return { context: CATEGORY_CONTEXTS.opcenito(db), category: 'opcenito' };

  if (msg.includes('smještaj') || msg.includes('smjestaj') || msg.includes('hotel') || msg.includes('noćen') || msg.includes('noćit') || msg.includes('prenoći') || msg.includes('sobe') || msg.includes('soba') || msg.includes('apartman') || msg.includes('boravak') || msg.includes('prenoćišt') || msg.includes('spavat') || msg.includes('gdje spat') || msg.includes('villa') || msg.includes('ruralni'))
    return { context: CATEGORY_CONTEXTS.smjestaj(db), category: 'smjestaj' };

  if (msg.includes('jelo') || msg.includes('restoran') || msg.includes('gastronomija') || msg.includes('hrana') || msg.includes('pizza') || msg.includes('burger') || msg.includes('jesti') || msg.includes('večer') || msg.includes('večera') || msg.includes('ručak') || msg.includes('ručam') || msg.includes('pojesti') || msg.includes('naruč') || msg.includes('kafić') || msg.includes('kava') || msg.includes('piti') || msg.includes('bar') || msg.includes('popiti'))
    return { context: CATEGORY_CONTEXTS.gastronomija(db), category: 'gastronomija' };

  if (msg.includes('događ') || msg.includes('festival') || msg.includes('manifestac') || msg.includes('karneval') || msg.includes('advent') || msg.includes('uskrs'))
    return { context: CATEGORY_CONTEXTS.dogadanja(db), category: 'dogadanja' };

  if (msg.includes('znamenitost') || msg.includes('dvorac') || msg.includes('muzej') || msg.includes('kula') || msg.includes('katančić') || msg.includes('posjet'))
    return { context: CATEGORY_CONTEXTS.znamenitosti(db), category: 'znamenitosti' };

  if (msg.includes('sport') || msg.includes('sportski') || msg.includes('sportska') || msg.includes('tenis') || msg.includes('nogomet') || msg.includes('futsal') || msg.includes('rukomet') || msg.includes('odbojka') || msg.includes('košark') || msg.includes('karate') || msg.includes('savate') || msg.includes('šah') || msg.includes('ribolov') || msg.includes('fitness') || msg.includes('teretana') || msg.includes('stadion') || msg.includes('trčan') || msg.includes('rekreacij') || msg.includes('vježban') || msg.includes('klub') || msg.includes('sportaš') || msg.includes('natjecanj'))
    return { context: CATEGORY_CONTEXTS.sport(db), category: 'sport' };

  if (msg.includes('kupin') || msg.includes('kupovat') || msg.includes('shopping') || msg.includes('trgovin') || msg.includes('supermarket') || msg.includes('prodavaon') || msg.includes('dućan') || msg.includes('suveniri') || msg.includes('suvenir') || msg.includes('poklon') || msg.includes('stop shop') || msg.includes('konzum') || msg.includes('plodine') || msg.includes('spar') || msg.includes('obuć') || msg.includes('odjeć') || msg.includes('namještaj') || msg.includes('tržnic') || msg.includes('pijac') || msg.includes('market') || msg.includes('robu') || msg.includes('roba'))
    return { context: CATEGORY_CONTEXTS.kupovina(db), category: 'kupovina' };

  if (msg.includes('benzin') || msg.includes('goriv') || msg.includes('tankiran') || msg.includes('pumpa'))
    return { context: CATEGORY_CONTEXTS.benzinske(db), category: 'benzinske' };

  if (msg.includes('frizer') || msg.includes('brica') || msg.includes('šišan') || msg.includes('kozmet') || msg.includes('salon') || msg.includes('barber'))
    return { context: CATEGORY_CONTEXTS.frizeraji(db), category: 'frizeraji' };

  if (msg.includes('parking') || msg.includes('parkir') || msg.includes('parkirat') || msg.includes('gdje parkir') || msg.includes('auto ostav'))
    return { context: CATEGORY_CONTEXTS.parking(db), category: 'parking' };

  if (msg.includes('servis') || msg.includes('ljekar') || msg.includes('banka') || msg.includes('pošta') || msg.includes('bankomat') || msg.includes('taksi') || msg.includes('taxi') || msg.includes('prijevoz') || msg.includes('autobus') || msg.includes('vlak') || msg.includes('kolodvor') || msg.includes('uslug'))
    return { context: CATEGORY_CONTEXTS.usluge(db), category: 'usluge' };

  if (msg.includes('šetn') || msg.includes('setn') || msg.includes('karašic') || msg.includes('karasic') || msg.includes('bicikl') || msg.includes('perivoj') || msg.includes('park') || msg.includes('pješac') || msg.includes('pješac') || msg.includes('piknik') || msg.includes('priroda') || msg.includes('ribolov') || msg.includes('riba') || msg.includes('drava') || msg.includes('ušće') || msg.includes('uce') || msg.includes('rekreacij') || msg.includes('šuma') || msg.includes('suma') || msg.includes('zelenilo') || msg.includes('nordijsk'))
    return { context: CATEGORY_CONTEXTS.priroda(db), category: 'priroda' };

  if (msg.includes('izlet') || msg.includes('okolica') || msg.includes('blizin') || msg.includes('nedaleko') || msg.includes('kopački') || msg.includes('kopacki') || msg.includes('osijek') || msg.includes('đakovo') || msg.includes('dakovo') || msg.includes('bizovac') || msg.includes('bizovač') || msg.includes('toplice') || msg.includes('vinsk') || msg.includes('vino') || msg.includes('vinograd') || msg.includes('miholjac') || msg.includes('našic') || msg.includes('nasic') || msg.includes('baranj') || msg.includes('ekskurzij') || msg.includes('što posjet') || msg.includes('kuda izaći'))
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

    const { message, history, category: lastCategory } = req.body;

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

    const systemPrompt = `
Ti si digitalni turistički informator grada Valpova. Odgovaraj uvijek na hrvatskom jeziku.

Za svaku lokaciju, restoran ili smještaj koristi TOČNO ovu strukturu:

**Naziv**
Kratki opis.
[Otvori na karti](Google Maps URL s koordinatama iz baze)
[Više informacija](URL web stranice iz baze)

PRAVILA FORMATIRANJA:
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
- Ako ih ima više, na kraju dodaj: "Ima još [N] rezultata — pitajte za više!"
- Ako korisnik traži "još" ili "više" — prikaži sljedećih 5 koje NISU već navedene
- Nikad ne ponavljaj iste lokacije u istom razgovoru

Baza podataka:
${JSON.stringify(stripImages(context))}
`;

    const historyMessages = Array.isArray(history)
      ? history.slice(-6).map(m => ({ role: m.role, content: m.content }))
      : [];

    const completion = await openai.chat.completions.create({

      model: "gpt-4o-mini",

      messages: [
        { role: "system", content: systemPrompt },
        ...historyMessages,
        { role: "user", content: message }
      ],

      temperature: 0.3,
      max_tokens: (category === 'smjestaj' || category === 'sport' || category === 'kupovina') ? 1800 : 700

    });

    const reply = completion.choices[0].message.content;

    return res.status(200).json({ reply, category });

  } catch (error) {

    console.error("CHAT ERROR:", error);

    return res.status(500).json({
      reply: "Došlo je do greške na serveru."
    });

  }

}

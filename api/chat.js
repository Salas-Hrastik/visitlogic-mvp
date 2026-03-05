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
  benzinske:    (db) => ({ grad: db.grad, benzinske_stanice: db.usluge.benzinske_stanice }),
  frizeraji:    (db) => ({ grad: db.grad, frizeraji: db.usluge.frizeraji }),
  usluge:       (db) => ({ grad: db.grad, usluge: db.usluge }),
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

  if (msg.includes('smještaj') || msg.includes('hotel') || msg.includes('noćenje') || msg.includes('sobe') || msg.includes('apartman'))
    return { context: CATEGORY_CONTEXTS.smjestaj(db), category: 'smjestaj' };

  if (msg.includes('jelo') || msg.includes('restoran') || msg.includes('gastronomija') || msg.includes('hrana') || msg.includes('pizza') || msg.includes('burger') || msg.includes('jesti') || msg.includes('večer') || msg.includes('večera') || msg.includes('ručak') || msg.includes('ručam') || msg.includes('pojesti') || msg.includes('naruč') || msg.includes('kafić') || msg.includes('kava') || msg.includes('piti') || msg.includes('bar') || msg.includes('popiti'))
    return { context: CATEGORY_CONTEXTS.gastronomija(db), category: 'gastronomija' };

  if (msg.includes('događ') || msg.includes('festival') || msg.includes('manifestac') || msg.includes('karneval') || msg.includes('advent') || msg.includes('uskrs'))
    return { context: CATEGORY_CONTEXTS.dogadanja(db), category: 'dogadanja' };

  if (msg.includes('znamenitost') || msg.includes('dvorac') || msg.includes('muzej') || msg.includes('kula') || msg.includes('katančić') || msg.includes('posjet'))
    return { context: CATEGORY_CONTEXTS.znamenitosti(db), category: 'znamenitosti' };

  if (msg.includes('benzin') || msg.includes('goriv') || msg.includes('tankiran') || msg.includes('pumpa'))
    return { context: CATEGORY_CONTEXTS.benzinske(db), category: 'benzinske' };

  if (msg.includes('frizer') || msg.includes('brica') || msg.includes('šišan') || msg.includes('kozmet') || msg.includes('salon') || msg.includes('barber'))
    return { context: CATEGORY_CONTEXTS.frizeraji(db), category: 'frizeraji' };

  if (msg.includes('servis') || msg.includes('auto') || msg.includes('ljekar') || msg.includes('banka') || msg.includes('pošta') || msg.includes('trgovin') || msg.includes('uslug'))
    return { context: CATEGORY_CONTEXTS.usluge(db), category: 'usluge' };

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
    if (category === 'dogadanja' && !lastCategory) {
      const currentMonth = new Date().getMonth() + 1;
      const upcoming = db.dogadanja.filter(e => eventMaxMonth(e.vrijeme) >= currentMonth);
      let reply = upcoming.length
        ? `Predstojeće manifestacije u Valpovu (${new Date().getFullYear()}):\n\n`
        : 'Nema predstojećih manifestacija za ostatak ove godine.';
      for (const e of upcoming) {
        reply += `**${e.naziv}**\n`;
        reply += `📅 ${e.vrijeme}\n`;
        reply += `${e.opis}\n`;
        if (e.web) reply += `[Više informacija](${e.web})\n`;
        reply += '\n';
      }
      return res.status(200).json({ reply, category });
    }

    // Smještaj listing: generiraj direktno bez AI (brzo, kompletno, bez token limita)
    const isSmjestajListing = category === 'smjestaj' && !lastCategory;
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
          if (item.web) reply += `[Više informacija](${item.web})\n`;
          reply += '\n';
        }
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
- Ako lokacija nema web u bazi, ispusti tu liniju

PRAVILA ZA BROJ REZULTATA:
- Za kategoriju SMJEŠTAJ: prikaži SVE opcije, grupirane po tipu (Hoteli, Apartmani, Prenoćišta, Sobe, Ruralni smještaj). Za svaku lokaciju samo: naziv, kratki opis (ako postoji), [Otvori na karti] i [Više informacija].
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
      max_tokens: category === 'smjestaj' ? 1800 : 700

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

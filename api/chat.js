import OpenAI from "openai";
import { db } from "./_database.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function getRelevantContext(message, db) {
  const msg = message.toLowerCase();

  if (msg.includes('smještaj') || msg.includes('hotel') || msg.includes('noćenje') || msg.includes('sobe') || msg.includes('apartman')) {
    return { grad: db.grad, smjestaj: db.smjestaj };
  }
  if (msg.includes('jelo') || msg.includes('restoran') || msg.includes('gastronomija') || msg.includes('hrana') || msg.includes('pizza') || msg.includes('burger') || msg.includes('jesti')) {
    return { grad: db.grad, gastronomija: db.gastronomija };
  }
  if (msg.includes('događ') || msg.includes('festival') || msg.includes('manifestac') || msg.includes('karneval') || msg.includes('advent') || msg.includes('uskrs')) {
    return { grad: db.grad, dogadanja: db.dogadanja };
  }
  if (msg.includes('znamenitost') || msg.includes('dvorac') || msg.includes('muzej') || msg.includes('kula') || msg.includes('katančić') || msg.includes('posjet')) {
    return { grad: db.grad, znamenitosti: db.znamenitosti };
  }
  if (msg.includes('servis') || msg.includes('auto') || msg.includes('ljekar') || msg.includes('banka') || msg.includes('pošta') || msg.includes('trgovin') || msg.includes('uslug')) {
    return { grad: db.grad, usluge: db.usluge };
  }

  return db;
}

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {

    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Poruka je prazna." });
    }

    const context = getRelevantContext(message, db);

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
- Svaki unos odijeli praznim redom
- Ako lokacija nema kartu ili web u bazi, ispusti tu liniju

Baza podataka:
${JSON.stringify(context)}
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

      temperature: 0.3

    });

    const reply = completion.choices[0].message.content;

    return res.status(200).json({ reply });

  } catch (error) {

    console.error("CHAT ERROR:", error);

    return res.status(500).json({
      reply: "Došlo je do greške na serveru."
    });

  }

}

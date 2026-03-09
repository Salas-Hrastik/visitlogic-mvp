import OpenAI from "openai";
import fs from "fs";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {

  try {

    const { message } = req.body;

    // Učitavanje baze
    const dbPath = path.join(process.cwd(), "data", "biograd_clean.json");

    const raw = fs.readFileSync(dbPath, "utf8");
    const data = JSON.parse(raw);

    // filtriranje restorana
    const restorani = data
      .filter(o => o.kategorija === "restaurant")
      .slice(0, 20);

    // kontekst za AI
    const context = JSON.stringify(restorani);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Ti si AI turistički informator za Biograd na Moru.

Koristi podatke iz baze objekata kada odgovaraš.

Ako korisnik traži restorane, koristi isključivo ovu bazu.

Baza restorana:
${context}
`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.3
    });

    const reply = completion.choices[0].message.content;

    res.status(200).json({
      reply
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      reply: "Greška pri čitanju baze podataka."
    });

  }

}

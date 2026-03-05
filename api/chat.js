import OpenAI from "openai";
import { db } from "./_database.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Poruka je prazna." });
    }

    const systemPrompt = `
Ti si digitalni turistički informator grada Valpova.

Odgovaraj jasno i pregledno.

Struktura odgovora:

Naziv
kratki opis

📍 Otvori na karti
🌐 Web (ako postoji)

Baza podataka:
${JSON.stringify(db)}
`;

    const completion = await openai.chat.completions.create({

      model: "gpt-4o-mini",

      messages: [
        { role: "system", content: systemPrompt },
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

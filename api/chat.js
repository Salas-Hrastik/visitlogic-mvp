import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {

  try {

    const { message } = req.body;

    // učitavanje baze
    const raw = fs.readFileSync("./data/biograd_clean.json", "utf8");
    const data = JSON.parse(raw);

    // filtriraj restorane
    const restorani = data.filter(o => o.kategorija === "restaurant");

    const context = JSON.stringify(restorani.slice(0,20));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Ti si AI turistički informator za Biograd na Moru.

Ako korisnik traži restorane koristi ovu bazu:

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

    res.status(200).json({
      reply: completion.choices[0].message.content
    });

  } catch (error) {

    console.error("ERROR:", error);

    res.status(200).json({
      reply: "Greška pri čitanju baze podataka."
    });

  }

}

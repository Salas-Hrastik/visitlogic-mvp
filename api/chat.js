// STABLE CHAT SERVER FOR VALPOVO BOT

import OpenAI from "openai";
import { db } from "./_database.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function fetchWeather() {

  try {

    const r = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=45.6609&longitude=18.4186&current_weather=true&timezone=auto"
    );

    const d = await r.json();

    return d.current_weather;

  } catch {

    return null;

  }

}

function buildPrompt(message, weather) {

return `
Ti si digitalni turistički informator grada Valpova.

Ako ima podataka o vremenu, spomeni ih u prvoj rečenici.

Vrijeme:
${weather ? weather.temperature + "°C" : "nije dostupno"}

Odgovaraj kratko i pregledno.

Koristi strukturu:

NAZIV
kratki opis

📍 Otvori na karti
🌐 Web

Baza podataka:
${JSON.stringify(db)}
`;

}

export default async function handler(req, res) {

if (req.method !== "POST") {
  return res.status(405).json({ reply: "Method not allowed" });
}

try {

const { message } = req.body;

const weather = await fetchWeather();

const systemPrompt = buildPrompt(message, weather);

const completion = await openai.chat.completions.create({

model: "gpt-4o-mini",

messages: [

{ role: "system", content: systemPrompt },

{ role: "user", content: message }

],

temperature: 0.4

});

const reply = completion.choices[0].message.content;

return res.status(200).json({ reply });

} catch (error) {

console.error(error);

return res.status(500).json({
reply: "Došlo je do greške na serveru."
});

}

}

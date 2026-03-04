// VERSION: 3.2.2-STABLE (VERCEL FIX)
import { db } from '../lib/database.js';

async function fetchWeather() {
    try {
        const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=45.6609&longitude=18.4186&current_weather=true&timezone=auto");
        const d = await r.json();
        return d.current_weather || null;
    } catch { return null; }
}

function buildSystemPrompt(db, weather) {
    const data = JSON.stringify(db, null, 2);
    return `TI SI Digitalni turistički informator grada Valpova.
VRIJEME: ${weather ? weather.temperature + "°C" : "Ugodno"}.
VERZIJA: v3.2.2 (Skočni prozori za slike).

### STROGI PROTOKOL FOTOGRAFIJA:
1. Kad spominješ objekt koji ima "IMAGE_URL", MORAŠ ponuditi poveznicu: [Vidi fotografiju](IMAGE_URL)
2. TI NE DIREKTNO PRIKAZUJEŠ SLIKU, šalješ link za popup.

### PRAVILO FORMATIRANJA:
- NE koristi # zaglavlja.
- Nazivi objekata moraju biti **BOLDIRANI**.
- Uvijek dodaj: [Otvori na karti](https://www.google.com/maps/search/?api=1&query=NAZIV+OBJEKTA+Valpovo)

### TVOJA BAZA PODATAKA:
${data.substring(0, 15000)} // Sigurnosno skraćeno ako je preveliko`;
}

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ reply: "API ključ nedostaje." });

    try {
        const { message, history = [] } = req.body;
        const weather = await fetchWeather();
        const systemPrompt = buildSystemPrompt(db, weather);

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey.trim()}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...history.slice(-6).map(m => ({ role: m.role === "model" ? "assistant" : m.role, content: m.content })),
                    { role: "user", content: message }
                ],
                temperature: 0.5
            })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error?.message || "OpenAI error");
        return res.status(200).json({ reply: result.choices[0].message.content });
    } catch (e) {
        return res.status(500).json({ reply: "Sistemska greška: " + e.message });
    }
}

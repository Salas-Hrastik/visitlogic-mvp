// VERSION: 3.4.0 (VERCEL STABLE TIMEOUT FIX)

import { db } from './_database.js';

async function fetchWeatherFast() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const r = await fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=45.6609&longitude=18.4186&current_weather=true&timezone=auto",
            { signal: controller.signal }
        );

        clearTimeout(timeoutId);

        const d = await r.json();
        return d.current_weather || null;

    } catch (e) {
        console.log("Weather skipped");
        return null;
    }
}

function getRelevantContext(message, database, history = []) {

    const msg = message.toLowerCase();
    let context = { grad: database.grad };

    if (msg.includes("znamenitosti") || msg.includes("dvorac") || msg.includes("muzej") || msg.includes("kula")) {
        context.znamenitosti = database.znamenitosti;
    }

    if (msg.includes("restoran") || msg.includes("gastronomija") || msg.includes("jelo") || msg.includes("piza") || msg.includes("kavana")) {
        context.gastronomija = database.gastronomija;
        context.specijalizirana_jela = database.specijalizirana_jela;
    }

    if (msg.includes("smještaj") || msg.includes("hotel") || msg.includes("apartman") || msg.includes("sobe")) {
        context.smjestaj = database.smjestaj;
    }

    if (msg.includes("događanja") || msg.includes("manifestacije") || msg.includes("festival")) {
        context.dogadanja = database.dogadanja.slice(0,5);
    }

    if (msg.includes("priroda") || msg.includes("rijeka") || msg.includes("park") || msg.includes("bicikl")) {
        context.priroda = database.priroda;
    }

    if (msg.includes("usluge") || msg.includes("banka") || msg.includes("pošta") || msg.includes("doktor") || msg.includes("trgovina") || msg.includes("ljekarna")) {
        context.usluge = database.usluge;
    }

    if (Object.keys(context).length === 1) {
        context.znamenitosti = database.znamenitosti;
        context.gastronomija = database.gastronomija;
        context.dogadanja = database.dogadanja.slice(0,5);
        context.usluge = database.usluge;
    }

    return JSON.stringify(context).slice(0,6000);
}

function buildSystemPrompt(message, db, weather, history) {

    const contextData = getRelevantContext(message, db, history);

    return `TI SI Digitalni turistički informator grada Valpova.

VRIJEME: ${weather ? weather.temperature + "°C" : "ugodna temperatura"}.

PRAVILA:
- Odgovori kratko i pregledno
- Koristi liste i razmake
- Nemoj pisati dugačke eseje

FORMAT:

Naziv mjesta
kratki opis

📸 [Vidi fotografiju](IMAGE_URL)

📍 [Otvori na karti](https://www.google.com/maps/search/?api=1&query=NAZIV+OBJEKTA+Valpovo)

🌐 [Više informacija](URL)

BAZA PODATAKA:

${contextData}`;
}

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            reply: "Sistemska greška: API ključ nije konfiguriran."
        });
    }

    try {

        const { message, history = [] } = req.body;

        if (!message) {
            return res.status(400).json({ reply: "Poruka je prazna." });
        }

        const weather = await fetchWeatherFast();

        const systemPrompt = buildSystemPrompt(message, db, weather, history);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);

        const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey.trim()}`
                },
                signal: controller.signal,
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: systemPrompt },
                        ...history.slice(-3).map(m => ({
                            role: m.role === "model" ? "assistant" : m.role,
                            content: m.content
                        })),
                        { role: "user", content: message }
                    ],
                    temperature: 0.3
                })
            }
        );

        clearTimeout(timeoutId);

        const result = await response.json();

        if (!response.ok) {
            console.error("OpenAI Error:", result);
            return res.status(response.status).json({
                reply: "Greška AI servisa."
            });
        }

        return res.status(200).json({
            reply: result.choices[0].message.content
        });

    } catch (e) {

        console.error("Chat Error:", e);

        const isTimeout = e.name === "AbortError";

        return res.status(500).json({
            reply: isTimeout
                ? "Odgovor traje predugo. Molimo pokušajte s kraćim upitom."
                : "Sistemska greška."
        });
    }
}

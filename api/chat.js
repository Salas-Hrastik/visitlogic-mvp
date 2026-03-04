// VERSION: 3.3.0 (SMART CONTEXT & FULL DATA FIX)
import { db } from '../lib/database.js';

async function fetchWeather() {
    try {
        const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=45.6609&longitude=18.4186&current_weather=true&timezone=auto");
        const d = await r.json();
        return d.current_weather || null;
    } catch { return null; }
}

/**
 * Filter database context based on user message keywords
 * to fit into the prompt without truncation.
 */
function getRelevantContext(message, database) {
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
    if (msg.includes("događanja") || msg.includes("manifestacije") || msg.includes("festival") || msg.includes("advent")) {
        context.dogadanja = database.dogadanja;
    }
    if (msg.includes("priroda") || msg.includes("rijeka") || msg.includes("park") || msg.includes("bicikl")) {
        context.priroda = database.priroda;
    }
    if (msg.includes("usluge") || msg.includes("banka") || msg.includes("pošta") || msg.includes("doktor") || msg.includes("trgovina")) {
        context.usluge = database.usluge;
    }

    // If query is generic or no keywords found, send top categories
    if (Object.keys(context).length === 1) {
        context.znamenitosti = database.znamenitosti;
        context.gastronomija = database.gastronomija;
        context.dogadanja = database.dogadanja;
    }

    return JSON.stringify(context, null, 2);
}

function buildSystemPrompt(message, db, weather) {
    const contextData = getRelevantContext(message, db);

    return `TI SI Digitalni turistički informator grada Valpova.
VRIJEME: ${weather ? weather.temperature + "°C" : "Ugodno"}.
STATUS: Koristiš RELEVANTNI dio baze za odgovor.

### PRAVILA LISTANJA (VAŽNO):
- Ako korisnik klikne na 'Znamenitosti', 'Gastronomija' ili slično, MORAŠ izlistati SVE subjekte iz baze za tu kategoriju.
- NE skraćuj liste. Korisnik želi vidjeti SVE opcije koje imamo.

### STROGI PROTOKOL FOTOGRAFIJA:
1. Za SVAKI objekt koji ima polje "IMAGE_URL" u bazi, MORAŠ dodati gumb: [📸 Vidi fotografiju](IMAGE_URL)
2. Gumb za sliku stavi odmah ispod naziva ili opisa objekta.
3. Ako objekt NEMA IMAGE_URL, nemoj izmišljati linkove.

### PRAVILO FORMATIRANJA:
- Nazivi objekata moraju biti **BOLDIRANI**.
- Uvijek dodaj gumb za kartu: [📍 Otvori na karti](https://www.google.com/maps/search/?api=1&query=NAZIV+OBJEKTA+Valpovo)

### TVOJA TRENUTNA BAZA (FILTRIRANO ZA UPIT):
${contextData}`;
}

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ reply: "API ključ nedostaje." });

    try {
        const { message, history = [] } = req.body;
        const weather = await fetchWeather();
        const systemPrompt = buildSystemPrompt(message, db, weather);

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
                    ...history.slice(-4).map(m => ({ role: m.role === "model" ? "assistant" : m.role, content: m.content })),
                    { role: "user", content: message }
                ],
                temperature: 0.3 // Niža temperatura za preciznije nabrajanje
            })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error?.message || "OpenAI error");
        return res.status(200).json({ reply: result.choices[0].message.content });
    } catch (e) {
        return res.status(500).json({ reply: "Sistemska greška: " + e.message });
    }
}

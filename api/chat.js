// VERSION: 3.3.0 (SMART CONTEXT & FULL DATA FIX)
import { db } from './_database.js';

async function fetchWeather() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
        const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=45.6609&longitude=18.4186&current_weather=true&timezone=auto", {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        const d = await r.json();
        return d.current_weather || null;
    } catch (e) {
        console.error("Weather Fetch Error:", e.message);
        return null;
    }
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
    if (msg.includes("događanja") || msg.includes("manifestacije") || msg.includes("festival") || msg.includes("advent") || msg.includes("ljeto") || msg.includes("karneval") || msg.includes("uskrs") || msg.includes("fiš") || msg.includes("beer") || msg.includes("staza")) {
        context.dogadanja = database.dogadanja;
    }
    if (msg.includes("priroda") || msg.includes("rijeka") || msg.includes("park") || msg.includes("bicikl")) {
        context.priroda = database.priroda;
    }
    if (msg.includes("usluge") || msg.includes("banka") || msg.includes("pošta") || msg.includes("doktor") || msg.includes("trgovina") || msg.includes("ljekarna") || msg.includes("majstor") || msg.includes("auto") || msg.includes("servis") || msg.includes("mehaničar") || msg.includes("šoping") || msg.includes("kupiti")) {
        context.usluge = database.usluge;
    }

    // If query is generic or no keywords found, send top categories
    if (Object.keys(context).length === 1) {
        context.znamenitosti = database.znamenitosti;
        context.gastronomija = database.gastronomija;
        context.dogadanja = database.dogadanja;
        context.usluge = database.usluge;
    }

    // COMPACT CONTEXT: Remove indentation to save tokens and speed up generation
    return JSON.stringify(context);
}

function buildSystemPrompt(message, db, weather) {
    const contextData = getRelevantContext(message, db);

    return `TI SI Digitalni turistički informator grada Valpova.
VRIJEME: ${weather ? weather.temperature + "°C" : "Ugodno"}.

### PRAVILO VREMENA (VAŽNO):
- Tvoji savjeti MORAJU biti u skladu s trenutnim vremenom:
    - HLADNO (< 15°C) ili KIŠOVITO: Preporuči zatvorene prostore.
    - TOPLO I SUNČANO: Preporuči perivoj ili aktivnosti na otvorenom.
- Spomeni vrijeme u PRVOJ kratkoj rečenici.

### STROGI PROTOKOL FOTOGRAFIJA:
- Za svaki objekt s IMAGE_URL obavezno dodaj gumb: [📸 Vidi fotografiju](IMAGE_URL)

### PRAVILA ZA LISTANJE (KRITIČNO ZA BRZINU):
- Ako korisnika zanima popis (npr. 'Manifestacije'), budi MAKSIMALNO KRATAK.
- Za svaki događaj navedi samo: **Naziv**, jedan kratki opis (max 10 riječi), gumb za sliku i kartu.
- NE piši dugačke uvodnike ili zaključke. Odmah na stvar!

### PRAVILO FORMATIRANJA:
- Nazivi objekata **BOLDIRANI**.
- Gumb za kartu: [Otvori na karti](https://www.google.com/maps/search/?api=1&query=NAZIV+OBJEKTA+Valpovo)
- Web linkovi: [Web stranica](URL).

### BAZA:
${contextData}`;
}

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ reply: "Sistemska greška: API ključ nije konfiguriran." });

    try {
        const { message, history = [] } = req.body;
        if (!message) return res.status(400).json({ reply: "Poruka je prazna." });

        const weather = await fetchWeather();
        const systemPrompt = buildSystemPrompt(message, db, weather);

        // API Call with 15s timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
                    ...history.slice(-4).map(m => ({
                        role: m.role === "model" ? "assistant" : m.role,
                        content: m.content
                    })),
                    { role: "user", content: message }
                ],
                temperature: 0.3
            })
        });

        clearTimeout(timeoutId);

        const result = await response.json();

        if (!response.ok) {
            console.error("OpenAI API Error:", result);
            return res.status(response.status).json({
                reply: `Greška servisa (${response.status}): ${result.error?.message || "Nepoznata greška OpenAI."}`
            });
        }

        if (!result.choices || !result.choices[0]) {
            throw new Error("Neispravan odgovor od OpenAI (nedostaje 'choices').");
        }

        return res.status(200).json({ reply: result.choices[0].message.content });

    } catch (e) {
        console.error("Chat Server Error:", e.message);
        const isTimeout = e.name === "AbortError";
        return res.status(500).json({
            reply: isTimeout
                ? "Asistentu treba previše vremena za odgovor. Molimo pokušajte ponovno s kraćim upitom."
                : "Sistemska greška: " + e.message
        });
    }
}

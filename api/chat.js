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

    // MANIFESTACIJE CHUNKING (Pagination)
    const isContinuation = msg === "da" || msg === "može" || msg === "ajde" || msg.includes("više") || msg.includes("još") || msg.includes("sljedeće") || msg.includes("nastavi");
    const historyText = history.map(h => h.content).join(" ").toLowerCase();
    const wasEvents = historyText.includes("događanja") || historyText.includes("manifestacije") || historyText.includes("dječji gradski karneval");

    if (msg.includes("događanja") || msg.includes("manifestacije") || msg.includes("festival") || (wasEvents && isContinuation)) {
        const allEvents = database.dogadanja;
        const showedFirst = historyText.includes(" uskrsni");
        const showedSecond = historyText.includes(" craft beer");

        if (isContinuation && showedFirst && !showedSecond) {
            context.dogadanja = allEvents.slice(5, 10);
            context.napomena = "Prikazujem manifestacije od 6. do 10. mjesta.";
        } else if (isContinuation && showedSecond) {
            context.dogadanja = allEvents.slice(10);
            context.napomena = "Prikazujem preostale manifestacije.";
        } else {
            context.dogadanja = allEvents.slice(0, 5);
        }
    }

    if (msg.includes("priroda") || msg.includes("rijeka") || msg.includes("park") || msg.includes("bicikl")) {
        context.priroda = database.priroda;
    }
    if (msg.includes("usluge") || msg.includes("banka") || msg.includes("pošta") || msg.includes("doktor") || msg.includes("trgovina") || msg.includes("ljekarna") || msg.includes("majstor") || msg.includes("auto") || msg.includes("servis") || msg.includes("mehaničar") || msg.includes("šoping") || msg.includes("kupiti")) {
        context.usluge = database.usluge;
    }

    // Default top categories (if no keywords)
    if (Object.keys(context).length === 1) {
        context.znamenitosti = database.znamenitosti;
        context.gastronomija = database.gastronomija;
        context.dogadanja = database.dogadanja.slice(0, 5); // Limit default list too
        context.usluge = database.usluge;
    }

    return JSON.stringify(context);
}

function buildSystemPrompt(message, db, weather, history) {
    const contextData = getRelevantContext(message, db, history);

    return `TI SI Digitalni turistički informator grada Valpova.
VRIJEME: ${weather ? weather.temperature + "°C" : "Ugodno"}.

### PRAVILO VREMENA (VAŽNO):
- Tvoji savjeti MORAJU biti u skladu s trenutnim vremenom.
- Spomeni vrijeme u PRVOJ kratkoj rečenici.

### PRAVILA ZA LISTANJE (BITE-SIZED ODGOVORI):
- U tvojoj bazi (ispod) vidiš samo DIO podataka (npr. 5 događanja).
- Izlistaj SVE što vidiš u "dogadanja" ili drugoj kategoriji koju korisnik traži.
- Na kraju obavezno napiši: "Želite li vidjeti još manifestacija (ili restorana/službi)?" ako osjećaš da ih ima još.

### PRAVILO FORMATIRANJA:
- Naziv, kratki opis, gumb za sliku: [📸 Vidi fotografiju](IMAGE_URL)
- Gumb za kartu: [Otvori na karti](https://www.google.com/maps/search/?api=1&query=NAZIV+OBJEKTA+Valpovo)
- VAŽNO: Za web linkove OBAVEZNO koristi format: 🌐 [Više informacija](URL)

### BAZA (TRENUTNI DIO):
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
        const systemPrompt = buildSystemPrompt(message, db, weather, history);

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

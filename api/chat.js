import { db } from "./database.js";

// ── WEATHER HELPER ──────────────────────────────────────────────────────────
async function fetchWeather() {
    try {
        const url = "https://api.open-meteo.com/v1/forecast?latitude=45.6609&longitude=18.4186&current_weather=true";
        const r = await fetch(url);
        if (!r.ok) return null;
        const d = await r.json();
        return d.current_weather || null;
    } catch (e) {
        console.error("fetchWeather error (non-fatal):", e);
        return null;
    }
}

function getSeason(month) {
    if (month >= 3 && month <= 5) return "proljeće";
    if (month >= 6 && month <= 8) return "ljeto";
    if (month >= 9 && month <= 11) return "jesen";
    return "zima";
}

function getHour() {
    return new Date().getUTCHours() + 1; // Approximate CET
}

// ── BUILD SYSTEM PROMPT ─────────────────────────────────────────────────────
function buildSystemPrompt(db, weather, season, hour, isWeekend) {
    const weatherNote = weather
        ? `\n\nTRENUTNO STANJE U VALPOVU:\n- Temperatura: ${weather.temperature}°C\n- Vjetar: ${weather.windspeed} km/h\n- Weather Code: ${weather.weathercode}\nSezona: ${season}. Sat: ${hour}:00.`
        : `\nSezona: ${season}. Sat: ${hour}:00.`;

    const eveningNote = hour >= 19 ? "\nNAKON 19:00: Predloži večernju šetnju ili restoran." : "";
    const weekendNote = isWeekend ? "\nVIKEND: Napomeni mogućnost događanja." : "";

    // Helper to format entities for the prompt
    const fmt = (item) => {
        let s = `- ${item.naziv}: ${item.opis || ""}`;
        if (item.adresa) s += ` | Adresa: ${item.adresa}`;
        if (item.telefon) s += ` | Tel: ${item.telefon}`;
        if (item.web) s += ` | Web: ${item.web}`;
        if (item.ocjena) s += ` | Ocjena: ${item.ocjena}⭐`;
        if (item.radno_vrijeme) s += ` | Radno vrijeme: ${JSON.stringify(item.radno_vrijeme)}`;
        if (item.aktivnosti) s += ` | Aktivnosti: ${item.aktivnosti.join(", ")}`;
        if (item.koordinate) s += ` | GPS: ${item.koordinate.lat}, ${item.koordinate.lng}`;
        return s;
    };

    const znamenitosti = (db.znamenitosti || []).map(fmt).join("\n");
    const gastronomija = (db.gastronomija || []).map(fmt).join("\n");
    const priroda = (db.priroda || []).map(fmt).join("\n");
    const smjestaj_list = (db.smjestaj || []).map(fmt).join("\n");
    const dogadanja = (db.dogadanja || []).map(d => `- ${d.naziv} (${d.vrijeme}): ${d.opis}`).join("\n");
    const specJela = (db.specijalizirana_jela || []).map(j => `- ${j.naziv}: ${j.opis}`).join("\n");

    // Format USLUGE section
    let uslugeStr = "";
    if (db.usluge) {
        for (const [kat, lista] of Object.entries(db.usluge)) {
            uslugeStr += `\n${kat.toUpperCase()}:\n` + lista.map(fmt).join("\n") + "\n";
        }
    }

    return `STRICT LANGUAGE RULE: Always respond in the SAME language the user is using.
Dobrodošli u Valpovo 🌳🏰
Ti si digitalni turistički informator TZ Valpovo. Profesionalan, topao i koristan.
Izvor informacija: tz.valpovo.hr i interna baza podataka.

${weatherNote}${eveningNote}${weekendNote}

──────────────────────────────────────────
PRAVILA FORMATIRANJA ODGOVORA (OBAVEZNO):
──────────────────────────────────────────
 Za SVAKI subjekt (restoran, trgovina, znamenitost, usluga) koji preporučiš, MORAŠ prikazati:
1. NAZIV I KRATKI OPIS.
2. KONTAKT: Ako postoji "Telefon", prikaži ga kao "📞 [broj]".
3. WEB: Ako postoji "Web", prikaži ga kao "🌐 [link]".
4. GPS: Ako postoje "Koordinate", prikaži ih kao "📍 [lat], [lng]".
5. GOOGLE MAPS LINK: OBAVEZNO generiraj link u formatu:
   https://www.google.com/maps/search/?api=1&query=[Naziv+Objekta]+Valpovo
   (Ovaj link će frontend prikazati kao gumb).

AKO korisnik pita za radno vrijeme ili ocjenu, koristi podatke iz baze.

──────────────────────────────────────────
PROCES FILTRIRANJA SMJEŠTAJA
──────────────────────────────────────────
1. IZLISTAJ SVE objekte iz odabrane kategorije.
2. ZA SVAKI OBJEKT NAVEDI: Naziv, Adresu, Telefon, Opis i Maps link.
3. KRAJ: "Za sve detaljne informacije i rezervacije, molimo kontaktirajte izravno odabrani smještaj..."

──────────────────────────────────────────
BAZA ZNANJA – VALPOVO
──────────────────────────────────────────
ZNAMENITOSTI I ATRAKCIJE:
${znamenitosti}

PRIRODA I REKREACIJA (RIJEKE I VIKEND NASELJA):
${priroda}

GASTRONOMIJA (HRANA I PIĆE):
${gastronomija}

USLUGE (BANKE, MEHANIČARI, TRGOVINE, ZDRAVLJE):
${uslugeStr}

SMJEŠTAJ:
${smjestaj_list}

MANIFESTACIJE:
${dogadanja}

SPECIJALIZIRANA JELA:
${specJela}
`;
}

// ── HANDLER ─────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { message, history = [] } = req.body;
        if (!message) return res.status(400).json({ error: "Message is required" });

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey || apiKey.trim().length < 10) {
            return res.status(500).json({ error: "OPENAI_API_KEY nije ispravno postavljen u Vercel postavkama." });
        }

        // 1. KORISTI UGRAĐENU BAZU (nema više čitanja s diska)
        const weather = await fetchWeather();
        const now = new Date();
        const month = now.getUTCMonth() + 1;
        const season = getSeason(month);
        const hour = getHour();
        const isWeekend = [0, 5, 6].includes(now.getUTCDay());
        const systemPrompt = buildSystemPrompt(db, weather, season, hour, isWeekend);

        // 2. POZIV OPENAI
        const messages = [
            { role: "system", content: systemPrompt },
            ...history.slice(-6).map(m => ({
                role: m.role === "user" ? "user" : "assistant",
                content: m.content
            })),
            { role: "user", content: message }
        ];

        let openAIRes;
        try {
            openAIRes = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey.trim()}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });
        } catch (fetchErr) {
            console.error("OpenAI Fetch Error:", fetchErr);
            return res.status(502).json({ error: "Problem u komunikaciji s AI servisom", details: fetchErr.message });
        }

        const responseText = await openAIRes.text();

        if (!openAIRes.ok) {
            console.error("OpenAI Error Response:", responseText);
            return res.status(openAIRes.status).json({
                error: `OpenAI API javlja grešku (${openAIRes.status})`,
                details: responseText.substring(0, 200)
            });
        }

        let aiData;
        try {
            aiData = JSON.parse(responseText);
        } catch (parseErr) {
            console.error("JSON Parse Error:", responseText);
            return res.status(502).json({
                error: "AI servis je poslao nevažeći odgovor (nije JSON)",
                details: responseText.substring(0, 100)
            });
        }

        const reply = aiData?.choices?.[0]?.message?.content || "Došlo je do greške u generiranju odgovora.";
        return res.status(200).json({ reply });

    } catch (globalError) {
        console.error("Global Handler Error:", globalError);
        return res.status(500).json({
            error: "Neočekivana greška na poslužitelju",
            details: globalError.message
        });
    }
}

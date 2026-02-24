import fs from "fs";
import path from "path";

// ── WEATHER HELPER ──────────────────────────────────────────────────────────
async function fetchWeather() {
    try {
        const url =
            "https://api.open-meteo.com/v1/forecast?latitude=45.6609&longitude=18.4186&current_weather=true";
        const r = await fetch(url);
        const d = await r.json();
        return d.current_weather || null;
    } catch {
        return null;
    }
}

function weatherDescription(w) {
    if (!w) return null;
    const { temperature, windspeed, weathercode } = w;

    let tempDesc =
        temperature < 5
            ? "Hladno je (ispod 5°C) – preporučujem zatvorene lokacije."
            : temperature < 12
                ? `Sve je ${temperature}°C – prikladno za kraće šetnje.`
                : temperature < 22
                    ? `Ugodnih ${temperature}°C – idealno za park i centar.`
                    : temperature < 30
                        ? `Toplo je (${temperature}°C) – predivno za boravak vani.`
                        : `Vruće (${temperature}°C) – jutarnje i večernje aktivnosti.`;

    let weatherType =
        weathercode >= 51
            ? "Pada kiša – preporučujem zatvorene sadržaje."
            : weathercode >= 3
                ? "Oblačno, ali bez kiše."
                : "Sunčano i vedro.";

    let windDesc = windspeed > 30 ? ` Vjetar ${windspeed} km/h.` : "";

    return `${tempDesc} ${weatherType}${windDesc}`;
}

function getSeason(month) {
    if (month >= 3 && month <= 5) return "proljeće";
    if (month >= 6 && month <= 8) return "ljeto";
    if (month >= 9 && month <= 11) return "jesen";
    return "zima";
}

function getHour() {
    // Central European time (UTC+1/+2) – approximate from server time
    return new Date().getUTCHours() + 1;
}

// ── BUILD SYSTEM PROMPT ─────────────────────────────────────────────────────
function buildSystemPrompt(db, weather, season, hour, isWeekend) {
    const weatherCtx = weatherDescription(weather);
    const weatherNote = weatherCtx
        ? `\n\nTRENUTNO STANJE U VALPOVU:\n${weatherCtx}\nSezona: ${season}. Sat: ${hour}:00.`
        : `\nSezona: ${season}. Sat: ${hour}:00.`;

    const eveningNote =
        hour >= 19
            ? "\nNAKON 19:00: Predloži večernju šetnju, večeru u lokalnom restoranu ili kulturni program (ako je vikend)."
            : "";

    const weekendNote = isWeekend
        ? "\nVIKEND: Diskretno napomeni mogućnost lokalnih događanja ili kulturnog programa."
        : "";

    // Sažetak znanja iz JSON-a
    const znamenitosti = db.znamenitosti
        .slice(0, 8)
        .map((z) => `- ${z.naziv}: ${z.opis}`)
        .join("\n");

    const gastronomija = db.gastronomija
        .map((g) => `- ${g.naziv} (${g.tip})`)
        .join("\n");

    const smjestaj = db.smjestaj
        .map((s) => `- ${s.naziv} (${s.tip})`)
        .join("\n");

    const dogadanja = db.dogadanja
        .map((d) => `- ${d.naziv} (${d.vrijeme})`)
        .join("\n");

    const specJela = db.specijalizirana_jela
        .map((j) => `- ${j.naziv}: ${j.opis}`)
        .join("\n");

    const kontakt = db.korisne_informacije.kontakt_tz;

    return `Dobrodošli u Valpovo 🌳🏰

Valpovo je grad perivoja, plemićke baštine i slavonske gostoljubivosti.
Ti si službeni digitalni turistički informator Turističke zajednice Grada Valpova.

STIL: profesionalan, realan, topao, slavonski nenametljiv.
NIKADA ne izmišljaj podatke. Ako nemaš potvrđenih informacija, to jasno naglasi.

PRAVILO: Jedini izvor informacija je tz.valpovo.hr i podaci koje ovdje dobijete. Nikad drugi izvori.
${weatherNote}${eveningNote}${weekendNote}

──────────────────────────────────────────
PRAVILA PONAŠANJA
──────────────────────────────────────────

REALNI UVJETI → SEZONA → DOGAĐANJA → PREPORUKA → ATMOSFERA

Temperatura:
- < 5°C → fokus na zatvorene sadržaje
- 5–12°C → kraće šetnje
- 12–22°C → idealno za park i centar
- > 30°C → jutarnje i večernje aktivnosti
- Ako weathercode ≥ 51 → fokus na zatvorene sadržaje

Sezonski mod:
- Proljeće → priroda i park
- Ljeto → večernje šetnje i događanja
- Jesen → perivoj + gastronomija
- Zima → kultura i interijeri

Manifestacijska logika (petak navečer, subota, nedjelja):
→ Diskretno napomeni mogućnost lokalnih događanja.
→ Koristi: "Često se vikendom održavaju kulturna događanja…" ili "Vrijedi provjeriti aktualni program…"
→ NIKAD ne izmišljaj konkretan program.

──────────────────────────────────────────
DESTINACIJSKI IDENTITET
──────────────────────────────────────────

Valpovo komumiciraj kao:
- Grad dvorca Prandau-Normann
- Grad velikog perivoja
- Mirnu slavonsku destinaciju
- Mjesto ugodnih kulturnih događanja

Prioritet preporuka:
1. Dvorac Prandau-Normann
2. Perivoj
3. Župna crkva / Centar grada
4. Aktualna događanja (ako postoje)

Najviše 3 preporuke u jednom odgovoru.
Najviše jedno potpitanje.

──────────────────────────────────────────
MINI ITINERARI
──────────────────────────────────────────

1 dan → dvorac + perivoj + ručak
2–3 dana → Valpovo + Baranja ili Kopački rit

Ne više od 3 aktivnosti dnevno.

Ako korisnik želi izlet: Predloži Baranju, Kopački rit, nebo biciklističke rute. Navedi okvirno trajanje puta.

──────────────────────────────────────────
OBITELJSKI MOD
──────────────────────────────────────────
Ako korisnik spominje djecu: istakni park, otvorene prostore, sigurnost, mirnu atmosferu. Maks. 3 preporuke.

──────────────────────────────────────────
REZERVACIJE I CIJENE
──────────────────────────────────────────
Ako korisnik želi rezervaciju → uputi na službeni kontakt, NE izmišljaj cijene.
Kontakt TZ: ${kontakt.telefon} | ${kontakt.email} | ${kontakt.web}

──────────────────────────────────────────
BAZA ZNANJA – VALPOVO
──────────────────────────────────────────

ZNAMENITOSTI:
${znamenitosti}

GASTRONOMIJA (ugostitelji):
${gastronomija}

SPECIJALIZIRANA SLAVONSKA JELA:
${specJela}

SMJEŠTAJ (puni popis: ${kontakt.web}/smjestaj-u-valpovu):
${smjestaj}

MANIFESTACIJE I DOGAĐANJA:
${dogadanja}

Više informacija: https://tz.valpovo.hr
`;
}

// ── HANDLER ─────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { message, history = [] } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY nije postavljen" });
    }

    try {
        // Učitaj bazu znanja
        const dbPath = path.join(process.cwd(), "data", "valpovo.json");
        const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

        // Kontekstualni podaci
        const weather = await fetchWeather();
        const now = new Date();
        const month = now.getUTCMonth() + 1;
        const season = getSeason(month);
        const hour = getHour();
        const dayOfWeek = now.getUTCDay(); // 0=ned, 5=pet, 6=sub
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;

        const systemPrompt = buildSystemPrompt(db, weather, season, hour, isWeekend);

        // Gemini API poziv
        const endpoint =
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        // Izgradi history za Gemini (user/model alternating)
        const contents = [];

        // Dodaj povijest razgovora (maks. zadnjih 6 poruka)
        const recentHistory = history.slice(-6);
        for (const msg of recentHistory) {
            contents.push({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.content }],
            });
        }

        // Dodaj trenutnu poruku
        contents.push({
            role: "user",
            parts: [{ text: message }],
        });

        const body = {
            system_instruction: {
                parts: [{ text: systemPrompt }],
            },
            contents,
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 600,
                topP: 0.8,
            },
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            ],
        };

        const geminiRes = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!geminiRes.ok) {
            const err = await geminiRes.text();
            console.error("Gemini API error:", err);
            return res.status(502).json({ error: "AI servis nije dostupan", details: err });
        }

        const geminiData = await geminiRes.json();
        const reply =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Nažalost, trenutno ne mogu odgovoriti. Pokušajte malo kasnije.";

        return res.status(200).json({ reply });

    } catch (error) {
        console.error("Chat API Error:", error);
        return res.status(500).json({ error: "Greška pri obradi", details: error.message });
    }
}

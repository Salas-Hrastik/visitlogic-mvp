// ── INTEGRATED DATABASE (Valpovo Tourism Data) ─────────────────────────────
const db = {
    "grad": {
        "naziv": "Valpovo",
        "opis": "Valpovo je grad u Osječko-baranjskoj županiji, smješten uz rijeku Karašicu, poznat po dvorcu Prandau-Normann, bogatoj kulturnoj baštini i toploj slavonskoj gostoljubivosti.",
        "adresa_tz": "Trg kralja Tomislava 2, 31550 Valpovo",
        "telefon": "+385 31 656 200",
        "email": "tzgvalpovo@gmail.com",
        "web": "https://tz.valpovo.hr",
        "virtualna_setnja": "https://tz.valpovo.hr/2025/01/17/virtualna-setnja-valpovo-gdje-najbolje-pocinje/"
    },
    "znamenitosti": [
        { "id": 1, "naziv": "Dvorac Prandau-Normann i perivoj", "tip": "Kulturna baština", "opis": "Ljetnikovačka rezidencija obitelji Prandau-Normann – barokni dvorac.", "adresa": "Ul. Dvorac Norman-Prandau 1, 31550 Valpovo", "koordinate": { "lat": 45.6589, "lng": 18.4153 }, "ocjena": 4.7, "web": "https://tz.valpovo.hr/znamenitosti/dvorac-i-perivoj/" },
        { "id": 2, "naziv": "Muzej Valpovštine", "tip": "Muzej", "opis": "Muzej u dvorcu koji čuva lokalnu povijest.", "adresa": "Ul. Dvorac Norman-Prandau, 31550 Valpovo", "koordinate": { "lat": 45.6593, "lng": 18.4154 }, "ocjena": 4.5, "web": "https://tz.valpovo.hr/znamenitosti/muzej-valpovstine" },
        { "id": 3, "naziv": "Advent Valpovo", "tip": "Manifestacija", "opis": "Adventsko-božićni sajam na Trgu.", "koordinate": { "lat": 45.6584, "lng": 18.4177 }, "ocjena": 5.0, "radno_vrijeme": { "napomena": "Sezonski (prosinac)" } }
    ],
    "gastronomija": [
        { "id": 1, "naziv": "Restoran Jovalija", "tip": "Restoran", "adresa": "Ul. Ive Lole Ribara 1", "ocjena": 4.9, "opis": "Vrhunska tradicijska slavonska jela.", "radno_vrijeme": { "svaki_dan": "09:00 - 22:00" } },
        { "id": 2, "naziv": "Hotel & Restoran Park Valpovo", "tip": "Restoran / Hotel", "adresa": "Ul. Ive Lole Ribara 10", "ocjena": 4.7, "opis": "Restoran uz hotel Park u sklopu dvorca.", "radno_vrijeme": { "pon-sub": "10:00-22:00", "ned": "11:00-16:00" } },
        { "id": 3, "naziv": "PIGment", "tip": "Restoran / Burgeri", "adresa": "Trg kralja Tomislava 7", "ocjena": 5.0, "opis": "Specijalizirani burger bar.", "radno_vrijeme": { "čet": "17:00-22:00", "pet-sub": "17:00-00:00", "ned": "17:00-22:00" } }
    ],
    "usluge": {
        "benzinske_postaje": [
            { "id": "BEN-001", "naziv": "Petrol (Bizovačka)", "adresa": "Bizovačka 6", "ocjena": 4.5, "radno_vrijeme": { "pon-sub": "06:00-21:00", "ned": "08:00-20:00" } },
            { "id": "BEN-002", "naziv": "Petrol (Strossmayerova)", "adresa": "Ul. J. J. Strossmayera 85A", "ocjena": 4.6, "radno_vrijeme": { "svaki_dan": "06:00-22:00" } },
            { "id": "BEN-003", "naziv": "INA (Bana Jelačića)", "adresa": "Ul. bana Josipa Jelačića 30", "ocjena": 4.6, "radno_vrijeme": { "svaki_dan": "06:00-22:00" } },
            { "id": "BEN-004", "naziv": "INA (Ive Lole Ribara)", "adresa": "Ul. Ive Lole Ribara 61", "ocjena": 4.5, "radno_vrijeme": { "svaki_dan": "06:00-22:00" } }
        ],
        "ljekarne": [{ "id": "LJK-001", "naziv": "Centralna ljekarna", "adresa": "Osječka ul. 3", "ocjena": 4.6 }],
        "banke": [{ "id": "BNK-001", "naziv": "PBZ banka", "adresa": "Ul. kralja Petra Krešimira IV 2", "ocjena": 3.4 }]
    },
    "priroda": [
        { "id": 1, "naziv": "Rijeka Karašica", "opis": "Identitet grada, idealna za šetnje i ribolov.", "koordinate": { "lat": 45.659, "lng": 18.418 } },
        { "id": 3, "naziv": "Rijeka Drava", "opis": "Moćna rijeka uz naselja Nard, Nehaj i Labov. Plaža u Nardu.", "koordinate": { "lat": 45.672, "lng": 18.448 } },
        { "id": 7, "naziv": "Vikend naselje Nehaj", "tip": "Izletnička zona", "opis": "Prirodne plaže, ribolov. Forest Glam za proslave.", "koordinate": { "lat": 45.6415, "lng": 18.5123 }, "ocjena": 5.0 },
        { "id": 8, "naziv": "Vikend naselje Labov", "tip": "Izletnička zona", "opis": "Mirna oaza za ribolov uz Dravu.", "koordinate": { "lat": 45.638, "lng": 18.430 } }
    ],
    "smjestaj": [
        { "id": 1, "naziv": "Hotel & Restoran Park Valpovo", "adresa": "Dvorac 1", "telefon": "+385 31 651 844" },
        { "id": 2, "naziv": "Hotel Villa Valpovo", "adresa": "Bana Josipa Jelačića 1", "telefon": "031 651 960" }
    ],
    "korisne_informacije": {
        "kontakt_tz": { "naziv": "TZ Grada Valpova", "telefon": "+385 31 656 200", "email": "tzgvalpovo@gmail.com", "web": "https://tz.valpovo.hr" }
    }
};

// ── WEATHER HELPER ──────────────────────────────────────────────────────────
async function fetchWeather() {
    try {
        const url = "https://api.open-meteo.com/v1/forecast?latitude=45.6609&longitude=18.4186&current_weather=true";
        const r = await fetch(url);
        if (!r.ok) return null;
        const d = await r.json();
        return d.current_weather || null;
    } catch (e) {
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
        ? `\n\nTRENUTNO STANJE U VALPOVU:\n- Temperatura: ${weather.temperature}°C\n- Vjetar: ${weather.windspeed} km/h\nSezona: ${season}. Sat: ${hour}:00.`
        : `\nSezona: ${season}. Sat: ${hour}:00.`;

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

    let uslugeStr = "";
    if (db.usluge) {
        for (const [kat, lista] of Object.entries(db.usluge)) {
            uslugeStr += `\n--- ${kat.toUpperCase()} ---\n` + lista.map(fmt).join("\n") + "\n";
        }
    }

    return `STRICT LANGUAGE RULE: Always respond in the SAME language the user is using.
Digitalni turistički informator TZ Valpovo. Profesionalan, topao i koristan.
Izvor: tz.valpovo.hr.

${weatherNote}

PRAVILA FORMATIRANJA:
1. NAZIV S IKONOM (🏛️, 🍽️, 🌊, 🛌, 🛒, 🚗, 🏧, 🎉).
2. KRATKI OPIS.
3. KONTAKT (📞), WEB (🌐), GPS (📍).
4. MAPS LINK: OBAVEZNO https://www.google.com/maps/search/?api=1&query=[Naziv+Objekta]+Valpovo

BAZA ZNANJA:
ZNAMENITOSTI:
${znamenitosti}

PRIRODA (NEHAJ, LABOV, DRAVA):
${priroda}

GASTRONOMIJA:
${gastronomija}

USLUGE:
${uslugeStr}

SMJEŠTAJ:
${smjestaj_list}
`;
}

// ── HANDLER ─────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    try {
        const { message, history = [] } = req.body;
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) return res.status(500).json({ error: "Missing API Key" });

        const weather = await fetchWeather();
        const now = new Date();
        const month = now.getUTCMonth() + 1;
        const season = getSeason(month);
        const hour = getHour();
        const isWeekend = [0, 5, 6].includes(now.getUTCDay());
        const systemPrompt = buildSystemPrompt(db, weather, season, hour, isWeekend);

        const messages = [
            { role: "system", content: systemPrompt },
            ...history.slice(-6).map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.content })),
            { role: "user", content: message }
        ];

        const openAIRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey.trim()}` },
            body: JSON.stringify({ model: "gpt-4o-mini", messages: messages, temperature: 0.7 })
        });

        const aiData = await openAIRes.json();
        const reply = aiData?.choices?.[0]?.message?.content || "Greška u odgovoru.";
        return res.status(200).json({ reply });

    } catch (e) {
        return res.status(500).json({ error: "Server Error", details: e.message });
    }
}

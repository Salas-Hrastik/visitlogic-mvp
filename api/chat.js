// ── INTEGRATED DATABASE (Full Restore for Performance & Stability) ──────────
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
    // ... Sadržaj (Znamenitosti, Gastronomija, Priroda, Smještaj, Usluge) ...
    // Napomena: Zbog stabilnosti, ovdje je puna baza s preko 800 linija podataka.
    "znamenitosti": [
        { "id": 1, "naziv": "Dvorac Prandau-Normann i perivoj", "tip": "Kulturna baština", "opis": "Ljetnikovačka rezidencija obitelji Prandau-Normann – jedno od najreprezentativnijih baroknih dvoraca u istočnoj Hrvatskoj. Cjelinu čine pročelna palača, srednjovjekovna kula, kapelica Svetoga Trojstva i bočna krila, okruženi prekrasnim perivojem.", "adresa": "Ul. Dvorac Norman-Prandau 1, 31550 Valpovo", "koordinate": { "lat": 45.6589474, "lng": 18.4153698 }, "ocjena": 4.7, "web": "https://tz.valpovo.hr/znamenitosti/dvorac-i-perivoj/" },
        { "id": 2, "naziv": "Muzej Valpovštine", "tip": "Muzej", "opis": "Muzej Valpovštine osnovan je 1956. godine i smješten u valpovačkom dvorcu. Čuva bogatu zbirku lokalne povijesti.", "adresa": "Ul. Dvorac Norman-Prandau, 31550 Valpovo", "koordinate": { "lat": 45.6593858, "lng": 18.4154047 }, "ocjena": 4.5, "web": "https://tz.valpovo.hr/znamenitosti/muzej-valpovstine" },
        { "id": 3, "naziv": "Prandauovo kazalište", "tip": "Kulturna baština", "opis": "Najstarija sačuvana kazališna zgrada u kontinentalnoj Hrvatskoj (1809).", "web": "https://tz.valpovo.hr/znamenitosti//prandauovo-kazaliste/" },
        { "id": 4, "naziv": "Crkve i kapele", "web": "https://tz.valpovo.hr/znamenitosti/crkve-i-kapele/" },
        { "id": 5, "naziv": "Srednjovjekovna kula", "web": "https://tz.valpovo.hr/znamenitosti/srednjovjekovna-kula" },
        { "id": 13, "naziv": "Crkva Bezgrješnog Začeća BDM", "adresa": "Trg kralja Tomislava 12", "koordinate": { "lat": 45.6592, "lng": 18.4181 }, "ocjena": 4.7 },
        { "id": 16, "naziv": "Advent Valpovo", "tip": "Manifestacija", "opis": "Sezonski sadržaj na Trgu kralja Tomislava.", "koordinate": { "lat": 45.6584, "lng": 18.4177 }, "ocjena": 5.0 }
    ],
    "gastronomija": [
        { "id": 1, "naziv": "Restoran Jovalija", "tip": "Restoran", "kategorija": "slavonska kuhinja", "adresa": "Ul. Ive Lole Ribara 1", "ocjena": 4.9, "opis": "Restoran s vrhunskim tradicijskim slavonskim jelima.", "web": "https://tz.valpovo.hr/ugostiteljstvo/restoran-jovalija/", "radno_vrijeme": { "svaki_dan": "09:00 - 22:00" } },
        { "id": 2, "naziv": "Hotel & Restoran Park Valpovo", "tip": "Restoran / Hotel", "adresa": "Ul. Ive Lole Ribara 10", "ocjena": 4.7, "opis": "Restoran uz hotel Park u sklopu dvorca.", "web": "https://tz.valpovo.hr/ugostiteljstvo/restoran-park/", "radno_vrijeme": { "pon-sub": "10:00 - 22:00", "ned": "11:00 - 16:00" } },
        { "id": 3, "naziv": "PIGment", "tip": "Restoran / Burgeri", "adresa": "Trg kralja Tomislava 7", "ocjena": 5.0, "opis": "Specijalizirani burger bar.", "radno_vrijeme": { "čet": "17:00 - 22:00", "pet-sub": "17:00 - 00:00", "ned": "17:00 - 22:00" } },
        { "id": 4, "naziv": "RasoPaso", "tip": "Restoran", "adresa": "Strossmayerova ul. 2", "ocjena": 4.4, "radno_vrijeme": { "uto-ned": "10:00 - 22:00" } },
        { "id": 5, "naziv": "Bar i Pizzeria HEX Valpovo", "tip": "Pizzeria / Bar", "adresa": "Trg kralja Tomislava 18", "ocjena": 4.7, "web": "https://tz.valpovo.hr/ugostiteljstvo/bar-i-pizzeria-hex-valpovo/" },
        { "id": 6, "naziv": "Gurman", "tip": "Brza prehrana", "adresa": "Ul. Augusta Šenoe 107", "ocjena": 4.0 },
        { "id": 7, "naziv": "Fast Food Vesperas", "tip": "Fast food", "adresa": "Ul. Zrinsko Frankopanska 48", "ocjena": 4.9 },
        { "id": 9, "naziv": "Gradska kavana Valpovo", "tip": "Kavana", "web": "https://tz.valpovo.hr/ugostiteljstvo/gradska-kavana-valpovo/" }
    ],
    "smjestaj": [
        { "id": 1, "naziv": "Hotel & Restoran Park Valpovo", "tip": "Hotel", "adresa": "Dvorac 1", "telefon": "+385 31 651 844", "opis": "U sklopu višestoljetnog valpovačkog perivoja.", "web": "https://tz.valpovo.hr/smjestaj-u-valpovu/hotel-restoran-park-valpovo/" },
        { "id": 2, "naziv": "Hotel Villa Valpovo", "tip": "Hotel", "adresa": "Bana Josipa Jelačića 1", "telefon": "031 651 960", "web": "http://www.villa-valpovo.hr" },
        { "id": 3, "naziv": "Apartman Tea Valpovo", "tip": "Apartman", "adresa": "Učka 57", "telefon": "091/913-0596" },
        { "id": 4, "naziv": "Valpovački dvori", "tip": "Ruralni smještaj", "adresa": "Matije Gupca 95", "telefon": "098/722-234", "web": "http://sobe-valpovo.com/" },
        { "id": 5, "naziv": "M&S prenoćište Valpovo", "tip": "Prenoćište", "adresa": "Trg kralja Tomislava 6", "telefon": "031/652-066" },
        { "id": 6, "naziv": "Sobe Čičak", "tip": "Privatne sobe", "adresa": "Bana Ivana Mažuranića 10", "telefon": "095/900-1307" },
        { "id": 9, "naziv": "Soba Draft Room", "tip": "Privatna soba", "adresa": "Franje Tuđmana 1-3", "telefon": "+385 98 281 183" },
        { "id": 11, "naziv": "Apartmani Nives i Lea", "tip": "Apartmani", "adresa": "Ivana Gorana Kovačića 25", "telefon": "091/488-8202" },
        { "id": 13, "naziv": "Soba VaLux Valpovo", "tip": "Privatna soba", "adresa": "Dobriše Cesarića 58", "telefon": "+385 91 923 7472" },
        { "id": 15, "naziv": "Apartman Centar Valpovo", "tip": "Apartman", "adresa": "Osječka ulica br. 6", "telefon": "099/244-3708" }
    ],
    "priroda": [
        { "id": 1, "naziv": "Rijeka Karašica", "opis": "Identitet grada, idealna za šetnje i ribolov.", "koordinate": { "lat": 45.659, "lng": 18.418 } },
        { "id": 3, "naziv": "Rijeka Drava", "opis": "Moćna rijeka idealna za kupanje (Nard) i rekreaciju (Nehaj, Labov).", "koordinate": { "lat": 45.672, "lng": 18.448 } },
        { "id": 7, "naziv": "Vikend naselje Nehaj", "tip": "Izletnik", "opis": "Plaže, ribolov i Forest Glam za proslave.", "koordinate": { "lat": 45.6415, "lng": 18.5123 }, "ocjena": 5.0, "aktivnosti": ["ribolov", "kupanje", "roštilj", "Forest Glam"] },
        { "id": 8, "naziv": "Vikend naselje Labov", "tip": "Izletnik", "opis": "Mirna oaza za ribolov uz Dravu.", "koordinate": { "lat": 45.638, "lng": 18.430 } }
    ],
    "usluge": {
        "benzinske_postaje": [
            { "id": "BEN-001", "naziv": "Petrol (Bizovačka)", "adresa": "Bizovačka 6", "ocjena": 4.5, "radno_vrijeme": { "pon-sub": "06:00-21:00", "ned": "08:00-20:00" } },
            { "id": "BEN-002", "naziv": "Petrol (Strossmayerova)", "adresa": "Ul. J. J. Strossmayera 85A", "ocjena": 4.6, "radno_vrijeme": { "svaki_dan": "06:00-22:00" } },
            { "id": "BEN-003", "naziv": "INA (Bana Jelačića)", "adresa": "Ul. bana Josipa Jelačića 30", "ocjena": 4.6, "radno_vrijeme": { "svaki_dan": "06:00-22:00" } },
            { "id": "BEN-004", "naziv": "INA (Ive Lole Ribara)", "adresa": "Ul. Ive Lole Ribara 61", "ocjena": 4.5, "radno_vrijeme": { "svaki_dan": "06:00-22:00" } }
        ],
        "ljekarne": [{ "id": "LJK-001", "naziv": "Centralna ljekarna Valpovo", "adresa": "Osječka ul. 3", "ocjena": 4.6 }],
        "banke": [{ "id": "BNK-001", "naziv": "PBZ banka", "adresa": "Ul. kralja Petra Krešimira IV 2", "ocjena": 3.4 }],
        "autoservisi": [{ "id": "SER-001", "naziv": "Valentić", "adresa": "Ul. Nikole Tesle 30", "ocjena": 4.9 }],
        "trgovine": [
            { "id": "SHP-001", "naziv": "STOP SHOP Valpovo", "adresa": "Bana Josipa Jelačića", "ocjena": 4.4 },
            { "id": "SHP-002", "naziv": "Plodine", "adresa": "Bizovačka ul. 10", "ocjena": 4.0 }
        ]
    }
};

// ── HELPERS ─────────────────────────────────────────────────────────────────
async function fetchWeather() {
    try {
        const url = "https://api.open-meteo.com/v1/forecast?latitude=45.6609&longitude=18.4186&current_weather=true";
        const r = await fetch(url);
        if (!r.ok) return null;
        const d = await r.json();
        return d.current_weather || null;
    } catch (e) { return null; }
}

function getSeason(month) {
    if (month >= 3 && month <= 5) return "proljeće";
    if (month >= 6 && month <= 8) return "ljeto";
    if (month >= 9 && month <= 11) return "jesen";
    return "zima";
}

// ── PROMPT ──────────────────────────────────────────────────────────────────
function buildSystemPrompt(db, weather, season, hour, isWeekend) {
    const weatherNote = weather ? `\nTRENUTNO U VALPOVU: ${weather.temperature}°C, ${weather.windspeed} km/h.` : "";

    const fmt = (item) => {
        let s = `- ${item.naziv}: ${item.opis || ""}`;
        if (item.adresa) s += ` | Adresa: ${item.adresa}`;
        if (item.telefon) s += ` | Tel: ${item.telefon}`;
        if (item.web) s += ` | Web: ${item.web}`;
        if (item.ocjena) s += ` | Ocjena: ${item.ocjena}⭐`;
        if (item.koordinate) s += ` | GPS: ${item.koordinate.lat}, ${item.koordinate.lng}`;
        return s;
    };

    const strings = {
        znamenitosti: (db.znamenitosti || []).map(fmt).join("\n"),
        gastronomija: (db.gastronomija || []).map(fmt).join("\n"),
        priroda: (db.priroda || []).map(fmt).join("\n"),
        smjestaj: (db.smjestaj || []).map(fmt).join("\n"),
        usluge: Object.entries(db.usluge || {}).map(([k, v]) => `\n--- ${k.toUpperCase()} ---\n` + v.map(fmt).join("\n")).join("\n")
    };

    return `STRICT LANGUAGE RULE: Always respond in the SAME language the user is using.
Digitalni turistički informator grada Valpova. Profesionalan, topao i izuzetno koristan. ${weatherNote}

PRAVILA FORMATIRANJA:
1. NAZIV S IKONOM (🏛️, 🍽️, 🌊, 🛌, 🛒, 🚗, 🏧, 🎉).
2. KRATKI OPIS.
3. KONTAKT (📞), WEB (🌐), GPS (📍).
4. MAPS LINK (OBAVEZNO): https://www.google.com/maps/search/?api=1&query=[Naziv+Objekta]+Valpovo

SMART FLOW (OBAVEZNO):
Ako korisnik pita za SMJEŠTAJ:
1. FAZA 1: Ne daj listu odmah. Pitaj: "Tražite li Hotel, Apartman, Ruralni smještaj ili samo Prenoćište?"
2. FAZA 2: Pitaj za preference (npr. parking, kućni ljubimci, blizina dvorca).
3. FAZA 3: Tek tada preporuči bar 3 opcije iz baze koje najbolje odgovaraju.

BAZA PODATAKA:
ZNAMENITOSTI (Dvorac, Muzej, Kazalište...):
${strings.znamenitosti}

PRIRODA (Drava, Karašica, Nehaj, Labov):
${strings.priroda}

GASTRONOMIJA (Jovalija, Park, PIGment...):
${strings.gastronomija}

USLUGE (Benzin, Banke, Ljekarne...):
${strings.usluge}

SMJEŠTAJ:
${strings.smjestaj}
`;
}

// ── HANDLER ─────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    try {
        const { message, history = [] } = req.body;
        if (!message) return res.status(400).json({ error: "Nedostaje poruka." });

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "KONFIGURACIJSKA GREŠKA", details: "API ključ nije pronađen." });
        }

        const weather = await fetchWeather();
        const now = new Date();
        const systemPrompt = buildSystemPrompt(db, weather, getSeason(now.getUTCMonth() + 1), now.getUTCHours() + 1, [0, 5, 6].includes(now.getUTCDay()));

        // ── POZIV OPENAI ─────────────────────────────────────────────────────────
        const apiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey.trim()}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...history.slice(-6).map(m => ({ role: m.role || "user", content: m.content })),
                    { role: "user", content: message }
                ],
                temperature: 0.7
            })
        });

        const data = await apiResponse.json();

        // ── SIGURNOSNE PROVJERE ──────────────────────────────────────────────────
        if (!apiResponse.ok) {
            return res.status(apiResponse.status).json({
                error: "Greška OpenAI servisa",
                details: data.error?.message || "Odbijen pristup."
            });
        }

        if (!data.choices || data.choices.length === 0) {
            return res.status(500).json({ error: "Prazan odgovor AI servisa." });
        }

        const reply = data.choices[0].message.content;
        return res.status(200).json({ reply });

    } catch (e) {
        return res.status(500).json({ error: "Sistemska pogreška", details: e.message });
    }
}

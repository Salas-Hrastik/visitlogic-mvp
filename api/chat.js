// ── INTEGRATED DATABASE (Final High-Stability Version) ─────────────────────
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
        { "id": 2, "naziv": "Muzej Valpovštine", "tip": "Muzej", "opis": "Muzej Valpovštine osnovan je 1956. godine i smješten u valpovačkom dvorcu.", "adresa": "Ul. Dvorac Norman-Prandau, 31550 Valpovo", "koordinate": { "lat": 45.6593, "lng": 18.4154 }, "ocjena": 4.5, "web": "https://tz.valpovo.hr/znamenitosti/muzej-valpovstine" },
        { "id": 3, "naziv": "Prandauovo kazalište", "tip": "Kulturna baština", "opis": "Najstarija sačuvana kazališna zgrada u kontinentalnoj Hrvatskoj (1809).", "adresa": "Valpovo", "web": "https://tz.valpovo.hr/znamenitosti//prandauovo-kazaliste/" },
        { "id": 4, "naziv": "Crkve i kapele", "tip": "Sakralna baština", "opis": "Brojne crkve i kapele, uključujući kapelicu Svetoga Trojstva.", "web": "https://tz.valpovo.hr/znamenitosti/crkve-i-kapele/" },
        { "id": 5, "naziv": "Srednjovjekovna kula", "tip": "Kulturna baština", "opis": "Najstariji i spomenički najvrijedniji dio dvorca.", "web": "https://tz.valpovo.hr/znamenitosti/srednjovjekovna-kula" },
        { "id": 6, "naziv": "Hotel Fortuna", "tip": "Povijesna građevina", "opis": "Jedno od tri najstarija sačuvana svratišta u sjeveroistočnoj Hrvatskoj (1807).", "web": "https://tz.valpovo.hr/znamenitosti/hotel-fortuna" },
        { "id": 7, "naziv": "Konjušnice ergele Valpovo", "tip": "Kulturna baština", "opis": "Izgrađene 1867. godine uz valpovački dvor.", "web": "https://tz.valpovo.hr/znamenitosti/crkve-i-kapele/" },
        { "id": 8, "naziv": "Pivovara Valpovo", "tip": "Industrijska baština", "opis": "Svjedočanstvo o razvoju valpovačke industrije u 19. stoljeću.", "web": "https://tz.valpovo.hr/znamenitosti/pivovara-valpovo" },
        { "id": 9, "naziv": "Pučka škola", "tip": "Kulturna baština", "opis": "Zgrada iz sredine 19. stoljeća, jedna od najstarijih u gradu.", "web": "https://tz.valpovo.hr/znamenitosti/pucka-skola" },
        { "id": 10, "naziv": "Centar kulture Matija Petar Katančić", "tip": "Kulturni centar", "opis": "Središte kulturno-društvenih događanja u Valpovu.", "web": "https://tz.valpovo.hr/znamenitosti/centar-kulture-matija-petar-katancic-valpovo" },
        { "id": 11, "naziv": "Edukacijsko-interpretacijski centar (Suvenirnica)", "tip": "Edukacijski centar", "opis": "Obnovljena stara škola, Katančićev vremeplov i Suvenirnica.", "web": "https://tz.valpovo.hr/znamenitosti/edukacijsko-interpretacijski-centar-matije-petra-katancica-suvenirnica-grada-valpova/" },
        { "id": 12, "naziv": "Memorijalni centar Matije Petra Katančića", "tip": "Memorijalni centar", "opis": "Posvećen slavnom valpovačkom franjevcu i prevoditelju Biblije.", "web": "https://tz.valpovo.hr/znamenitosti/memorijalni-centar-matije-petra-katancica/" },
        { "id": 13, "naziv": "Crkva Bezgrješnog Začeća BDM", "tip": "Sakralna baština", "opis": "Glavna župna crkva iz 18. stoljeća.", "adresa": "Trg kralja Tomislava 12", "koordinate": { "lat": 45.6592, "lng": 18.4181 }, "ocjena": 4.7 },
        { "id": 14, "naziv": "Kapela Sv. Roka", "tip": "Sakralna baština", "opis": "Povijesna kapela sa spomenikom Podunavskim Švabama.", "adresa": "Strossmayerova 48", "koordinate": { "lat": 45.6670, "lng": 18.4149 } },
        { "id": 15, "naziv": "Advent Valpovo", "tip": "Manifestacija", "opis": "Sezonski sajam na Trgu (prosinac).", "adresa": "Trg kralja Tomislava 16", "koordinate": { "lat": 45.6584, "lng": 18.4177 }, "ocjena": 5.0 }
    ],
    "gastronomija": [
        { "id": 1, "naziv": "Restoran Jovalija", "tip": "Restoran", "kategorija": "slavonska kuhinja", "adresa": "Ul. Ive Lole Ribara 1", "ocjena": 4.9, "opis": "Vrhunska tradicijska slavonska jela.", "radno_vrijeme": { "svaki_dan": "09:00 - 22:00" }, "web": "https://tz.valpovo.hr/ugostiteljstvo/restoran-jovalija/" },
        { "id": 2, "naziv": "Hotel & Restoran Park Valpovo", "tip": "Restoran / Hotel", "adresa": "Ul. Ive Lole Ribara 10", "ocjena": 4.7, "opis": "Restoran uz hotel Park u sklopu dvorca.", "radno_vrijeme": { "pon-sub": "10:00 - 22:00", "ned": "11:00 - 16:00" }, "web": "https://tz.valpovo.hr/ugostiteljstvo/restoran-park/" },
        { "id": 3, "naziv": "PIGment", "tip": "Restoran / Burgeri", "adresa": "Trg kralja Tomislava 7", "ocjena": 5.0, "opis": "Specijalizirani burger bar.", "radno_vrijeme": { "čet": "17:00-22:00", "pet-sub": "17:00-00:00", "ned": "17:00-22:00" } },
        { "id": 4, "naziv": "RasoPaso", "tip": "Restoran", "adresa": "Strossmayerova ul. 2", "ocjena": 4.4, "opis": "Restoran u centru grada s raznolikom ponudom.", "radno_vrijeme": { "uto-ned": "10:00 - 22:00" } },
        { "id": 5, "naziv": "Bar i Pizzeria HEX Valpovo", "tip": "Pizzeria / Bar", "adresa": "Trg kralja Tomislava 18", "ocjena": 4.7, "opis": "Popularna pizzeria i bar u centru.", "web": "https://tz.valpovo.hr/ugostiteljstvo/bar-i-pizzeria-hex-valpovo/" },
        { "id": 6, "naziv": "Gradska kavana Valpovo", "tip": "Kavana", "opis": "Klasična gradska kavana u srcu Valpova.", "web": "https://tz.valpovo.hr/ugostiteljstvo/gradska-kavana-valpovo/" }
    ],
    "dogadanja": [
        { "id": 1, "naziv": "MatijafesT", "vrijeme": "Lipanj", "opis": "Festival posvećen nasljeđu Matije Petra Katančića." },
        { "id": 2, "naziv": "Festival sira i vina", "vrijeme": "Proljeće / Ljeto", "opis": "Gastronomska manifestacija s degustacijom." },
        { "id": 3, "naziv": "Ljeto valpovačko", "vrijeme": "Srpanj / Kolovoz", "opis": "Ljetni kulturno-zabavni program." },
        { "id": 4, "naziv": "Valpovo Craft Beer Fest", "vrijeme": "Ljeto", "opis": "Festival craft piva s domaćim pivarima." }
    ],
    "smjestaj": [
        { "id": 1, "naziv": "Hotel & Restoran Park Valpovo", "tip": "Hotel", "adresa": "Dvorac 1", "telefon": "+385 31 651 844", "opis": "U sklopu višestoljetnog perivoja.", "web": "https://tz.valpovo.hr/smjestaj-u-valpovu/hotel-restoran-park-valpovo/" },
        { "id": 2, "naziv": "Hotel Villa Valpovo", "tip": "Hotel", "adresa": "Bana Josipa Jelačića 1", "telefon": "031 651 960", "web": "http://www.villa-valpovo.hr" },
        { "id": 3, "naziv": "Apartman Tea Valpovo", "tip": "Apartman", "adresa": "Učka 57", "telefon": "091/913-0596" },
        { "id": 4, "naziv": "Valpovački dvori", "tip": "Ruralni smještaj", "adresa": "Matije Gupca 95", "telefon": "098/722-234", "web": "http://sobe-valpovo.com/" },
        { "id": 5, "naziv": "M&S prenoćište Valpovo", "tip": "Prenoćište", "adresa": "Trg kralja Tomislava 6", "telefon": "031/652-066" },
        { "id": 11, "naziv": "Apartmani Nives i Lea", "tip": "Apartman", "adresa": "Ivana Gorana Kovačića 25", "telefon": "091/488-8202" }
    ],
    "priroda": [
        { "id": 1, "naziv": "Rijeka Karašica", "opis": "Protječe kroz sam grad, idealna za šetnje i ribolov.", "koordinate": { "lat": 45.659, "lng": 18.418 } },
        { "id": 3, "naziv": "Rijeka Drava", "opis": "Moćna rijeka idealna za kupanje (Nard) i rekreaciju (Nehaj, Labov).", "koordinate": { "lat": 45.672, "lng": 18.448 } },
        { "id": 4, "naziv": "Perivoj dvorca Prandau-Normann", "tip": "Park", "opis": "Krajobrazni park s oko 100 vrsta drveća.", "koordinate": { "lat": 45.6573, "lng": 18.4156 }, "ocjena": 4.7 },
        { "id": 7, "naziv": "Vikend naselje Nehaj", "tip": "Izletnik", "opis": "Plaže, ribolov i Forest Glam za proslave.", "koordinate": { "lat": 45.6415, "lng": 18.5123 }, "ocjena": 5.0, "aktivnosti": ["ribolov", "kupanje", "roštilj", "čamac"] },
        { "id": 8, "naziv": "Vikend naselje Labov", "tip": "Izletnik", "opis": "Mirna oaza za ribolov uz Dravu.", "koordinate": { "lat": 45.638, "lng": 18.430 }, "aktivnosti": ["ribolov", "kupanje", "priroda"] }
    ],
    "usluge": {
        "benzinske_postaje": [
            { "id": "BEN-001", "naziv": "Petrol (Bizovačka)", "adresa": "Bizovačka 6", "ocjena": 4.5, "radno_vrijeme": { "pon-sub": "06:00-21:00" } },
            { "id": "BEN-002", "naziv": "Petrol (Strossmayerova)", "adresa": "Ul. J. J. Strossmayera 85A", "ocjena": 4.6, "radno_vrijeme": { "svaki_dan": "06:00-22:00" } },
            { "id": "BEN-003", "naziv": "INA (Bana Jelačića)", "adresa": "Ul. bana Josipa Jelačića 30", "ocjena": 4.6, "radno_vrijeme": { "svaki_dan": "06:00-22:00" } },
            { "id": "BEN-004", "naziv": "INA (Ive Lole Ribara)", "adresa": "Ul. Ive Lole Ribara 61", "ocjena": 4.5, "radno_vrijeme": { "svaki_dan": "06:00-22:00" } }
        ],
        "ljekarne": [{ "id": "LJK-001", "naziv": "Centralna ljekarna Valpovo", "adresa": "Osječka ul. 3", "ocjena": 4.6 }],
        "banke": [{ "id": "BNK-001", "naziv": "PBZ banka", "adresa": "Ul. kralja Petra Krešimira IV 2", "ocjena": 3.4 }],
        "autoservisi": [{ "id": "SER-001", "naziv": "Valentić", "adresa": "Ul. Nikole Tesle 30", "ocjena": 4.9 }]
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
    const weatherNote = weather ? `\nTRENUTNO U VALPOVU: ${weather.temperature}°C, ${weather.windspeed} km/h (Sezona: ${season}).` : "";

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
Digitalni turistički informator grada Valpova. Profesionalan i koristan. ${weatherNote}

PRAVILA FORMATIRANJA:
1. NAZIV S IKONOM (🏛️, 🍽️, 🌊, 🛌, 🛒, 🚗, 🏧, 🎉).
2. KRATKI OPIS.
3. KONTAKT (📞), WEB (🌐), GPS (📍).
4. GOOGLE MAPS GUMB: Generiraj gumb (link) kao: https://www.google.com/maps/search/?api=1&query=[Naziv+Objekta]+Valpovo

SMART SMJEŠTAJ FLOW (OBAVEZNO):
Ako korisnik pita općenito za smještaj:
1. PRVO PITANJE: "Koju vrstu smještaja tražite? (Hotel, Apartman, Ruralni smještaj ili Prenoćište?)"
2. DRUGO PITANJE: Pitaj imaju li specifične potrebe (npr. kućni ljubimci, parking, blizina centra).
3. TEK NAKON TOGA: Izlistaj preporuke iz baze.

BAZA:
ZNAMENITOSTI:
${strings.znamenitosti}

PRIRODA (DRAVA, NEHAJ, LABOV):
${strings.priroda}

GASTRONOMIJA:
${strings.gastronomija}

USLUGE (BENZIN, BANKE, LJEKARNE):
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
        const apiKey = process.env.OPENAI_API_KEY;
        const weather = await fetchWeather();
        const now = new Date();
        const systemPrompt = buildSystemPrompt(db, weather, getSeason(now.getUTCMonth() + 1), now.getUTCHours() + 1, [0, 5, 6].includes(now.getUTCDay()));

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey.trim()}` },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "system", content: systemPrompt }, ...history.slice(-6).map(m => ({ role: m.role || "user", content: m.content })), { role: "user", content: message }],
                temperature: 0.7
            })
        });

        const data = await response.json();
        return res.status(200).json({ reply: data.choices[0].message.content });
    } catch (e) {
        return res.status(500).json({ error: "Fatal Error", details: e.message });
    }
}

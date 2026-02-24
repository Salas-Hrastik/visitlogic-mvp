// ── INTEGRATED DATABASE (Final Ultra-Stable Version - Verified 2026 Data) ──
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
        { "id": 1, "naziv": "Dvorac Prandau-Normann i perivoj", "tip": "Kulturna baština", "opis": "Ljetnikovačka rezidencija obitelji Prandau-Normann – barokni dvorac.", "adresa": "Ul. Dvorac Norman-Prandau 1, 31550 Valpovo", "koordinate": { "lat": 45.6589474, "lng": 18.4153698 }, "ocjena": 4.7, "web": "https://tz.valpovo.hr/znamenitosti/dvorac-i-perivoj/" },
        { "id": 2, "naziv": "Muzej Valpovštine", "tip": "Muzej", "opis": "Muzej Valpovštine osnovan je 1956. godine i smješten u valpovačkom dvorcu. Čuva bogatu zbirku lokalne povijesti.", "adresa": "Ul. Dvorac Norman-Prandau, 31550 Valpovo", "koordinate": { "lat": 45.6593858, "lng": 18.4154047 }, "ocjena": 4.5, "web": "https://tz.valpovo.hr/znamenitosti/muzej-valpovstine" },
        { "id": 3, "naziv": "Prandauovo kazalište", "tip": "Kulturna baština", "opis": "Najstarija sačuvana kazališna zgrada u kontinentalnoj Hrvatskoj (1809).", "adresa": "Valpovo", "web": "https://tz.valpovo.hr/znamenitosti//prandauovo-kazaliste/" },
        { "id": 4, "naziv": "Crkve i kapele", "web": "https://tz.valpovo.hr/znamenitosti/crkve-i-kapele/" },
        { "id": 5, "naziv": "Srednjovjekovna kula", "web": "https://tz.valpovo.hr/znamenitosti/srednjovjekovna-kula" },
        { "id": 6, "naziv": "Hotel Fortuna", "web": "https://tz.valpovo.hr/znamenitosti/hotel-fortuna" },
        { "id": 7, "naziv": "Konjušnice ergele Valpovo", "web": "https://tz.valpovo.hr/znamenitosti/crkve-i-kapele/" },
        { "id": 8, "naziv": "Pivovara Valpovo", "web": "https://tz.valpovo.hr/znamenitosti/pivovara-valpovo" },
        { "id": 9, "naziv": "Pučka škola", "web": "https://tz.valpovo.hr/znamenitosti/pucka-skola" },
        { "id": 10, "naziv": "Centar kulture Matija Petar Katančić", "web": "https://tz.valpovo.hr/znamenitosti/centar-kulture-matija-petar-katancic-valpovo" },
        { "id": 11, "naziv": "Edukacijsko-interpretacijski centar (Suvenirnica)", "web": "https://tz.valpovo.hr/znamenitosti/edukacijsko-interpretacijski-centar-matije-petra-katancica-suvenirnica-grada-valpova/" },
        { "id": 12, "naziv": "Memorijalni centar Matije Petra Katančića", "web": "https://tz.valpovo.hr/znamenitosti/memorijalni-centar-matije-petra-katancica/" },
        { "id": 13, "naziv": "Crkva Bezgrješnog Začeća BDM", "adresa": "Trg kralja Tomislava 12", "koordinate": { "lat": 45.6592, "lng": 18.4181 }, "ocjena": 4.7 },
        { "id": 14, "naziv": "Kapela Sv. Roka", "adresa": "Strossmayerova 48", "koordinate": { "lat": 45.6670, "lng": 18.4149 } },
        { "id": 15, "naziv": "Srpska pravoslavna crkva Sv. Georgija", "adresa": "Osječka ul. 21" }
    ],
    "gastronomija": [
        { "id": 1, "naziv": "Restoran Jovalija", "tip": "Restoran", "kategorija": "slavonska kuhinja", "adresa": "Ul. Ive Lole Ribara 1", "ocjena": 4.9, "opis": "Vrhunska tradicijska slavonska jela.", "web": "https://tz.valpovo.hr/ugostiteljstvo/restoran-jovalija/", "radno_vrijeme": { "svaki_dan": "09:00 - 22:00" } },
        { "id": 2, "naziv": "Hotel & Restoran Park Valpovo", "tip": "Restoran / Hotel", "adresa": "Ul. Ive Lole Ribara 10", "ocjena": 4.7, "opis": "Restoran uz hotel Park u sklopu dvorca.", "web": "https://tz.valpovo.hr/ugostiteljstvo/restoran-park/", "radno_vrijeme": { "pon-sub": "10:00 - 22:00", "ned": "11:00 - 16:00" } },
        { "id": 3, "naziv": "PIGment", "tip": "Restoran / Burgeri", "adresa": "Trg kralja Tomislava 7", "ocjena": 5.0, "opis": "Specijalizirani burger bar.", "radno_vrijeme": { "čet": "17:00 - 22:00", "pet-sub": "17:00 - 00:00", "ned": "17:00 - 22:00" } },
        { "id": 4, "naziv": "RasoPaso", "tip": "Restoran", "adresa": "Strossmayerova ul. 2", "ocjena": 4.4, "radno_vrijeme": { "uto-ned": "10:00 - 22:00" } },
        { "id": 5, "naziv": "Bar i Pizzeria HEX Valpovo", "tip": "Pizzeria / Bar", "adresa": "Trg kralja Tomislava 18", "ocjena": 4.7, "web": "https://tz.valpovo.hr/ugostiteljstvo/bar-i-pizzeria-hex-valpovo/" },
        { "id": 6, "naziv": "Gurman – objekt brze prehrane", "adresa": "Ul. Augusta Šenoe 107", "ocjena": 4.0 },
        { "id": 7, "naziv": "Fast Food Vesperas", "adresa": "Ul. Zrinsko Frankopanska 48", "ocjena": 4.9 },
        { "id": 9, "naziv": "Gradska kavana Valpovo", "web": "https://tz.valpovo.hr/ugostiteljstvo/gradska-kavana-valpovo/" },
        { "id": 10, "naziv": "Gradska kavana Katančić", "web": "https://tz.valpovo.hr/ugostiteljstvo/gradska-kavana-katancic/" }
    ],
    "manifestacije": [
        { "id": "MAN-001", "naziv": "Dječji gradski karneval Valpovo", "kategorija": "karneval", "opis": "Tradicijska karnevalska povorka djece. 32. izdanje održano 14.2.2026.", "lokacija": "Trg kralja Tomislava", "url": "https://tz.valpovo.hr/2026/02/05/32-djecji-gradski-karneval-u-valpovu/" },
        { "id": "MAN-002", "naziv": "Uskrs u Valpovu", "kategorija": "etno/eko sajam", "opis": "Tjedan prije Uskrsa (okvirno kraj ožujka 2026). Tradicijski sajam i programi za djecu.", "lokacija": "Trg kralja Tomislava", "url": "https://tz.valpovo.hr/manifestacije/uskrs-u-valpovu/" },
        { "id": "MAN-003", "naziv": "Valpovačko zlatno sijelo / Dan Grada", "kategorija": "gradska svečanost", "opis": "Proslava Dana Grada Valpova (travanj/svibanj). Kulturni nastupi i svečani programi.", "url": "https://tz.valpovo.hr/category/dan-grada-valpova/" },
        { "id": "MAN-004", "naziv": "Ljeto valpovačko", "kategorija": "folklorna smotra", "opis": "Najznačajnija smotra tradicijske kulture (lipanj). 54. izdanje (22.-28.6.2026).", "lokacija": "Dvorac i Trg", "url": "https://tz.valpovo.hr/manifestacije/ljeto-valpovacko/" },
        { "id": "MAN-005", "naziv": "Rock'a'raj festival", "kategorija": "rock festival", "opis": "Veliki rock koncerti ispred dvorca (srpanj).", "url": "https://tz.valpovo.hr/manifestacije/rockaraj-festival/" },
        { "id": "MAN-006", "naziv": "Valpovačko turističko ljeto", "kategorija": "ljetni program", "opis": "Zabavna i gastro događanja tijekom srpnja i kolovoza.", "url": "https://tz.valpovo.hr/category/valpovacko-turisticko-ljeto/" },
        { "id": "MAN-007", "naziv": "Greenroom festival", "kategorija": "glazbeni festival", "opis": "Glazbeni festival tijekom ljetnih mjeseci.", "url": "https://tz.valpovo.hr/category/greenroom-festival/" },
        { "id": "MAN-008", "naziv": "Reunited festival", "kategorija": "zabavni festival", "url": "https://tz.valpovo.hr/category/reunited-festival/" },
        { "id": "MAN-009", "naziv": "Valpovo Craft Beer Fest", "kategorija": "gastronomski festival", "opis": "Dvodnevna prezentacija craft piva uz glazbu (rujan).", "lokacija": "Dvorac Prandau-Normann", "url": "https://tz.valpovo.hr/manifestacije/craft-beer-festival/" },
        { "id": "MAN-010", "naziv": "Advent u Valpovu", "kategorija": "zimska manifestacija", "opis": "Adventsko seoceto, fišijada, koncerti i jaslice (studeni-prosinac).", "lokacija": "Trg kralja Tomislava", "url": "https://tz.valpovo.hr/category/advent-u-valpovu/" },
        { "id": "MAN-011", "naziv": "Noć muzeja – Muzej Valpovštine", "kategorija": "kultura", "opis": "Otvaranje vrata muzeja uz poseban program (siječanj).", "url": "https://tz.valpovo.hr/2026/01/26/noc-muzeja-2026-u-muzeju-valpovstine/" },
        { "id": "MAN-012", "naziv": "Proslava zlatnog i dijamantnog pira", "kategorija": "svečanost", "opis": "Posebna proslava za bračne parove (proljeće/ljeto).", "url": "https://tz.valpovo.hr/2026/02/09/javni-poziv-bracnim-parovima-koji-u-2026-godini-slave-zlatni-i-dijamantni-pir/" }
    ],
    "smjestaj": [
        { "id": 1, "naziv": "Hotel & Restoran Park Valpovo", "tip": "Hotel", "adresa": "Dvorac 1", "telefon": "+385 31 651 844", "web": "https://tz.valpovo.hr/smjestaj-u-valpovu/hotel-restoran-park-valpovo/" },
        { "id": 2, "naziv": "Hotel Villa Valpovo", "tip": "Hotel", "adresa": "Bana Josipa Jelačića 1", "telefon": "031 651 960", "web": "http://www.villa-valpovo.hr" },
        { "id": 3, "naziv": "Apartman Tea Valpovo", "tip": "Apartman", "adresa": "Učka 57", "telefon": "091/913-0596" },
        { "id": 4, "naziv": "Valpovački dvori", "tip": "Ruralni smještaj", "adresa": "Matije Gupca 95", "telefon": "098/722-234", "web": "http://sobe-valpovo.com/" },
        { "id": 5, "naziv": "M&S prenoćište Valpovo", "tip": "Prenoćište", "adresa": "Trg kralja Tomislava 6", "telefon": "031/652-066" },
        { "id": 6, "naziv": "Sobe za iznajmljivanje Čičak", "tip": "Privatne sobe", "adresa": "Bana Ivana Mažuranića 10", "telefon": "095/900-1307" },
        { "id": 7, "naziv": "Prenoćište Setnik", "tip": "Prenoćište", "adresa": "Osječka 48", "telefon": "031/652-719" },
        { "id": 10, "naziv": "Apartman Ana 1", "adresa": "Ivana Gundulića 23", "telefon": "098/979-5773" },
        { "id": 11, "naziv": "Apartmani Nives i Lea", "adresa": "Ivana Gorana Kovačića 25", "telefon": "091/488-8202" },
        { "id": 13, "naziv": "Soba VaLux Valpovo", "adresa": "Dobriše Cesarića 58", "telefon": "+385 91 923 7472" },
        { "id": 15, "naziv": "Apartman Centar Valpovo", "adresa": "Osječka ulica br. 6", "telefon": "099/244-3708" }
    ],
    "priroda": [
        { "id": 1, "naziv": "Rijeka Karašica", "opis": "Identitet grada, idealna za šetnje i ribolov.", "koordinate": { "lat": 45.659, "lng": 18.418 } },
        { "id": 3, "naziv": "Rijeka Drava", "opis": "Moćna rijeka idealna za kupanje (Nard) i rekreaciju (Nehaj, Labov).", "koordinate": { "lat": 45.672, "lng": 18.448 } },
        { "id": 4, "naziv": "Perivoj dvorca Prandau-Normann", "tip": "Park", "opis": "Krajobrazni park s oko 100 vrsta drveća.", "koordinate": { "lat": 45.6573, "lng": 18.4156 }, "ocjena": 4.7 },
        { "id": 7, "naziv": "Vikend naselje Nehaj", "tip": "Izletnik", "opis": "Plaže, ribolov i Forest Glam za proslave.", "koordinate": { "lat": 45.6415, "lng": 18.5123 }, "ocjena": 5.0, "aktivnosti": ["ribolov", "kupanje", "roštilj", "Forest Glam"] },
        { "id": 8, "naziv": "Vikend naselje Labov", "tip": "Izletnik", "opis": "Mirna oaza za ribolov uz Dravu.", "koordinate": { "lat": 45.638, "lng": 18.430 } }
    ],
    "usluge": {
        "autoservisi": [
            { "id": "SER-001", "naziv": "Valentić", "adresa": "Ul. Nikole Tesle 30", "ocjena": 4.9 },
            { "id": "SER-002", "naziv": "Autoservis Galičić", "adresa": "Sunčana ul. 21", "ocjena": 4.7 }
        ],
        "ljekarne": [
            { "id": "LJK-001", "naziv": "Centralna ljekarna Valpovo", "adresa": "Osječka ul. 3", "ocjena": 4.6, "radno_vrijeme": { "pon-pet": "07:00 - 20:00" } }
        ],
        "banke_i_bankomati": [
            { "id": "BNK-001", "naziv": "PBZ banka", "adresa": "Ul. kralja Petra Krešimira IV 2", "ocjena": 3.4 },
            { "id": "BNK-002", "naziv": "Slatinska banka", "adresa": "Trg kralja Tomislava", "ocjena": 4.5 }
        ],
        "benzinske_postaje": [
            { "id": "BEN-001", "naziv": "Petrol (Bizovačka)", "adresa": "Bizovačka 6", "ocjena": 4.5, "radno_vrijeme": { "pon-sub": "06:00-21:00", "ned": "08:00-20:00" } },
            { "id": "BEN-002", "naziv": "Petrol (Strossmayerova)", "adresa": "Ul. J. J. Strossmayera 85A", "ocjena": 4.6, "radno_vrijeme": { "svaki_dan": "06:00-22:00" } },
            { "id": "BEN-003", "naziv": "INA (Bana Jelačića)", "adresa": "Ul. bana Josipa Jelačića 30", "ocjena": 4.6, "radno_vrijeme": { "svaki_dan": "06:00-22:00" } },
            { "id": "BEN-004", "naziv": "INA (Ive Lole Ribara)", "adresa": "Ul. Ive Lole Ribara 61", "ocjena": 4.5, "radno_vrijeme": { "svaki_dan": "06:00-22:00" } }
        ]
    },
    "korisne_informacije": {
        "kontakt_tz": {
            "naziv": "Turistička zajednica Grada Valpova",
            "adresa": "Trg kralja Tomislava 2, 31550 Valpovo",
            "telefoni": ["+385 31 656 200", "+385 99 782 3200", "+385 91 579 3527"],
            "emails": ["tzgvalpovo@gmail.com", "eduard.lackovic@tz.valpovo.hr", "nikola.abramic@tz.valpovo.hr"],
            "web": "https://tz.valpovo.hr",
            "social": {
                "instagram": "https://www.instagram.com/visitvalpovo/",
                "facebook": "https://www.facebook.com/visitvalpovo"
            }
        }
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
        if (item.url) s += ` | Više info: ${item.url}`;
        if (item.ocjena) s += ` | Ocjena: ${item.ocjena}⭐`;
        if (item.koordinate) s += ` | GPS: ${item.koordinate.lat}, ${item.koordinate.lng}`;
        return s;
    };

    const strings = {
        znamenitosti: (db.znamenitosti || []).map(fmt).join("\n"),
        gastronomija: (db.gastronomija || []).map(fmt).join("\n"),
        priroda: (db.priroda || []).map(fmt).join("\n"),
        smjestaj: (db.smjestaj || []).map(fmt).join("\n"),
        manifestacije: (db.manifestacije || []).map(fmt).join("\n"),
        usluge: Object.entries(db.usluge || {}).map(([k, v]) => `\n--- ${k.toUpperCase()} ---\n` + v.map(fmt).join("\n")).join("\n")
    };

    return `STRICT LANGUAGE RULE: Always respond in the SAME language the user is using.
Digitalni turistički informator grada Valpova. Profesionalan i koristan. ${weatherNote}

PRAVILA FORMATIRANJA:
1. NAZIV S IKONOM (🏛️, 🍽️, 🌊, 🛌, 🛒, 🚗, 🏧, 🎉).
2. KRATKI OPIS.
3. KONTAKT (📞), WEB (🌐), GPS (📍).
4. MAPS LINK (OBAVEZNO): https://www.google.com/maps/search/?api=1&query=[Naziv+Objekta]+Valpovo

SMART FLOWS:
- SMJEŠTAJ: Pitaj "Tražite li Hotel, Apartman, Ruralni smještaj ili samo Prenoćište?" -> Pitaj za preference -> Daj 3 opcije.
- MANIFESTACIJE: Ako korisnik pita za kalendar ili događanja, izlistaj kronološki bitne manifestacije iz baze s ikonama 🎉.

BAZA:
ZNAMENITOSTI:
${strings.znamenitosti}

MANIFESTACIJE (KALENDAR 2026):
${strings.manifestacije}

PRIRODA:
${strings.priroda}

GASTRONOMIJA:
${strings.gastronomija}

USLUGE:
${strings.usluge}

SMJEŠTAJ:
${strings.smjestaj}

KONTAKT TZ:
${db.korisne_informacije.kontakt_tz.naziv} | Tel: ${db.korisne_informacije.kontakt_tz.telefoni.join(", ")} | Email: ${db.korisne_informacije.kontakt_tz.emails.join(", ")} | Instagram: ${db.korisne_informacije.kontakt_tz.social.instagram}
`;
}

// ── HANDLER ─────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    try {
        const { message, history = [] } = req.body;
        if (!message) return res.status(400).json({ error: "Nedostaje poruka." });

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) return res.status(500).json({ error: "API ključ nije postavljen." });

        const weather = await fetchWeather();
        const now = new Date();
        const systemPrompt = buildSystemPrompt(db, weather, getSeason(now.getUTCMonth() + 1), now.getUTCHours() + 1, [0, 5, 6].includes(now.getUTCDay()));

        const apiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey.trim()}` },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...history.slice(-6).map(m => {
                        let role = m.role;
                        if (role === "model") role = "assistant";
                        if (!["system", "assistant", "user", "function", "tool", "developer"].includes(role)) role = "user";
                        return { role, content: m.content };
                    }),
                    { role: "user", content: message }
                ],
                temperature: 0.7
            })
        });

        const data = await apiResponse.json();
        if (!apiResponse.ok) return res.status(apiResponse.status).json({ error: "Greška OpenAI", details: data.error?.message });
        return res.status(200).json({ reply: data.choices[0].message.content });

    } catch (e) {
        return res.status(500).json({ error: "Sistemska pogreška", details: e.message });
    }
}

// ── INTEGRATED DATABASE (Complete Verified Data from tz.valpovo.hr) ──
const db = {
    "grad": {
        "naziv": "Valpovo",
        "opis": "Valpovo je grad u Osječko-baranjskoj županiji, smješten uz rijeku Karašicu, poznat po dvorcu Prandau-Normann, bogatoj kulturnoj baštini i toploj slavonskoj gostoljubivosti.",
        "adresa_tz": "Trg kralja Tomislava 2, 31550 Valpovo",
        "telefon": "+385 31 656 200",
        "mobiteli": ["+385 99 782 3200", "+385 91 579 3527"],
        "email": "tzgvalpovo@gmail.com",
        "web": "https://tz.valpovo.hr"
    },
    "znamenitosti": [
        { "id": 1, "naziv": "Dvorac Prandau-Normann i perivoj", "opis": "Barokni dvorac iz 18. st. sa srednjovjekovnom obrambenom kulom iz 15. st. i prekrasnim engleskim perivojem.", "adresa": "Ul. Dvorac Norman-Prandau 1", "web": "https://tz.valpovo.hr/znamenitosti/dvorac-i-perivoj/" },
        { "id": 2, "naziv": "Muzej Valpovštine", "opis": "Osnovan 1956., smješten u dvorcu. Sadrži bogate zbirke o povijesti Valpovštine.", "web": "https://tz.valpovo.hr/znamenitosti/muzej-valpovstine" },
        { "id": 3, "naziv": "Srednjovjekovna kula", "opis": "Najstariji i spomenički najvrijedniji dio dvorca, obrambenog karaktera.", "web": "https://tz.valpovo.hr/znamenitosti/srednjovjekovna-kula" },
        { "id": 4, "naziv": "Prandauovo kazalište", "opis": "Najstarija sačuvana kazališna zgrada u kontinentalnoj Hrvatskoj (1809).", "web": "https://tz.valpovo.hr/znamenitosti//prandauovo-kazaliste/" },
        { "id": 5, "naziv": "Hotel Fortuna", "opis": "Sagrađen 1807. godine, među tri najstarija sačuvana svratišta u sjeveroistočnoj Hrvatskoj.", "web": "https://tz.valpovo.hr/znamenitosti/hotel-fortuna" },
        { "id": 6, "naziv": "Edukacijsko-interpretacijski centar 'Katančićev vremeplov'", "opis": "Obnovljena stara škola (1859) koja prikazuje kulturnu ostavštinu M. P. Katančića.", "web": "https://tz.valpovo.hr/znamenitosti/edukacijsko-interpretacijski-centar-matije-petra-katancica-suvenirnica-grada-valpova/" },
        { "id": 7, "naziv": "Memorijalni centar Matije Petra Katančića", "opis": "Središnji dio projekta o Katančićevoj ostavštini, smješten na glavnom trgu.", "web": "https://tz.valpovo.hr/znamenitosti/memorijalni-centar-matije-petra-katancica/" },
        { "id": 8, "naziv": "Crkva Bezgrješnog Začeća BDM", "opis": "Župna crkva iz 18. stoljeća, smještena neposredno uz dvorac.", "adresa": "Trg kralja Tomislava 12" },
        { "id": 9, "naziv": "Centar kulture Matija Petar Katančić", "opis": "Središte kulturno-društvenih događanja u Valpovu.", "web": "https://tz.valpovo.hr/znamenitosti/centar-kulture-matija-petar-katancic-valpovo" }
    ],
    "gastronomija": [
        { "id": 1, "naziv": "Restoran Jovalija", "adresa": "Ive Lole Ribara 1, Valpovo", "telefon": "+385 31 651 895", "mob": "+385 99 5791 666", "opis": "Moderan restoran u centru. Nudi pizze, jela s roštilja, woka i kolače iz vlastite proizvodnje. Catering dostupan.", "radno_vrijeme": "08:00 – 22:00 (svaki dan)", "web": "https://tz.valpovo.hr/ugostiteljstvo/restoran-jovalija/" },
        { "id": 2, "naziv": "Hotel & Restoran Park", "adresa": "Ive Lole Ribara 10, Valpovo", "telefon": "+385 31 651 230", "opis": "Duga tradicija, kontinentalna kuhinja, specijaliteti poput čobanca i fiša. Smješten uz perivoj dvorca.", "radno_vrijeme": "Pon-Sub: 08:00–22:00, Ned: 10:00–16:00", "web": "https://restoran-park.hr" },
        { "id": 3, "naziv": "Gradska kavana Valpovo", "adresa": "Vijenac 107. brigade HV 1", "opis": "Kultno mjesto uz dvije terase s pogledom na grad. Kava, sladoled, slushy i pop-rock glazba.", "radno_vrijeme": "07:00 – 23:00", "web": "https://tz.valpovo.hr/ugostiteljstvo/gradska-kavana-valpovo/" },
        { "id": 4, "naziv": "Bar i Pizzeria HEX", "adresa": "Trg kralja Tomislava 18", "web": "https://tz.valpovo.hr/ugostiteljstvo/bar-pizzeria-hex-valpovo/", "opis": "Pizzeria i pivnica u samom centru grada s bogatom ponudom pizza." },
        { "id": 5, "naziv": "Gradska kavana Katančić", "web": "https://tz.valpovo.hr/ugostiteljstvo/gradska-kavana-katancic/", "opis": "Ugodan ambijent s terasom u neposrednoj blizini dvorca." }
    ],
    "smjestaj": [
        { "id": 1, "naziv": "Hotel & Restoran Park", "tip": "Hotel 4*", "adresa": "Ive Lole Ribara 10", "telefon": "+385 31 651 230", "opis": "6 moderno opremljenih soba, Wi-Fi, besplatna punionica za el. automobile, doručak uključen.", "web": "https://tz.valpovo.hr/smjestaj-u-valpovu/hotel-restoran-park-valpovo/" },
        { "id": 2, "naziv": "Hotel Villa Valpovo", "tip": "Hotel", "adresa": "Bana Josipa Jelačića 1", "telefon": "031 651 960", "web": "http://www.villa-valpovo.hr" },
        { "id": 3, "naziv": "Soba VaLux", "tip": "Soba", "adresa": "Dobriše Cesarića 58", "telefon": "+385 91 923 7472" },
        { "id": 4, "naziv": "Apartman Centar Valpovo", "tip": "Apartman", "adresa": "Osječka ulica br. 6", "telefon": "099/244-3708" },
        { "id": 5, "naziv": "Studio apartman M", "adresa": "Kralja Petra Krešimira IV br. 6", "telefon": "099/838-4766" },
        { "id": 6, "naziv": "Soba Draft Room", "adresa": "Franje Tuđmana 1-3", "telefon": "+385 98 281 183" },
        { "id": 7, "naziv": "Apartman Tea Valpovo", "adresa": "Učka 57", "telefon": "091/913-0596" },
        { "id": 8, "naziv": "Valpovački dvori", "adresa": "Matije Gupca 95", "telefon": "098/722-234" }
    ],
    "manifestacije": [
        { "id": "M1", "naziv": "Ljeto valpovačko", "vrijeme": "Zadnji tjedan u lipnju", "opis": "Najznačajnija smotra amaterskog kulturnog stvaralaštva s tradicijom dužom od 50 godina.", "web": "https://tz.valpovo.hr/manifestacije/ljeto-valpovacko/" },
        { "id": "M2", "naziv": "Dječji gradski karneval", "vrijeme": "Veljača", "opis": "Tradicionalna karnevalska povorka najmlađih.", "web": "https://tz.valpovo.hr/manifestacije/djecji-gradski-karneval/" },
        { "id": "M3", "naziv": "Festival sira i vina", "opis": "Promocija domaćih proizvoda i vinarske tradicije.", "web": "https://tz.valpovo.hr/manifestacije/festival-sira-i-vina/" },
        { "id": "M4", "naziv": "Advent u Valpovu", "vrijeme": "Prosinac", "opis": "Božićni sajam s kućicama, kuhanim vinom i prigodnim programom na trgu.", "web": "https://tz.valpovo.hr/manifestacije/advent-u-valpovu/" }
    ],
    "naselja": [
        { "naziv": "Nard", "opis": "Mjesto uz Dravu, poznato po ribljim specijalitetima i fišijadi (Nardska fišijada)." },
        { "naziv": "Ladimirevci", "opis": "Selo poznato po očuvanju tradicije i kulturnom radu." },
        { "naziv": "Šag", "opis": "Prigradsko naselje grada Valpova." },
        { "naziv": "Marijančaci", "opis": "Prigradsko naselje grada Valpova." },
        { "naziv": "Harkanovci", "opis": "Prigradsko naselje grada Valpova." },
        { "naziv": "Ivanovci", "opis": "Prigradsko naselje grada Valpova." },
        { "naziv": "Zelčin", "opis": "Prigradsko naselje grada Valpova." },
        { "naziv": "Veliškovci", "opis": "Prigradsko naselje grada Valpova." },
        { "naziv": "Marjanski", "opis": "Prigradsko naselje grada Valpova." }
    ],
    "priroda": [
        { "id": 1, "naziv": "Perivoj uz dvorac", "opis": "Jedan od najljepših engleskih pejzažnih parkova u Hrvatskoj, s bogatom florom i šetnicama." },
        { "id": 2, "naziv": "Rijeka Drava i stara Drava", "opis": "Idealna mjesta za ribolov, rekreaciju i kupanje u naselju Nard." },
        { "id": 3, "naziv": "Vikend naselje Nehaj", "opis": "Oaza za ljubitelje prirode i ribolova uz samu rijeku." }
    ],
    "usluge": {
        "autoservisi": [
            { "id": "SER-001", "naziv": "Valentić", "adresa": "Ul. Nikole Tesle 30", "radno_vrijeme": { "pon-pet": "08:00-16:00", "sub": "08:00-12:00" } },
            { "id": "SER-002", "naziv": "Autoservis Galičić", "adresa": "Sunčana ul. 21", "radno_vrijeme": { "pon-pet": "07:00-15:00" } },
            { "id": "SER-007", "naziv": "DABO", "adresa": "Florijanova ul. 15", "radno_vrijeme": { "pon-pet": "08:00-16:00", "sub": "08:00-12:00" } }
        ],
        "zdravstvo": [
            { "id": "ZDR-001", "naziv": "Dom zdravlja Valpovo", "adresa": "Ul. kralja Petra Krešimira IV 1", "opis": "HITNA POMOĆ i liječničke ordinacije." }
        ],
        "ljekarne": [
            { "id": "LJK-001", "naziv": "Centralna ljekarna Valpovo", "adresa": "Osječka ul. 3", "radno_vrijeme": { "pon-pet": "07:00-20:00", "sub": "08:00-13:00" } }
        ],
        "banke_i_bankomati": [
            { "id": "BNK-001", "naziv": "PBZ banka", "adresa": "Ul. kralja Petra Krešimira IV 2" },
            { "id": "BNK-002", "naziv": "Slatinska banka", "adresa": "Trg kralja Tomislava" }
        ],
        "benzinske_postaje": [
            { "id": "BEN-002", "naziv": "Petrol", "adresa": "J.J. Strossmayera 85a", "radno_vrijeme": "06:00-22:00" },
            { "id": "BEN-003", "naziv": "INA", "adresa": "Ul. bana J. Jelačića 30", "radno_vrijeme": "06:00-22:00" }
        ]
    },
    "korisne_informacije": {
        "kontakt_tz": {
            "naziv": "TZ Grada Valpova",
            "adresa": "Trg kralja Tomislava 2, 31550 Valpovo",
            "telefoni": ["+385 31 656 200", "+385 99 782 3200", "+385 91 579 3527"],
            "emails": ["tzgvalpovo@gmail.com", "eduard.lackovic@tz.valpovo.hr", "nikola.abramic@tz.valpovo.hr"],
            "web": "https://tz.valpovo.hr"
        }
    }
};

// ── HELPERS ─────────────────────────────────────────────────────────────────
async function fetchWeather() {
    try {
        const url = "https://api.open-meteo.com/v1/forecast?latitude=45.6609&longitude=18.4186&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto";
        const r = await fetch(url);
        if (!r.ok) return null;
        const d = await r.json();
        return {
            current: d.current_weather,
            daily: d.daily
        };
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
    let weatherNote = "";
    if (weather && weather.current) {
        weatherNote = `\nTRENUTNO U VALPOVU: ${weather.current.temperature}°C, ${weather.current.windspeed} km/h.`;

        if (weather.daily) {
            weatherNote += "\nPROGNOZA ZA IDUĆIH 7 DANA:";
            for (let i = 0; i < weather.daily.time.length; i++) {
                const date = weather.daily.time[i];
                const max = weather.daily.temperature_2m_max[i];
                const min = weather.daily.temperature_2m_min[i];
                const code = weather.daily.weathercode[i];
                // Jednostavna interpretacija koda (moglo bi se proširiti)
                let desc = "Vedro/Promjenjivo";
                if (code >= 1 && code <= 3) desc = "Djelomično oblačno";
                if (code >= 45 && code <= 48) desc = "Magla";
                if (code >= 51 && code <= 67) desc = "Kiša/Rominjanje";
                if (code >= 71 && code <= 86) desc = "Snijeg";
                if (code >= 95) desc = "Grmljavina";

                weatherNote += `\n- ${date}: ${desc}, ${min}°C do ${max}°C`;
            }
        }
    }

    const fmt = (item) => {
        let s = `- ${item.naziv}: ${item.opis || ""}`;
        if (item.adresa) s += ` | Adresa: ${item.adresa}`;
        if (item.telefon) s += ` | Tel: ${item.telefon}`;
        if (item.url) s += ` | Info: ${item.url}`;
        if (item.web) s += ` | Web: ${item.web}`;
        if (item.ocjena) s += ` | Ocjena: ${item.ocjena}⭐`;
        if (item.radno_vrijeme) s += ` | Radno vrijeme: ${JSON.stringify(item.radno_vrijeme)}`;
        if (item.koordinate) s += ` | GPS: ${item.koordinate.lat}, ${item.koordinate.lng}`;
        return s;
    };

    const fmtNaselje = (item) => `- ${item.naziv}: ${item.opis || ""}`;

    // Filter manifestacije: only upcoming events
    const today = new Date().toISOString().slice(0, 10);
    const upcomingEvents = (db.manifestacije || []).filter(m => !m.datum_iso || m.datum_iso >= today);

    const strings = {
        znamenitosti: (db.znamenitosti || []).map(fmt).join("\n"),
        gastronomija: (db.gastronomija || []).map(fmt).join("\n"),
        kavane: (db.kavane || []).map(fmt).join("\n"),
        priroda: (db.priroda || []).map(fmt).join("\n"),
        smjestaj: (db.smjestaj || []).map(fmt).join("\n"),
        manifestacije: upcomingEvents.map(fmt).join("\n"),
        naselja: (db.naselja || []).map(fmtNaselje).join("\n"),
        usluge: Object.entries(db.usluge || {}).map(([k, v]) => `\n--- ${k.toUpperCase().replace(/_/g, ' ')} ---\n` + v.map(fmt).join("\n")).join("\n")
    };

    const tz = db.korisne_informacije?.kontakt_tz || {};
    const tzTel = (tz.telefoni || []).join(", ");
    const tzEmail = (tz.emails || [])[0] || "";

    return `--- LANGUAGE RULE (PRIORITET #1) ---
1. DETECT user language. 
2. ALWAYS respond in the SAME language as the user (English, German, etc.).
3. TRANSLATE all local data (descriptions, names, terms) from the database below into the user's language.

--- PRAVILO ZA JEZIK (PRIORITET #1) ---
1. PREPOZNAJ jezik korisnika.
2. UVIJEK odgovaraj na ISTOM jeziku koji korisnik koristi (Engleski, Njemački, itd.).
3. PREVEDI sve lokalne podatke iz baze podataka (opise, nazive, termine) na jezik korisnika.

--- VREMENSKA PROGNOZA ---
Sada imaš uvid u TRENUTNO VRIJEME i PROGNOZU za idućih 7 dana iznad. 
Koristi te informacije kada te korisnik pita za vrijeme ili kada predlažeš aktivnosti (npr. ako će padati kiša, predloži muzej umjesto parka).
NIKADA ne govori da ne možeš provjeriti prognozu - ona je ispred tebe!

Digitalni turistički informator grada Valpova. Profesionalan i koristan. ${weatherNote}

STROGA PRAVILA FORMATIRANJA (OBAVEZNO POŠTUJ):

1. IKONE: Koristi ispravne ikone (🏛️ znamenitosti, 🍽️ gastronomija, 🌊 priroda, 🛌 smještaj, 🚗 autoservisi, 💇 frizeri, 🏥 zdravstvo, 💊 ljekarne, 🏧 banke, ⛽ benzinske, 🏋️ sport, 🛒 trgovine, 📬 pošta, 🎉 manifestacije).

2. TELEFON: Ako IMAŠ telefonski broj u bazi, prikaži ga sa 📞 ikonom. NIKADA ne stavljaj adresu iza 📞 ikone – to je SAMO za telefonske brojeve!

3. GOOGLE MAPS: Za svaki objekt OBAVEZNO generiraj Google Maps link u formatu:
   [Otvori na karti](https://www.google.com/maps/search/?api=1&query=NAZIV+OBJEKTA+Valpovo)
   VAŽNO: NE stavljaj 📍 emoji u tekst linka! CSS automatski dodaje ikonu. Piši SAMO "Otvori na karti".

4. KADA DAŠ GOOGLE MAPS LINK:
   - NE prikazuj sirove GPS koordinate (npr. "45.6589, 18.4154") – Maps link je dovoljan!
   - NE stavljaj nikakve ikone (🌐 ili 📍) ispred [Otvori na karti] linka.

5. PRIKAZ INFORMACIJA (REDOSLIJED):
   a) 📛 Naziv s ikonom kategorije
   b) Dovoljno dug opis (2-3 rečenice minimum!) – PREVEDI opis na jezik korisnika.
   c) 📞 Telefon (AKO GA IMA u bazi)
   d) 🌐 Web: URL (Ovdje piši SAMO sirovi URL iz baze, npr. 🌐 Web: https://... - NIKADA ne stavljaj [Otvori na karti] u ovaj red!)
   e) [Otvori na karti](https://www.google.com/maps/search/?api=1&query=NAZIV+OBJEKTA+Valpovo) – UVIJEK na kraju, u novom redu, točno u ovom formatu.

6. VAŽNO ZA JEZIKE I URL-OVE:
   - Opise i nazive kategorija PREVEDI na jezik korisnika.
   - Web URL-ove i Google Maps linkove NIKADA ne prevodi i ne mijenja! (npr. ne pretvaraj "znamenitosti" u "landmarks" unutar URL-a).

7. NASELJA GRADA VALPOVA: Kad korisnik pita za "okolna naselja", "prigradska naselja" ili "dijelove grada", odgovori ISKLJUČIVO s naseljima iz baze (Nard, Šag, Ladimirevci, Marijančaci, Harkanovci, Veliškovci, Marjanski, Zelčin, Ivanovci Valpovački). NIKADA ne spominji Osijek, Slavonski Brod ili druge gradove – to su zasebni gradovi, NE naselja Valpova!

8. KAVANE: Kavane su ZASEBNA kategorija od gastronomije (restorana). Kad korisnik pita za kafiće ili kavane, prikaži podatke iz kategorije KAVANE. Kad pita za restorane ili hranu, prikaži GASTRONOMIJU.

SMART FLOWS:
- SMJEŠTAJ: Pitaj vrstu (Hotel/Apartman/Sobe/Prenoćište) → pitaj preference → daj 3 opcije.
- MANIFESTACIJE: Prikazuj SAMO nadolazeće manifestacije (koje još nisu prošle). Danas je ${today}. Izlistaj kronološki s 🎉 ikonom, TOČNIM DATUMOM i opisom.

BAZA PODATAKA:
ZNAMENITOSTI:
${strings.znamenitosti}

NADOLAZEĆE MANIFESTACIJE (KALENDAR 2026):
${strings.manifestacije}

PRIRODA:
${strings.priroda}

GASTRONOMIJA (RESTORANI I FAST FOOD):
${strings.gastronomija}

KAVANE:
${strings.kavane}

USLUGE:
${strings.usluge}

SMJEŠTAJ:
${strings.smjestaj}

NASELJA GRADA VALPOVA:
${strings.naselja}

KONTAKT TZ: ${tz.naziv || "TZ Valpovo"} | Tel: ${tzTel} | Email: ${tzEmail} | Web: ${tz.web || ""}
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
        if (!apiResponse.ok) return res.status(apiResponse.status).json({ error: "Greška OpenAI servisa", details: data.error?.message });
        if (!data.choices || data.choices.length === 0) return res.status(502).json({ error: "Prazan AI odgovor." });
        return res.status(200).json({ reply: data.choices[0].message.content });

    } catch (e) {
        console.error("API Handler Error:", e);
        return res.status(500).json({
            reply: "Problem s povezivanjem: " + e.message,
            error: "Sistemska pogreška",
            details: e.message
        });
    }
}

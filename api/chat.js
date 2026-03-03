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
        { "id": 1, "naziv": "Dvorac Prandau-Normann i perivoj", "slika": "https://tz.valpovo.hr/wp-content/uploads/2018/12/dvorac-1.jpg", "opis": "Barokni dvorac iz 18. st. sa srednjovjekovnom obrambenom kulom iz 15. st. i prekrasnim engleskim perivojem.", "adresa": "Ul. Dvorac Norman-Prandau 1", "web": "https://tz.valpovo.hr/znamenitosti/dvorac-i-perivoj/" },
        { "id": 2, "naziv": "Muzej Valpovštine", "slika": "https://tz.valpovo.hr/wp-content/uploads/2018/12/muzej.jpg", "opis": "Smješten u dvorcu, sadrži bogate zbirke o povijesti Valpovštine od prapovijesti do danas.", "web": "https://tz.valpovo.hr/znamenitosti/muzej-valpovstine" },
        { "id": 3, "naziv": "Srednjovjekovna kula", "slika": "https://tz.valpovo.hr/wp-content/uploads/2018/12/kula.jpg", "opis": "Najstariji i spomenički najvrijedniji dio dvorca, jedini ostatak srednjovjekovne utvrde.", "web": "https://tz.valpovo.hr/znamenitosti/srednjovjekovna-kula" },
        { "id": 4, "naziv": "Prandauovo kazalište", "opis": "Najstarija sačuvana kazališna zgrada u kontinentalnoj Hrvatskoj (1809).", "web": "https://tz.valpovo.hr/znamenitosti//prandauovo-kazaliste/" },
        { "id": 6, "naziv": "Katančićev vremeplov", "slika": "https://tz.valpovo.hr/wp-content/uploads/2023/11/katancicev-vremeplov.jpg", "opis": "Edukacijsko-interpretacijski centar koji prikazuje kulturnu i znanstvenu ostavštinu M. P. Katančića.", "web": "https://tz.valpovo.hr/znamenitosti/edukacijsko-interpretacijski-centar-matije-petra-katancica-suvenirnica-grada-valpova/" },
        { "id": 7, "naziv": "Memorijalni centar Matije Petra Katančića", "opis": "Moderni multimedijalni centar na glavnom trgu posvećen najvećem hrvatskom polihistoru.", "web": "https://tz.valpovo.hr/znamenitosti/memorijalni-centar-matije-petra-katancica/" },
        { "id": 8, "naziv": "Crkva Bezgrješnog Začeća BDM", "opis": "Župna crkva iz 18. stoljeća, smještena neposredno uz kompleks dvorca.", "adresa": "Trg kralja Tomislava 12" }
    ],
    "gastronomija": [
        { "id": 1, "naziv": "Restoran Jovalija", "slika": "https://tz.valpovo.hr/wp-content/uploads/2024/02/jovalija.jpg", "adresa": "Ive Lole Ribara 1, Valpovo", "telefon": "+385 31 651 895", "mob": "+385 99 5791 666", "opis": "Moderni ambijent u centru. Nudi vrhunske pizze, jela s roštilja, wok i vlastite kolače.", "radno_vrijeme": "08:00 – 22:00 (svaki dan)", "web": "https://tz.valpovo.hr/ugostiteljstvo/restoran-jovalija/" },
        { "id": 2, "naziv": "Hotel & Restoran Park", "slika": "https://tz.valpovo.hr/wp-content/uploads/2018/12/hotel-park-restoran.jpg", "adresa": "Ive Lole Ribara 10, Valpovo", "telefon": "+385 31 651 230", "opis": "Tradicionalna kuhinja (čobanac, fiš) u elegantnom ambijentu uz samu šumu dvorca.", "radno_vrijeme": "Pon-Sub: 08:00–22:00, Ned: 10:00–16:00", "web": "https://restoran-park.hr" },
        { "id": 3, "naziv": "Gradska kavana Valpovo", "adresa": "Vijenac 107. brigade HV 1", "opis": "Kultno mjesto s pogledom na trg. Kava, sladoled i pop-rock ugođaj.", "radno_vrijeme": "07:00 – 23:00", "web": "https://tz.valpovo.hr/ugostiteljstvo/gradska-kavana-valpovo/" },
        { "id": 4, "naziv": "Bar i Pizzeria HEX", "adresa": "Trg kralja Tomislava 18", "web": "https://tz.valpovo.hr/ugostiteljstvo/bar-pizzeria-hex-valpovo/", "opis": "Pivnica i pizzerija na glavnom trgu s bogatom ponudom pizza." }
    ],
    "smjestaj": [
        { "id": 1, "naziv": "Hotel & Restoran Park", "tip": "Hotel 4*", "adresa": "Ive Lole Ribara 10", "telefon": "+385 31 651 230", "opis": "Moderno opremljene sobe, Wi-Fi, besplatna punionica za el. automobile.", "web": "https://tz.valpovo.hr/smjestaj-u-valpovu/hotel-restoran-park-valpovo/" },
        { "id": 2, "naziv": "Hotel Villa Valpovo", "tip": "Hotel", "adresa": "Bana Josipa Jelačića 1", "telefon": "031 651 960", "web": "http://www.villa-valpovo.hr" },
        { "id": 3, "naziv": "Soba VaLux", "tip": "Soba", "adresa": "Dobriše Cesarića 58", "telefon": "+385 91 923 7472" },
        { "id": 4, "naziv": "Apartman Centar Valpovo", "tip": "Apartman", "adresa": "Osječka ulica br. 6", "telefon": "099/244-3708" }
    ],
    "manifestacije": [
        { "id": "M1", "naziv": "Ljeto valpovačko", "slika": "https://tz.valpovo.hr/wp-content/uploads/2018/12/ljeto-valpovacko.jpg", "vrijeme": "Zadnji tjedan u lipnju", "opis": "Tjedan kulture, folklora i zabave koji okuplja tisuće posjetitelja u dvorištu dvorca.", "web": "https://tz.valpovo.hr/manifestacije/ljeto-valpovacko/" },
        { "id": "M2", "naziv": "Advent u Valpovu", "slika": "https://tz.valpovo.hr/wp-content/uploads/2018/12/advent.jpg", "vrijeme": "Prosinac", "opis": "Gastro ponuda, klizalište i koncerti na glavnom trgu u blagdanskom ozračju.", "web": "https://tz.valpovo.hr/manifestacije/advent-u-valpovu/" },
        { "id": "M3", "naziv": "Festival sira i vina", "opis": "Vrhunska domaća vina i autohtoni sirevi uz prigodan glazbeni program.", "web": "https://tz.valpovo.hr/manifestacije/festival-sira-i-vina/" }
    ],
    "naselja": [
        { "naziv": "Nard", "opis": "Mjesto uz Dravu, raj za ribiče i ljubitelje fiš-paprikaša." },
        { "naziv": "Ladimirevci", "opis": "Selo poznato po očuvanju slavonskih običaja i tradicije." }
    ],
    "priroda": [
        { "id": 1, "naziv": "Perivoj uz dvorac", "opis": "Engleski pejzažni park, jedan od najvrednijih te vrste u Hrvatskoj." },
        { "id": 2, "naziv": "Rijeka Drava (Nard/Nehaj)", "opis": "Kupalište, ribolov i netaknuta priroda slavonske rijeke." }
    ],
    "usluge": {
        "autoservisi": [
            { "id": "SER-001", "naziv": "Valentić", "adresa": "Ul. Nikole Tesle 30", "radno_vrijeme": { "pon-pet": "08:00-16:00" } },
            { "id": "SER-007", "naziv": "DABO", "adresa": "Florijanova ul. 15", "radno_vrijeme": { "pon-pet": "08:00-16:00" } }
        ],
        "zdravstvo": [
            { "id": "ZDR-001", "naziv": "Dom zdravlja Valpovo", "adresa": "Ul. kralja Petra Krešimira IV 1", "opis": "Hitna pomoć i osnovne medicinske usluge." }
        ],
        "ljekarne": [
            { "id": "LJK-001", "naziv": "Centralna ljekarna Valpovo", "adresa": "Osječka ul. 3" }
        ],
        "banke_i_bankomati": [
            { "id": "BNK-001", "naziv": "PBZ banka", "adresa": "Ul. kralja Petra Krešimira IV 2" }
        ],
        "benzinske_postaje": [
            { "id": "BEN-002", "naziv": "Petrol", "adresa": "J.J. Strossmayera 85a" }
        ]
    },
    "korisne_informacije": {
        "kontakt_tz": {
            "naziv": "TZ Grada Valpova",
            "adresa": "Trg kralja Tomislava 2, 31550 Valpovo",
            "telefoni": ["+385 31 656 200", "+385 99 782 3200", "+385 91 579 3527"],
            "emails": ["tzgvalpovo@gmail.com"],
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
            weatherNote += "\nPROGNOZA: Vedro/Oblačno, min " + weather.daily.temperature_2m_min[0] + "°C do max " + weather.daily.temperature_2m_max[0] + "°C.";
        }
    }

    const fmt = (item) => {
        let s = `- ${item.naziv}: ${item.opis || ""}`;
        if (item.slika) s += ` | Slika: ${item.slika}`; // AI MUST use this in Markdown
        if (item.adresa) s += ` | Adresa: ${item.adresa}`;
        if (item.telefon) s += ` | Tel: ${item.telefon}`;
        if (item.web) s += ` | Web: ${item.web}`;
        if (item.radno_vrijeme) s += ` | Radno vrijeme: ${typeof item.radno_vrijeme === 'string' ? item.radno_vrijeme : JSON.stringify(item.radno_vrijeme)}`;
        return s;
    };

    const strings = {
        znamenitosti: (db.znamenitosti || []).map(fmt).join("\n"),
        gastronomija: (db.gastronomija || []).map(fmt).join("\n"),
        manifestacije: (db.manifestacije || []).map(fmt).join("\n"),
        smjestaj: (db.smjestaj || []).map(fmt).join("\n"),
        usluge: Object.entries(db.usluge || {}).map(([k, v]) => v.map(fmt).join("\n")).join("\n")
    };

    const tz = db.korisne_informacije?.kontakt_tz || {};

    return `--- STROGO PRAVILO FORMATIRANJA (PRIORITET #1) ---
1. NIKADA ne koristi Markdown zaglavlja s ljestvama (npr. #, ##, ###). 
2. Umjesto ljestvi, za nazive objekata koristi **BOLDIRANI TEKST**. 
3. Svaki objekt prikazuj s odgovarajućom ikonom ispred naziva.

--- PRAVILO ZA SLIKE ---
1. Ako objekt u bazi ima polje "Slika", OBAVEZNO je prikaži na početku opisa u formatu:
   ![Slika](URL)
2. Slike trebaju biti prvi element nakon naziva.

Digitalni turistički informator grada Valpova. Profesionalan i vizualan. ${weatherNote}

PRAVILA PRIKAZA:
- 📛 **Naziv objekta** (bez ###)
- ![Slika](URL slika ako postoji)
- Opis (detaljan i preveden na jezik korisnika)
- 📞 Telefon (ako postoji)
- 🌐 Web: URL
- [Otvori na karti](https://www.google.com/maps/search/?api=1&query=NAZIV+OBJEKTA+Valpovo)

BAZA PODATAKA:
ZNAMENITOSTI: ${strings.znamenitosti}
GASTRONOMIJA: ${strings.gastronomija}
MANIFESTACIJE: ${strings.manifestacije}
SMJEŠTAJ: ${strings.smjestaj}
USLUGE: ${strings.usluge}

KONTAKT TZ: ${tz.naziv} | Tel: ${(tz.telefoni || []).join(", ")} | Web: ${tz.web}
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
                    ...history.slice(-6).map(m => ({ role: m.role === "model" ? "assistant" : m.role, content: m.content })),
                    { role: "user", content: message }
                ],
                temperature: 0.7
            })
        });

        const data = await apiResponse.json();
        if (!apiResponse.ok) return res.status(apiResponse.status).json({ error: "Greška OpenAI servisa", details: data.error?.message });
        return res.status(200).json({ reply: data.choices[0].message.content });
    } catch (e) {
        return res.status(500).json({ reply: "Problem s povezivanjem: " + e.message });
    }
}

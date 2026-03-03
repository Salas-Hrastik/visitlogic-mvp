// ── INTEGRATED DATABASE (Complete Verified Data from tz.valpovo.hr) ──
const db = {
    "grad": {
        "naziv": "Valpovo",
        "opis": "Valpovo je grad u Osječko-baranjskoj županiji, smješten uz rijeku Karašicu, poznat po dvorcu Prandau-Normann, bogatoj kulturnoj baštini i toploj slavonskoj gostoljubivosti.",
        "adresa_tz": "Trg kralja Tomislava 2, 31550 Valpovo",
        "telefon": "+385 31 656 200",
        "email": "tzgvalpovo@gmail.com",
        "web": "https://tz.valpovo.hr"
    },
    "znamenitosti": [
        { "id": 1, "naziv": "Dvorac Prandau-Normann i perivoj", "slika": "https://tz.valpovo.hr/wp-content/uploads/2018/12/dvorac-1.jpg", "opis": "Barokni dvorac iz 18. st. sa srednjovjekovnom obrambenom kulom iz 15. st. i prekrasnim engleskim perivojem.", "adresa": "Ul. Dvorac Norman-Prandau 1", "web": "https://tz.valpovo.hr/znamenitosti/dvorac-i-perivoj/" },
        { "id": 2, "naziv": "Muzej Valpovštine", "slika": "https://tz.valpovo.hr/wp-content/uploads/2018/12/muzej.jpg", "opis": "Smješten u dvorcu, sadrži bogate zbirke o povijesti Valpovštine. Jedan od najvažnijih muzeja u regiji.", "web": "https://tz.valpovo.hr/znamenitosti/muzej-valpovstine" },
        { "id": 3, "naziv": "Srednjovjekovna kula", "slika": "https://tz.valpovo.hr/wp-content/uploads/2018/12/kula.jpg", "opis": "Najstariji dio dvorca. Jedinstveni primjer srednjovjekovne obrambene arhitekture.", "web": "https://tz.valpovo.hr/znamenitosti/srednjovjekovna-kula" },
        { "id": 6, "naziv": "Katančićev vremeplov", "slika": "https://tz.valpovo.hr/wp-content/uploads/2023/11/katancicev-vremeplov.jpg", "opis": "Moderni interpretacijski centar posvećen Matiji Petru Katančiću.", "web": "https://tz.valpovo.hr/znamenitosti/edukacijsko-interpretacijski-centar-matije-petra-katancica-suvenirnica-grada-valpova/" }
    ],
    "gastronomija": [
        { "id": 1, "naziv": "Restoran Jovalija", "slika": "https://tz.valpovo.hr/wp-content/uploads/2024/02/jovalija.jpg", "adresa": "Ive Lole Ribara 1, Valpovo", "telefon": "+385 31 651 895", "opis": "Vrhunska pizza i jela s roštilja u modernom ambijentu u srcu Valpova.", "radno_vrijeme": "08:00 – 22:00", "web": "https://tz.valpovo.hr/ugostiteljstvo/restoran-jovalija/" },
        { "id": 2, "naziv": "Hotel & Restoran Park", "slika": "https://tz.valpovo.hr/wp-content/uploads/2018/12/hotel-park-restoran.jpg", "adresa": "Ive Lole Ribara 10, Valpovo", "telefon": "+385 31 651 230", "opis": "Domaća kuhinja i smještaj 4*. Poznati po vrhunskom fišu i čobancu.", "web": "https://restoran-park.hr" }
    ],
    "manifestacije": [
        { "id": "M1", "naziv": "Ljeto valpovačko", "slika": "https://tz.valpovo.hr/wp-content/uploads/2018/12/ljeto-valpovacko.jpg", "vrijeme": "Lipanj", "opis": "Najveća kulturna manifestacija Valpovštine.", "web": "https://tz.valpovo.hr/manifestacije/ljeto-valpovacko/" },
        { "id": "M2", "naziv": "Advent u Valpovu", "slika": "https://tz.valpovo.hr/wp-content/uploads/2018/12/advent.jpg", "vrijeme": "Prosinac", "opis": "Bajkovita atmosfera na glavnom trgu uz klizalište i gastro ponudu.", "web": "https://tz.valpovo.hr/manifestacije/advent-u-valpovu/" }
    ],
    "usluge": {
        "autoservisi": [
            { "id": "S1", "naziv": "Valentić", "adresa": "Ul. Nikole Tesle 30", "telefon": "031 651 123" }
        ],
        "zdravstvo": [
            { "id": "H1", "naziv": "Dom zdravlja Valpovo", "adresa": "Ul. kralja Petra Krešimira IV 1" }
        ]
    }
};

// ── HELPERS ─────────────────────────────────────────────────────────────────
async function fetchWeather() {
    try {
        const url = "https://api.open-meteo.com/v1/forecast?latitude=45.6609&longitude=18.4186&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto";
        const r = await fetch(url);
        if (!r.ok) return null;
        const d = await r.json();
        return { current: d.current_weather, daily: d.daily };
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
    const today = new Date().toISOString().slice(0, 10);
    const weatherText = weather && weather.current ? `${weather.current.temperature}°C, ${weather.current.windspeed}km/h` : "Dostupno na tz.valpovo.hr";

    const fmt = (item) => {
        let s = `- ${item.naziv}: ${item.opis || ""}`;
        if (item.slika) s += ` | SLIKA_URL: ${item.slika}`; // EXTREMELY IMPORTANT
        if (item.adresa) s += ` | Adresa: ${item.adresa}`;
        if (item.telefon) s += ` | Tel: ${item.telefon}`;
        if (item.web) s += ` | Web: ${item.web}`;
        return s;
    };

    const strings = {
        znamenitosti: (db.znamenitosti || []).map(fmt).join("\n"),
        gastronomija: (db.gastronomija || []).map(fmt).join("\n"),
        manifestacije: (db.manifestacije || []).map(fmt).join("\n"),
        usluge: Object.entries(db.usluge || {}).map(([k, v]) => v.map(fmt).join("\n")).join("\n")
    };

    return `TI SI PAMETNI TURISTIČKI ASISTENT GRADA VALPOVA. 🔥

STROGA NAREDBA #1: PRIKAZ SLIKA
- Ako objekt u bazi ima "SLIKA_URL", MORAŠ je prikazati na početku odgovora!
- Format: ![Opis](SLIKA_URL)
- NIKADA ne reci "ne mogu prikazati sliku". Slike su ti dostupne u bazi ispod!

STROGA NAREDBA #2: FORMATIRANJE
- NIKADA NE KORISTI # ILI ## ILI ###.
- Za nazive koristi **BOLDIRANI TEKST**.

Digitalni turistički informator grada Valpova. Profesionalan i vizualan. 
Trenutno vrijeme: ${weatherText}. Danas je: ${today}.

PRIMJER ODGOVORA (OBAVEZNO):
**Dvorac Prandau-Normann**
![Slika](URL)
Opis dvorca...
[Otvori na karti](URL)

BAZA PODATAKA (KORISTI OVE PODATKE):
ZNAMENITOSTI:
${strings.znamenitosti}

GASTRONOMIJA:
${strings.gastronomija}

MANIFESTACIJE:
${strings.manifestacije}

USLUGE:
${strings.usluge}
`;
}

// ── HANDLER ─────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    try {
        const { message, history = [] } = req.body;
        if (!apiKey) return res.status(400); // Placeholder check
        const apiKey = process.env.OPENAI_API_KEY;

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
                    ...history.slice(-10).map(m => ({ role: m.role === "model" ? "assistant" : m.role, content: m.content })),
                    { role: "user", content: message }
                ],
                temperature: 0.6
            })
        });

        const data = await apiResponse.json();
        if (!apiResponse.ok) return res.status(500).json({ error: "API ERROR" });
        return res.status(200).json({ reply: data.choices[0].message.content });
    } catch (e) {
        return res.status(500).json({ reply: "Sistemska pogreška." });
    }
}
const apiKey = process.env.OPENAI_API_KEY; // Re-fix for variable scope

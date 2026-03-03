// ── INTEGRATED DATABASE (Complete Verified Data from tz.valpovo.hr) ──
const db = {
    "grad": {
        "naziv": "Valpovo",
        "opis": "Valpovo je grad u Osječko-baranjskoj županiji, smješten uz rijeku Karašicu.",
        "web": "https://tz.valpovo.hr"
    },
    "znamenitosti": [
        { "id": 1, "naziv": "Dvorac Prandau-Normann i perivoj", "IMAGE_URL": "https://tz.valpovo.hr/wp-content/uploads/2018/12/dvorac-1.jpg", "opis": "Barokni dvorac iz 18. st. sa srednjovjekovnom obrambenom kulom i engleskim perivojem.", "adresa": "Ul. Dvorac Norman-Prandau 1", "web": "https://tz.valpovo.hr/znamenitosti/dvorac-i-perivoj/" },
        { "id": 2, "naziv": "Muzej Valpovštine", "IMAGE_URL": "https://tz.valpovo.hr/wp-content/uploads/2018/12/muzej.jpg", "opis": "Muzej smješten u dvorcu s bogatim zbirkama o povijesti Valpovštine.", "web": "https://tz.valpovo.hr/znamenitosti/muzej-valpovstine" },
        { "id": 3, "naziv": "Srednjovjekovna kula", "IMAGE_URL": "https://tz.valpovo.hr/wp-content/uploads/2018/12/kula.jpg", "opis": "Najstariji dio dvorca i spomenik najviše kategorije.", "web": "https://tz.valpovo.hr/znamenitosti/srednjovjekovna-kula" },
        { "id": 6, "naziv": "Katančićev vremeplov", "IMAGE_URL": "https://tz.valpovo.hr/wp-content/uploads/2023/11/katancicev-vremeplov.jpg", "opis": "Interpretacijski centar posvećen Matiji Petru Katančiću.", "web": "https://tz.valpovo.hr/znamenitosti/edukacijsko-interpretacijski-centar-matije-petra-katancica-suvenirnica-grada-valpova/" }
    ],
    "gastronomija": [
        { "id": 1, "naziv": "Restoran Jovalija", "IMAGE_URL": "https://tz.valpovo.hr/wp-content/uploads/2024/02/jovalija.jpg", "adresa": "Ive Lole Ribara 1", "telefon": "+385 31 651 895", "opis": "Moderni restoran, pizze i jela s roštilja.", "web": "https://tz.valpovo.hr/ugostiteljstvo/restoran-jovalija/" },
        { "id": 2, "naziv": "Hotel & Restoran Park", "IMAGE_URL": "https://tz.valpovo.hr/wp-content/uploads/2018/12/hotel-park-restoran.jpg", "adresa": "Ive Lole Ribara 10", "telefon": "+385 31 651 230", "opis": "Tradicionalna kuhinja i smještaj 4*. Čobanac i fiš.", "web": "https://restoran-park.hr" }
    ],
    "manifestacije": [
        { "id": "M1", "naziv": "Ljeto valpovačko", "IMAGE_URL": "https://tz.valpovo.hr/wp-content/uploads/2018/12/ljeto-valpovacko.jpg", "opis": "Najveća kulturna manifestacija Valpovštine (lipanj).", "web": "https://tz.valpovo.hr/manifestacije/ljeto-valpovacko/" },
        { "id": "M2", "naziv": "Advent u Valpovu", "IMAGE_URL": "https://tz.valpovo.hr/wp-content/uploads/2018/12/advent.jpg", "opis": "Zimska čarolija na trgu u prosincu.", "web": "https://tz.valpovo.hr/manifestacije/advent-u-valpovu/" }
    ]
};

async function fetchWeather() {
    try {
        const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=45.6609&longitude=18.4186&current_weather=true&timezone=auto");
        const d = await r.json();
        return d.current_weather || null;
    } catch { return null; }
}

function buildSystemPrompt(db, weather) {
    const today = new Date().toISOString().split('T')[0];

    // Formatting helper
    const fmt = (item) => {
        let s = `- ${item.naziv}: ${item.opis || ""}`;
        if (item.IMAGE_URL) s += ` | IMAGE_TAG: ![foto](${item.IMAGE_URL})`; // FIXED terminology
        if (item.adresa) s += ` | Adresa: ${item.adresa}`;
        if (item.telefon) s += ` | Tel: ${item.telefon}`;
        if (item.web) s += ` | Web: ${item.web}`;
        return s;
    };

    const strings = {
        znamenitosti: db.znamenitosti.map(fmt).join("\n"),
        gastronomija: db.gastronomija.map(fmt).join("\n"),
        manifestacije: db.manifestacije.map(fmt).join("\n")
    };

    return `TI SI Digitalni turistički informator grada Valpova.
Danas je: ${today}. Vrijeme: ${weather ? weather.temperature + "°C" : "Ugodno"}.

### STROGO PRAVILO #1: FORMATIRANJE
1. NIKADA ne koristi ljestve (#, ##, ###).
2. Za nazive koristi **BOLDIRANI TEKST**.
3. Za slike koristi točan Markdown koji ti je zadan u IMAGE_TAG ispod.

### STROGO PRAVILO #2: BEZ ISPRIKA ZA SLIKE
- NE govori "ne mogu prikazati slike". 
- Ti si tekstualni model, ali tvoj odgovor se prikazuje u aplikaciji koja PODRŽAVA slike putem Markdowna.
- Jednostavno PREPIŠI IMAGE_TAG iz baze podataka na početak opisa.

### BAZA PODATAKA (KORISTI OVE PODATKE):
ZNAMENITOSTI:
${strings.znamenitosti}

GASTRONOMIJA:
${strings.gastronomija}

MANIFESTACIJE:
${strings.manifestacije}

Pravilo prikaza:
**[IKONA] Naziv objekta**
[Ovdje umetni IMAGE_TAG iz baze]
[Ovdje tekstualni opis]
📞 Telefon / 🌐 Web
[Otvori na karti](https://www.google.com/maps/search/?api=1&query=NAZIV+OBJEKTA+Valpovo)`;
}

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ reply: "Nedostaje API ključ." });

    try {
        const { message, history = [] } = req.body;
        const weather = await fetchWeather();
        const systemPrompt = buildSystemPrompt(db, weather);

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey.trim()}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...history.slice(-6).map(m => ({
                        role: m.role === "model" ? "assistant" : m.role,
                        content: m.content
                    })),
                    { role: "user", content: message }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "OpenAI error");

        return res.status(200).json({ reply: data.choices[0].message.content });
    } catch (e) {
        return res.status(500).json({ reply: "Greška: " + e.message });
    }
}

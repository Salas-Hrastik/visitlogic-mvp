// VERSION: 3.1-VISUAL-ULTRA (FORCE MIGRATION)
// ── INTEGRATED DATABASE (Complete Verified Data from tz.valpovo.hr) ──
const db = {
    "grad": { "naziv": "Valpovo", "web": "https://tz.valpovo.hr" },
    "znamenitosti": [
        { "naziv": "Dvorac Prandau-Normann i perivoj", "IMAGE_MARKDOWN": "![Dvorac Prandau-Normann](https://tz.valpovo.hr/wp-content/uploads/2018/12/dvorac-1.jpg)", "opis": "Barokni dvorac iz 18. st. sa srednjovjekovnom kulom i engleskim perivojem.", "adresa": "Ul. Dvorac Norman-Prandau 1", "web": "https://tz.valpovo.hr/znamenitosti/dvorac-i-perivoj/" },
        { "naziv": "Muzej Valpovštine", "IMAGE_MARKDOWN": "![Muzej Valpovštine](https://tz.valpovo.hr/wp-content/uploads/2018/12/muzej.jpg)", "opis": "Muzej smješten u dvorcu s bogatim zbirkama o povijesti Valpovštine.", "web": "https://tz.valpovo.hr/znamenitosti/muzej-valpovstine" },
        { "naziv": "Srednjovjekovna kula", "IMAGE_MARKDOWN": "![Srednjovjekovna kula](https://tz.valpovo.hr/wp-content/uploads/2018/12/kula.jpg)", "opis": "Najstariji dio dvorca i spomenik najviše kategorije.", "web": "https://tz.valpovo.hr/znamenitosti/srednjovjekovna-kula" },
        { "naziv": "Katančićev vremeplov", "IMAGE_MARKDOWN": "![Katančićev vremeplov](https://tz.valpovo.hr/wp-content/uploads/2023/11/katancicev-vremeplov.jpg)", "opis": "Interpretacijski centar posvećen Matiji Petru Katančiću.", "web": "https://tz.valpovo.hr/znamenitosti/edukacijsko-interpretacijski-centar-matije-petra-katancica-suvenirnica-grada-valpova/" }
    ],
    "gastronomija": [
        { "naziv": "Restoran Jovalija", "IMAGE_MARKDOWN": "![Restoran Jovalija](https://tz.valpovo.hr/wp-content/uploads/2024/02/jovalija.jpg)", "adresa": "Ive Lole Ribara 1", "telefon": "+385 31 651 895", "opis": "Moderni restoran s vrhunskom ponudom pizza i jela s roštilja.", "web": "https://tz.valpovo.hr/ugostiteljstvo/restoran-jovalija/" },
        { "naziv": "Hotel & Restoran Park", "IMAGE_MARKDOWN": "![Hotel & Restoran Park](https://tz.valpovo.hr/wp-content/uploads/2018/12/hotel-park-restoran.jpg)", "adresa": "Ive Lole Ribara 10", "telefon": "+385 31 651 230", "opis": "Tradicija u srcu Valpova. Slavonski specijaliteti i fiš-paprikaš.", "web": "https://restoran-park.hr" }
    ],
    "manifestacije": [
        { "naziv": "Ljeto valpovačko", "IMAGE_MARKDOWN": "![Ljeto valpovačko](https://tz.valpovo.hr/wp-content/uploads/2018/12/ljeto-valpovacko.jpg)", "opis": "Glavna kulturna manifestacija (lipanj).", "web": "https://tz.valpovo.hr/manifestacije/ljeto-valpovacko/" },
        { "naziv": "Advent u Valpovu", "IMAGE_MARKDOWN": "![Advent u Valpovu](https://tz.valpovo.hr/wp-content/uploads/2018/12/advent.jpg)", "opis": "Zimska bajka na glavnom trgu.", "web": "https://tz.valpovo.hr/manifestacije/advent-u-valpovu/" }
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
    const data = JSON.stringify(db, null, 2);
    return `TI SI Digitalni turistički informator grada Valpova.
VRIJEME: ${weather ? weather.temperature + "°C" : "Ugodno"}.

### STROGI PROTOKOL VIZUALIZACIJE (OBAVEZNO):
1. Kad god spominješ objekt iz baze podataka (Dvorac, Muzej, Jovalija, Park, itd.), MORAŠ uključiti polje "IMAGE_MARKDOWN" TOČNO onako kako je zapisano.
2. NIKADA ne reci "ne mogu prikazati sliku". Slike su ti već zadane kao gotov Markdown kod u bazi.
    - TVOJ ZADATAK JE SAMO KOPIRATI TAJ KOD U SVOJ ODGOVOR.
3. Ako te korisnik pita "molim sliku dvorca", tvoj odgovor MORA početi s IMAGE_MARKDOWN dvorca.

### PRAVILO FORMATIRANJA:
- NE koristi zaglavlja (#, ##, ###).
- Nazivi objekata moraju biti **BOLDIRANI**.
- Uvijek dodaj: [Otvori na karti](https://www.google.com/maps/search/?api=1&query=NAZIV+OBJEKTA+Valpovo)

### TVOJA BAZA PODATAKA:
${data}`;
}

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ reply: "Nedostaje API ključ u okruženju." });

    try {
        const { message, history = [] } = req.body;
        const weather = await fetchWeather();
        const systemPrompt = buildSystemPrompt(db, weather);

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
                    ...history.slice(-6).map(m => ({
                        role: m.role === "model" ? "assistant" : m.role,
                        content: m.content
                    })),
                    { role: "user", content: message }
                ],
                temperature: 0.1 // ULTRA-DETERMINISTIC
            })
        });

        const result = await apiResponse.json();
        if (!apiResponse.ok) return res.status(500).json({ reply: "Problem s OpenAI API-jem: " + (result.error?.message || "Nepoznata greška") });

        return res.status(200).json({ reply: result.choices[0].message.content });
    } catch (e) {
        return res.status(500).json({ reply: "Sistemska greška: " + e.message });
    }
}

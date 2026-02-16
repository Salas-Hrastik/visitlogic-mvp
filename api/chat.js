import valpovoData from "../data/valpovoData.js";

let conversationMemory = [];
let userPreferences = {};

const CITY = "Valpovo";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { message } = req.body;
    const lower = message.toLowerCase();

    /* ================= WEATHER ================= */

    let weatherContext = "Vrijeme trenutno nije dostupno.";
    let isRain = false;
    let isCold = false;

    try {

      const weatherResponse = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHERAPI_KEY}&q=${CITY}&days=1&lang=hr`
      );

      const weatherData = await weatherResponse.json();

      if(weatherData?.current){

        const condition = weatherData.current.condition.text.toLowerCase();
        const temp = weatherData.current.temp_c;

        if(condition.includes("kiša") || condition.includes("pljusak")) isRain = true;
        if(temp < 8) isCold = true;

        weatherContext = `
Temperatura: ${temp}°C
Vrijeme: ${weatherData.current.condition.text}
`;
      }

    } catch {}

    /* ================= TIME ================= */

    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const month = now.getMonth();

    const isWeekend = (day === 0 || day === 6);
    const isEvening = hour >= 18;

    let season = "proljeće/jesen";
    if(month >= 5 && month <= 7) season = "ljeto";
    if(month === 11 || month <= 1) season = "zima";

    const timeContext = `
Sat: ${hour}
Večer: ${isEvening}
Vikend: ${isWeekend}
Sezona: ${season}
`;

    /* ================= PREFERENCES ================= */

    if(lower.includes("mirno")) userPreferences.atmosfera = "mirna";
    if(lower.includes("romanti")) userPreferences.tip = "romantično";
    if(lower.includes("djeca")) userPreferences.obitelj = true;
    if(lower.includes("brza")) userPreferences.tip = "brza_hrana";

    /* ================= CLASSIFICATION ================= */

    const classificationResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        messages: [
          {
            role: "system",
            content: `
Vrati samo jednu riječ:
gastronomija
smještaj
znamenitosti
događanja
priroda
`
          },
          { role: "user", content: message }
        ]
      })
    });

    const classificationData = await classificationResponse.json();
    let category = classificationData.choices?.[0]?.message?.content?.trim();

    if(!valpovoData[category]) category = "znamenitosti";

    let selectedData = valpovoData[category] || [];

    if((isRain || isCold) && category === "priroda"){
      selectedData = [];
    }

    /* ================= INTELLIGENT STORYTELLING PROMPT ================= */

    const systemPrompt = `
Ti si profesionalni turistički vodič i savjetnik za ${CITY}.

Odgovori moraju biti opisni, bogati i informativni, ali ne predugi.
Piši prirodno, kao da vodiš gosta kroz grad.

U uvodu:
- opiši atmosferu mjesta
- poveži odgovor s vremenskim uvjetima i sezonom

Za svaki objekt:
- daj 2–4 rečenice opisa
- objasni komu je najprikladniji
- istakni posebnost

Kontekst:
${weatherContext}
${timeContext}

Preferencije:
${JSON.stringify(userPreferences)}

Ne koristi katalog stil.
Ne izmišljaj objekte.
Koristi samo objekte iz baze.

Vrati isključivo JSON:

{
  "title": "Opisni naslov",
  "intro": "Širi uvod (2-4 rečenice)",
  "recommendations": [
    {
      "name": "Naziv",
      "reason": "Opis 2-4 rečenice"
    }
  ],
  "followUpQuestion": "Pametno pitanje"
}

Baza:
${JSON.stringify(selectedData)}
`;

    conversationMemory.push({ role: "user", content: message });

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationMemory
    ];

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.5,
        messages
      })
    });

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = null;
    }

    if(!parsed){
      return res.status(200).json({
        title: "Informacije o Valpovu",
        intro: "Valpovo nudi raznolike sadržaje kroz cijelu godinu.",
        recommendations: [],
        followUpQuestion: "Što vas točno zanima?"
      });
    }

    const allowedNames = selectedData.map(o => o.name);

    parsed.recommendations = parsed.recommendations.filter(r =>
      allowedNames.includes(r.name)
    );

    res.status(200).json(parsed);

  } catch (error) {

    res.status(500).json({
      error: "Server error",
      details: error.message
    });

  }
}

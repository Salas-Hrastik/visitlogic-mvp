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

    /* ======================================================
       1️⃣ WEATHER CONTEXT (WeatherAPI)
    ======================================================= */

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

        if(condition.includes("kiša") || condition.includes("pljusak")) {
          isRain = true;
        }

        if(temp < 8) {
          isCold = true;
        }

        weatherContext = `
Temperatura: ${temp}°C
Osjećaj: ${weatherData.current.feelslike_c}°C
Vrijeme: ${weatherData.current.condition.text}
`;
      }

    } catch {}

    /* ======================================================
       2️⃣ TIME CONTEXT
    ======================================================= */

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

    /* ======================================================
       3️⃣ PREFERENCE DETECTION
    ======================================================= */

    if(lower.includes("mirno")) userPreferences.atmosfera = "mirna";
    if(lower.includes("romanti")) userPreferences.tip = "romantično";
    if(lower.includes("djeca")) userPreferences.obitelj = true;
    if(lower.includes("brza")) userPreferences.tip = "brza_hrana";
    if(lower.includes("centar")) userPreferences.lokacija = "centar";

    /* ======================================================
       4️⃣ AI CLASSIFICATION
    ======================================================= */

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

    if(!valpovoData[category]){
      category = "znamenitosti";
    }

    let selectedData = valpovoData[category] || [];

    /* ======================================================
       5️⃣ WEATHER-BASED FILTERING
    ======================================================= */

    if((isRain || isCold) && category === "priroda"){
      selectedData = [];
    }

    /* ======================================================
       6️⃣ INTELLIGENT SYSTEM PROMPT
    ======================================================= */

    const systemPrompt = `
Ti si profesionalni turistički savjetnik za ${CITY}.

Ne daješ katalog nego analitičku, personaliziranu preporuku.

Kontekst:
${weatherContext}
${timeContext}

Preferencije korisnika:
${JSON.stringify(userPreferences)}

PRAVILA:

- Analiziraj situaciju.
- Usporedi objekte.
- Odaberi 2–3 najrelevantnija.
- Objasni ZAŠTO su prikladni sada.
- Istakni razliku među njima ako postoji.
- Postavi inteligentno follow-up pitanje.
- Ne navodi sve objekte.
- Ne izmišljaj objekte.
- Koristi isključivo objekte iz baze.

Vrati isključivo JSON:

{
  "title": "Strateški naslov",
  "intro": "Kratka personalizirana analiza situacije",
  "recommendations": [
    {
      "name": "Naziv objekta",
      "reason": "Obrazložena preporuka"
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
        temperature: 0.3,
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

    /* ======================================================
       7️⃣ FALLBACK
    ======================================================= */

    if(!parsed || !parsed.recommendations){
      return res.status(200).json({
        title: "Informacije o Valpovu",
        intro: "Rado ću pomoći. Molim precizirajte vrstu informacija.",
        recommendations: [],
        followUpQuestion: "Znamenitosti, gastronomija ili smještaj?"
      });
    }

    /* ======================================================
       8️⃣ ANTI-HALUCINATION VALIDATION
    ======================================================= */

    const allowedNames = selectedData.map(o => o.name);

    parsed.recommendations = parsed.recommendations.filter(r =>
      allowedNames.includes(r.name)
    );

    conversationMemory.push({
      role: "assistant",
      content: content
    });

    if(conversationMemory.length > 10){
      conversationMemory = conversationMemory.slice(-10);
    }

    res.status(200).json(parsed);

  } catch (error) {

    res.status(500).json({
      error: "Server error",
      details: error.message
    });

  }
}

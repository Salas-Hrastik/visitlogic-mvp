import valpovoData from "../data/valpovoData.js";

const CITY = "Valpovo";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { message = "" } = req.body;
    const lower = message.toLowerCase();

    /* ================= WEATHER ================= */

    let weatherSummary = "Vrijeme trenutno nije dostupno.";
    let isRain = false;
    let isCold = false;

    try {

      const weatherResponse = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHERAPI_KEY}&q=${CITY}&lang=hr`
      );

      const weatherData = await weatherResponse.json();

      if (weatherData?.current) {

        const condition = weatherData.current.condition.text;
        const temp = weatherData.current.temp_c;

        weatherSummary = `${condition}, ${temp}°C`;

        if (condition.toLowerCase().includes("kiša") ||
            condition.toLowerCase().includes("pljusak")) {
          isRain = true;
        }

        if (temp < 8) {
          isCold = true;
        }
      }

    } catch (err) {
      console.log("Weather error:", err.message);
    }

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

    if (!valpovoData[category]) {
      category = "znamenitosti";
    }

    let selectedData = valpovoData[category] || [];

    if ((isRain || isCold) && category === "priroda") {
      selectedData = [];
    }

    /* ================= AI PROMPT ================= */

    const systemPrompt = `
Ti si profesionalni turistički vodič za ${CITY}.

Uvijek koristi isključivo objekte iz baze.
Ne izmišljaj.

Kontekst vremena:
${weatherSummary}

Vrati isključivo JSON u ovom formatu:

{
  "title": "Naslov",
  "intro": "Uvod",
  "recommendations": [
    {
      "name": "Naziv",
      "reason": "Opis"
    }
  ],
  "followUpQuestion": "Potpitanje"
}

Baza:
${JSON.stringify(selectedData)}
`;

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        title: "Informacije o Valpovu",
        intro: "Valpovo nudi raznolike sadržaje kroz cijelu godinu.",
        recommendations: [],
        followUpQuestion: "Što vas točno zanima?"
      };
    }

    /* ================= VALIDACIJA ================= */

    const allowedNames = selectedData.map(o => o.name);

    parsed.recommendations = (parsed.recommendations || []).filter(r =>
      allowedNames.includes(r.name)
    );

    /* ================= FINAL RESPONSE ================= */

    return res.status(200).json({
      ...parsed,
      weatherSummary
    });

  } catch (error) {

    return res.status(500).json({
      error: "Server error",
      details: error.message
    });

  }
}

import valpovoData from "../data/valpovoData.js";

const CITY = "Valpovo";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { message, context } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

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

      if (weatherData?.current) {

        const condition = weatherData.current.condition.text.toLowerCase();
        const temp = weatherData.current.temp_c;

        if (condition.includes("kiša") || condition.includes("pljusak")) isRain = true;
        if (temp < 8) isCold = true;

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
    if (month >= 5 && month <= 7) season = "ljeto";
    if (month === 11 || month <= 1) season = "zima";

    const timeContext = `
Sat: ${hour}
Večer: ${isEvening}
Vikend: ${isWeekend}
Sezona: ${season}
`;

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
Vrati točno jednu od ovih riječi:
gastronomija
smještaj
znamenitosti
događanja
priroda

Ne dodaj ništa drugo.
Ne koristi točke.
Ne koristi objašnjenja.
`
          },
          { role: "user", content: message }
        ]
      })
    });

    const classificationData = await classificationResponse.json();
    let category = classificationData.choices?.[0]?.message?.content?.trim();

    const allowedCategories = [
      "gastronomija",
      "smještaj",
      "znamenitosti",
      "događanja",
      "priroda"
    ];

    if (!allowedCategories.includes(category)) {
      category = "znamenitosti";
    }

    let selectedData = valpovoData[category] || [];

    if ((isRain || isCold) && category === "priroda") {
      selectedData = [];
    }

    /* ================= CONTEXT FROM QR ================= */

    let locationContext = "";
    if (context === "dvorac") {
      locationContext = "Korisnik se nalazi kod Dvorca Prandau-Normann.";
    }

    if (context === "centar") {
      locationContext = "Korisnik se nalazi u centru Valpova.";
    }

    /* ================= SYSTEM PROMPT ================= */

    const systemPrompt = `
Ti si službeni digitalni turistički informator grada ${CITY}.
${locationContext}

Pravila:
- Odgovaraj jasno, profesionalno i informativno.
- Ne izmišljaj objekte.
- Koristi isključivo objekte iz baze.
- Ako nema podataka, reci da trenutno nema preporuka.
- Ne nagađaj radno vrijeme.
- Ne pretpostavljaj vremensku prognozu osim iz dostavljenog konteksta.
- Ako baza sadrži 0 objekata, vrati prazan recommendations niz.

Kontekst:
${weatherContext}
${timeContext}

Vrati isključivo JSON u ovom formatu:

{
  "title": "Naslov",
  "intro": "Uvod (2-4 rečenice)",
  "recommendations": [
    {
      "name": "Naziv",
      "reason": "Opis"
    }
  ],
  "followUpQuestion": "Pametno pitanje"
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
        temperature: 0.3,
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
        intro: "Trenutno nemam precizan odgovor. Molim pokušajte precizirati upit.",
        recommendations: [],
        followUpQuestion: "Što vas točno zanima?"
      };
    }

    const allowedNames = selectedData.map(o => o.name);

    parsed.recommendations = parsed.recommendations.filter(r =>
      allowedNames.includes(r.name)
    );

    return res.status(200).json(parsed);

  } catch (error) {

    return res.status(500).json({
      error: "Server error",
      details: error.message
    });

  }
}

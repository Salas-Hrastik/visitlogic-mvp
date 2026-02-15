export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { message, history } = req.body;

    const today = new Date();
    const month = today.getMonth() + 1;

    let season;
    if (month >= 6 && month <= 8) season = "ljeto";
    else if (month >= 9 && month <= 11) season = "jesen";
    else if (month >= 12 || month <= 2) season = "zima";
    else season = "proljeće";

    /* ===============================
       REAL TIME WEATHER (OpenWeather)
       =============================== */

    let weatherInfo = "Nepoznato vrijeme.";

    try {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Valpovo,HR&units=metric&lang=hr&appid=${process.env.OPENWEATHER_API_KEY}`
      );

      const weatherData = await weatherResponse.json();

      if (weatherData?.main?.temp) {
        weatherInfo = `
Trenutna temperatura: ${weatherData.main.temp}°C.
Vrijeme: ${weatherData.weather[0].description}.
`;
      }

    } catch (weatherError) {
      weatherInfo = "Vremenska prognoza trenutno nije dostupna.";
    }

    /* ===============================
       SYSTEM PROMPT
       =============================== */

    const systemPrompt = `
Ti si službeni digitalni turistički informator grada Valpova.

Odgovaraš ISKLJUČIVO o Valpovu i okolici.
Ako korisnik pita za drugi grad, ljubazno ga vrati na Valpovo.

Danas je: ${today.toLocaleDateString("hr-HR")}.
Sezona: ${season}.

${weatherInfo}

Prilagodi preporuke sezoni i vremenskim uvjetima.

Ako je kiša → fokusiraj indoor aktivnosti.
Ako je hladno → izbjegavaj dugotrajne šetnje.
Ako je lijepo vrijeme → predloži park, šetnje i otvorene prostore.

Odgovaraš ISKLJUČIVO u JSON formatu.

Struktura mora biti:

{
  "title": "Naslov odgovora",
  "intro": "Kratki uvodni tekst",
  "sections": [
    {
      "heading": "Naziv sekcije",
      "items": [
        {
          "name": "Naziv stavke",
          "description": "Kratki opis",
          "link": "https://tz.valpovo.hr"
        }
      ]
    }
  ]
}

Ne dodaj objašnjenja.
Ne dodaj markdown.
Ne dodaj tekst prije ili poslije JSON-a.
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []),
      { role: "user", content: message }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch (err) {
      return res.status(500).json({
        error: "Model nije vratio validni JSON.",
        raw: content
      });
    }

    /* ===============================
       ANALYTICS LOGGING
       =============================== */

    console.log("---- VISITLOGIC LOG ----");
    console.log("Vrijeme:", today.toISOString());
    console.log("Upit:", message);
    console.log("Sezona:", season);
    console.log("Vrijeme info:", weatherInfo);
    console.log("------------------------");

    res.status(200).json(parsed);

  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}

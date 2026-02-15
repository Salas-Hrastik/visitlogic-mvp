import valpovoData from "../data/valpovoData.js";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { message } = req.body;

    const gastronomija = valpovoData.gastronomija;

    const systemPrompt = `
Ti si profesionalni AI turistički savjetnik za grad Valpovo.

Dobio si bazu stvarnih ugostiteljskih objekata.
Smiješ koristiti ISKLJUČIVO objekte iz te baze.
Ne smiješ izmišljati nove objekte.

Tvoj zadatak:

1. Analiziraj korisnički upit.
2. Odaberi 2 do 4 NAJRELEVANTNIJA objekta.
3. Objasni zašto ih preporučuješ.
4. Postavi jedno dodatno pitanje za personalizaciju.
5. Vrati odgovor u JSON formatu.

Struktura mora biti:

{
  "title": "Naslov odgovora",
  "intro": "Kratko personalizirano objašnjenje",
  "recommendations": [
    {
      "name": "Naziv objekta",
      "reason": "Zašto je odabran"
    }
  ],
  "followUpQuestion": "Pitanje za dodatnu personalizaciju"
}

Baza objekata:
${JSON.stringify(gastronomija)}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
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
       VALIDACIJA PROTIV HALUCINACIJA
       =============================== */

    const allowedNames = gastronomija.map(obj => obj.name);

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

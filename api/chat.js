import valpovoData from "../data/valpovoData.js";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { message } = req.body;
    const lower = message.toLowerCase();

    let category = "znamenitosti";

    if (lower.includes("restoran") || lower.includes("jest") || lower.includes("hrana")) {
      category = "gastronomija";
    }
    else if (lower.includes("smještaj") || lower.includes("spavati") || lower.includes("hotel")) {
      category = "smještaj";
    }
    else if (lower.includes("događ") || lower.includes("manifest")) {
      category = "događanja";
    }
    else if (lower.includes("park") || lower.includes("prirod") || lower.includes("šetnj")) {
      category = "priroda";
    }

    const selectedData = valpovoData[category] || [];

    const systemPrompt = `
Ti si profesionalni AI turistički savjetnik za Valpovo.

Smiješ koristiti isključivo objekte iz dostavljene baze.
Ne smiješ izmišljati.

Odaberi 2 do 4 najrelevantnija objekta.
Objasni zašto ih preporučuješ.
Postavi dodatno pitanje.

Vrati JSON u formatu:

{
  "title": "...",
  "intro": "...",
  "recommendations": [
    { "name": "...", "reason": "..." }
  ],
  "followUpQuestion": "..."
}

Baza:
${JSON.stringify(selectedData)}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let parsed = JSON.parse(content);

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

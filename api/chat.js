import valpovoData from "../data/valpovoData.js";

let conversationMemory = [];

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

Imaš kontekst dosadašnjeg razgovora.
Smiješ koristiti isključivo objekte iz dostavljene baze.
Ne smiješ izmišljati nove objekte.

Odaberi 2 do 4 najrelevantnija objekta.
Objasni zašto ih preporučuješ.
Postavi dodatno pitanje ako ima smisla.

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

    conversationMemory.push({ role: "user", content: message });

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationMemory
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

    let parsed = JSON.parse(content);

    conversationMemory.push({
      role: "assistant",
      content: content
    });

    if(conversationMemory.length > 10){
      conversationMemory = conversationMemory.slice(-10);
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

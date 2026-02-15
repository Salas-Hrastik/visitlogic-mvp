import valpovoData from "../data/valpovoData.js";

let conversationMemory = [];
let userPreferences = {};

const TONE = "formal"; 
// "formal" | "neutral" | "friendly"

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { message } = req.body;

    /* ----------------------------------
       1️⃣ AI KLASIFIKACIJA TEME
    -----------------------------------*/

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
Ti klasificiraš turističke upite za grad Valpovo.

Vrati isključivo jednu riječ:
gastronomija
smještaj
znamenitosti
događanja
priroda
`
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const classificationData = await classificationResponse.json();
    let category = classificationData.choices?.[0]?.message?.content?.trim();

    if(!valpovoData[category]){
      category = "znamenitosti";
    }

    const selectedData = valpovoData[category] || [];

    /* ----------------------------------
       2️⃣ DETEKCIJA PREFERENCIJA
    -----------------------------------*/

    const lower = message.toLowerCase();

    if(lower.includes("mirno")) userPreferences.atmosfera = "mirna";
    if(lower.includes("romanti")) userPreferences.tip = "romantično";
    if(lower.includes("brza")) userPreferences.tip = "brza_hrana";
    if(lower.includes("djeca")) userPreferences.obitelj = true;
    if(lower.includes("centar")) userPreferences.lokacija = "centar";

    /* ----------------------------------
       3️⃣ TON KOMUNIKACIJE
    -----------------------------------*/

    let toneInstruction = "";

    if (TONE === "formal") {
      toneInstruction = "Komuniciraj profesionalno i službeno.";
    }
    else if (TONE === "neutral") {
      toneInstruction = "Komuniciraj jasno i informativno.";
    }
    else if (TONE === "friendly") {
      toneInstruction = "Komuniciraj toplo i prijateljski.";
    }

    /* ----------------------------------
       4️⃣ GLAVNI AI ODGOVOR
    -----------------------------------*/

    const systemPrompt = `
Ti si službeni AI turistički savjetnik za Valpovo.

${toneInstruction}

Tema upita: ${category}

Poznate preferencije korisnika:
${JSON.stringify(userPreferences)}

Imaš kontekst razgovora.
Smiješ koristiti isključivo objekte iz dostavljene baze.
Ne smiješ izmišljati nove objekte.

Prilagodi preporuku temi i preferencijama.

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

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

    /* RESET KOMANDA */

    if(message === "__RESET__"){
      conversationMemory = [];
      userPreferences = {};
      return res.status(200).json({ reset: true });
    }

    /* ---------------------------
       1️⃣ AI KLASIFIKACIJA
    ----------------------------*/

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

    const selectedData = valpovoData[category] || [];

    /* ---------------------------
       PREFERENCIJE
    ----------------------------*/

    const lower = message.toLowerCase();

    if(lower.includes("mirno")) userPreferences.atmosfera = "mirna";
    if(lower.includes("romanti")) userPreferences.tip = "romantično";
    if(lower.includes("brza")) userPreferences.tip = "brza_hrana";
    if(lower.includes("djeca")) userPreferences.obitelj = true;
    if(lower.includes("centar")) userPreferences.lokacija = "centar";

    /* ---------------------------
       TON
    ----------------------------*/

    let toneInstruction = "";

    if (TONE === "formal") toneInstruction = "Komuniciraj profesionalno.";
    if (TONE === "neutral") toneInstruction = "Komuniciraj informativno.";
    if (TONE === "friendly") toneInstruction = "Komuniciraj toplo i prijateljski.";

    const systemPrompt = `
Ti si AI turistički savjetnik za Valpovo.

${toneInstruction}

Tema: ${category}
Preferencije: ${JSON.stringify(userPreferences)}

Vrati JSON:

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

    let parsed;

    try{
      parsed = JSON.parse(content);
    }catch{
      parsed = null;
    }

    if(!parsed){
      return res.status(200).json({
        title: "Informacije",
        intro: "Rado ću pomoći. Koju vrstu informacija trebate?",
        recommendations: [],
        followUpQuestion: "Znamenitosti, gastronomija ili smještaj?"
      });
    }

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

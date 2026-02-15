export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const userText = message.toLowerCase();

    let category = "opcenito";

    if (userText.includes("znamenit")) {
      category = "znamenitosti";
    } else if (userText.includes("gastro") || userText.includes("restoran") || userText.includes("jela")) {
      category = "gastronomija";
    } else if (userText.includes("događ") || userText.includes("manifest")) {
      category = "dogadjanja";
    } else if (userText.includes("loše vrijeme") || userText.includes("kiša")) {
      category = "lose_vrijeme";
    }

    let systemPrompt = `
Ti si službeni digitalni turistički informator grada Valpova.
Odgovaraj profesionalno, jasno i bez generičkih uvoda.
Ne izmišljaj objekte ili događanja.
Ako nemaš sigurnu informaciju, uputi na https://tz.valpovo.hr/
`;

    if (category === "znamenitosti") {
      systemPrompt += `
Fokus: kulturne i povijesne znamenitosti Valpova.
Navedi stvarne lokacije (npr. dvorac Prandau-Normann, perivoj, crkva).
Strukturiraj odgovor u točke.
`;
    }

    if (category === "gastronomija") {
      systemPrompt += `
Fokus: tipovi gastronomije i tradicionalna jela.
Ne izmišljaj restorane.
Navedi vrste ponude i primjere jela.
Strukturiraj odgovor u točke.
`;
    }

    if (category === "dogadjanja") {
      systemPrompt += `
Za aktualna događanja ne nagađaj.
Uputi korisnika na službenu stranicu:
https://tz.valpovo.hr/
`;
    }

    if (category === "lose_vrijeme") {
      systemPrompt += `
Predloži aktivnosti u zatvorenim prostorima:
muzej, kulturne ustanove, ugostiteljski objekti.
Strukturiraj odgovor u točke.
`;
    }

    systemPrompt += `
Završetak odgovora:
"Ako trebate dodatne informacije, slobodno postavite novo pitanje."
`;

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.25,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ]
        })
      }
    );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      return res.status(500).json({ error: errorText });
    }

    const data = await openaiResponse.json();

    const reply =
      data.choices?.[0]?.message?.content ||
      "Trenutno nije moguće generirati odgovor.";

    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}

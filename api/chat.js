export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const systemPrompt = `
Ti si službeni digitalni turistički informator grada Valpova.

STROGA PRAVILA:

1. Odgovaraj isključivo na temu korisničkog pitanja.
2. Ne ponavljaj opći opis grada osim ako je to izravno traženo.
3. Ako je pitanje tematsko:
   - znamenitosti → navedi konkretne lokacije
   - gastro → navedi tipove jela i vrstu ponude (bez izmišljanja lokala)
   - događanja → uputi na službenu stranicu TZ Valpovo (https://tz.valpovo.hr/)
   - loše vrijeme → predloži unutarnje aktivnosti
4. Ne izmišljaj nepostojeće objekte, restorane ili manifestacije.
5. Ako nemaš pouzdanu informaciju, jasno naglasi potrebu provjere službenih izvora.
6. Odgovaraj profesionalno, strukturirano i bez pretjeranih uvoda.

Ton: institucionalan, jasan, profesionalan.
`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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

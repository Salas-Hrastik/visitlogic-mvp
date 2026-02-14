export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history = [] } = req.body;

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
          {
            role: "system",
            content: `
Ti si službeni digitalni turistički informator grada Valpova.

Koristi isključivo provjerene podatke.
Ne izmišljaj objekte.
Ako nemaš podatak, jasno reci da preporučuješ provjeru službenih izvora.

Odgovaraj strukturirano i profesionalno.
`
          },
          ...history
        ]
      })
    });

    const data = await response.json();

    res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "Greška u odgovoru."
    });

  } catch (error) {
    res.status(500).json({ error: "Interna serverska greška." });
  }
}

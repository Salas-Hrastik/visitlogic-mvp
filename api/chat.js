export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Nedostaje poruka." });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.6,
        messages: [
          {
            role: "system",
            content: `Ti si službeni digitalni turistički informator grada Valpova u Slavoniji.

Tvoja uloga je pružiti točne, strukturirane i profesionalne turističke informacije.

PRAVILA ODGOVARANJA:

1. Navodi isključivo stvarne lokacije (ne izmišljaj restorane, hotele ili događanja).
2. Odgovore strukturiraj u numerirane točke.
3. Ako korisnik ima malo vremena, ponudi kratku rutu.
4. Ako je loše vrijeme, predloži unutarnje aktivnosti.
5. U sezoni naglasi aktualna događanja.
6. U predsezoni i posezoni predloži alternativne sadržaje.
7. Ne koristi dugačke uvode.
8. Odgovaraj hrvatskim jezikom.
9. Na kraju uvijek postavi dodatno pitanje:

"Želite li kratku rutu, gastro preporuku ili aktualna događanja?"

Ton komunikacije mora biti autoritativan, ali prijateljski i profesionalan.`
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      return res.status(500).json({ error: "Greška pri komunikaciji s OpenAI." });
    }

    res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "Greška u odgovoru."
    });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Interna serverska greška." });
  }
}

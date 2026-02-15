export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metoda nije dopuštena" });
  }

  try {
    const { message } = req.body;

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
          {
            role: "system",
            content: `
Ti si službeni digitalni turistički informator Turističke zajednice grada Valpova.

Odgovaraj profesionalno, jasno i strukturirano.

FORMAT ODGOVORA:

- Koristi podnaslove (###)
- Koristi kratke bullet točke
- Maksimalno 5 stavki po sekciji
- Izbjegavaj dugačke odlomke
- Održi vizualnu preglednost
- Diskretno koristi emoji samo kao sekcijske oznake (npr. 🍽 🏛 🌳 🎉)

Ako nemaš točan podatak:
- Ne izmišljaj.
- Uputi korisnika na: https://tz.valpovo.hr/

Ne koristi općenite formulacije.
Ne piši predugačke rečenice.
              `
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "Trenutno nije moguće generirati odgovor."
    });

  } catch (error) {
    res.status(500).json({ error: "Greška na poslužitelju." });
  }
}

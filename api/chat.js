export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metoda nije dopuštena." });
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

Odgovaraj profesionalno, institucionalno i pregledno.

FORMATIRANJE JE OBVEZNO:

1. Koristi jasne podnaslove u formatu:
### Naziv

2. Svaku znamenitost ili kategoriju prikaži ovako:

### Naziv znamenitosti
- Kratka informacija
- Kratka informacija
- Kratka informacija

3. Ne miješaj naziv unutar bullet točke.
4. Ne koristi crtice unutar rečenica.
5. Ne piši dugačke blokove teksta.
6. Ne vraćaj nabacane rečenice.
7. Uvijek strukturiraj odgovor logično i uredno.

Odgovori moraju izgledati profesionalno i čitljivo.
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

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ reply: "Trenutno nije moguće dohvatiti odgovor." });
    }

    res.status(200).json({
      reply: data.choices[0].message.content
    });

  } catch (error) {
    res.status(500).json({
      reply: "Došlo je do tehničke pogreške. Molimo pokušajte ponovno."
    });
  }
}

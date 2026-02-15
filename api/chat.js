export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { message, history } = req.body;

    const messages = [
      {
        role: "system",
        content: `
Ti si službeni digitalni turistički informator grada Valpova.
Odgovaraš ISKLJUČIVO u JSON formatu.
Ne dodaj tekst izvan JSON strukture.

Struktura mora biti:

{
  "title": "Naslov odgovora",
  "intro": "Kratki uvodni tekst",
  "sections": [
    {
      "heading": "Naziv sekcije",
      "items": [
        {
          "name": "Naziv stavke",
          "description": "Kratki opis",
          "link": "https://tz.valpovo.hr"
        }
      ]
    }
  ]
}

Ne dodaj objašnjenja.
Ne dodaj markdown.
Ne dodaj tekst prije ili poslije JSON-a.
`
      },
      ...(history || []),
      {
        role: "user",
        content: message
      }
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

    try {
      parsed = JSON.parse(content);
    } catch (err) {
      return res.status(500).json({
        error: "Model nije vratio validni JSON.",
        raw: content
      });
    }

    res.status(200).json(parsed);

  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}

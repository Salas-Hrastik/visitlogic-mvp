export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { message, history } = req.body;

    const today = new Date();

    const systemPrompt = `
Ti si službeni digitalni turistički informator grada Valpova.

STROGO PRAVILO:
Ne smiješ izmišljati restorane, događaje, lokacije ili povijesne činjenice.
Ako nisi siguran u podatak, napiši da informacija trenutno nije dostupna.
Ne smiješ nagađati.

Odgovaraš ISKLJUČIVO o Valpovu i okolici.

Koristi samo opće poznate i realne informacije.
Ne izmišljaj nazive objekata.
Ne izmišljaj URL adrese.

Odgovaraš ISKLJUČIVO u JSON formatu.

Struktura mora biti:

{
  "category": "jedna_od_kategorija",
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

Ako ne znaš informaciju:
vrati praznu listu items.

Ne dodaj tekst izvan JSON strukture.
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []),
      { role: "user", content: message }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.0, /* KLJUČNO – MINIMALNA HALUCINACIJA */
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

    /* VALIDACIJA LINKOVA */

    parsed.sections?.forEach(section => {
      section.items?.forEach(item => {
        if (!item.link || !item.link.startsWith("https://")) {
          item.link = "https://tz.valpovo.hr";
        }
      });
    });

    res.status(200).json(parsed);

  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { message, history } = req.body;

    const today = new Date();
    const month = today.getMonth() + 1;

    let season;
    if (month >= 6 && month <= 8) season = "ljeto";
    else if (month >= 9 && month <= 11) season = "jesen";
    else if (month >= 12 || month <= 2) season = "zima";
    else season = "proljeće";

    const systemPrompt = `
Ti si službeni digitalni turistički informator grada Valpova.

Odgovaraš ISKLJUČIVO o Valpovu i okolici.
Ako korisnik pita za drugi grad, ljubazno ga vrati na Valpovo.

Interno prvo odredi kategoriju upita.
Moguće kategorije su:

- znamenitosti
- gastronomija
- događanja
- smještaj
- obitelj
- priroda
- općenito

Danas je: ${today.toLocaleDateString("hr-HR")}.
Sezona: ${season}.

Prilagodi preporuke sezoni.

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

Ne dodaj tekst izvan JSON strukture.
Ne dodaj markdown.
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

    /* ANALYTICS LOG */
    console.log("---- VISITLOGIC ANALYTICS ----");
    console.log("Vrijeme:", today.toISOString());
    console.log("Upit:", message);
    console.log("Kategorija:", parsed.category);
    console.log("Sezona:", season);
    console.log("------------------------------");

    res.status(200).json(parsed);

  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}

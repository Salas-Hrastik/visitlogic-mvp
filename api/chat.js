export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { message, history } = req.body;

    /* ===============================
       WHITELIST PODACI (DOZVOLJENO)
       =============================== */

    const allowedData = {
      znamenitosti: [
        {
          name: "Dvorac Prandau-Normann",
          description: "Barokni dvorac iz 18. stoljeća okružen perivojem.",
          link: "https://tz.valpovo.hr"
        },
        {
          name: "Muzej Valpovštine",
          description: "Muzej smješten u sklopu dvorca s povijesnom zbirkom.",
          link: "https://tz.valpovo.hr"
        },
        {
          name: "Crkva sv. Roka",
          description: "Povijesna crkva iz 18. stoljeća u centru grada.",
          link: "https://tz.valpovo.hr"
        }
      ],
      priroda: [
        {
          name: "Perivoj dvorca",
          description: "Uređeni park oko dvorca idealan za šetnju.",
          link: "https://tz.valpovo.hr"
        }
      ]
    };

    /* ===============================
       SYSTEM PROMPT
       =============================== */

    const systemPrompt = `
Ti si službeni digitalni turistički informator grada Valpova.

STROGO PRAVILO:
Smiješ koristiti ISKLJUČIVO podatke koji su ti dostavljeni u listi ALLOWED DATA.
Ne smiješ izmišljati nove lokacije.
Ne smiješ dodavati objekte koji nisu na listi.

Ako korisnik pita za nešto što nije na listi:
vrati praznu listu items.

Odgovaraš ISKLJUČIVO u JSON formatu.

Struktura mora biti:

{
  "category": "znamenitosti | priroda | općenito",
  "title": "Naslov odgovora",
  "intro": "Kratki uvodni tekst",
  "sections": [
    {
      "heading": "Naziv sekcije",
      "items": [ DOZVOLJENI_OBJEKTI ]
    }
  ]
}
`;

    const messages = [
      {
        role: "system",
        content: systemPrompt + "\n\nALLOWED DATA:\n" + JSON.stringify(allowedData)
      },
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
        temperature: 0.0,
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

    /* ===============================
       SERVER VALIDACIJA
       =============================== */

    parsed.sections?.forEach(section => {
      section.items = section.items.filter(item =>
        allowedData.znamenitosti.some(a => a.name === item.name) ||
        allowedData.priroda.some(a => a.name === item.name)
      );
    });

    res.status(200).json(parsed);

  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}

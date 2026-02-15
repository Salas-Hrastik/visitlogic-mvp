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

1. Odgovaraj isključivo na postavljeno pitanje.
2. Ne započinji generičkim opisom grada ako nije tražen.
3. Ne izmišljaj objekte, restorane, događanja ili institucije.
4. Ako nisi siguran, jasno naznači da je potrebna provjera službenih izvora.
5. Odgovaraj profesionalno, institucionalno i jasno.

FORMAT ODGOVORA (OBAVEZAN):

- Prva rečenica: kratak i izravan odgovor (maksimalno 1 rečenica).
- Zatim strukturirane točke (ako je primjenjivo).
- Bez suvišnih uvoda.
- Na kraju: "Ako trebate dodatne informacije, slobodno postavite novo pitanje."

Primjeri strukture:

Za znamenitosti:
• Naziv lokacije – kratki opis  
• Naziv lokacije – kratki opis  

Za gastronomiju:
• Vrsta ponude – opis  
• Tradicionalna jela – primjeri  

Za događanja:
Uputiti na službenu stranicu: https://tz.valpovo.hr/

Ton mora biti profesionalan, jasan i službeni.
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
          temperature: 0.3,
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

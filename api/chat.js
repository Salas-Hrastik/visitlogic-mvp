export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ 
      reply: "Greška: API ključ nije postavljen na serveru." 
    });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ 
        reply: "Niste poslali poruku." 
      });
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Ti si profesionalni turistički informator za Valpovo. Odgovaraj jasno i konkretno."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7
      })
    });

    const data = await openaiResponse.json();

    if (!openaiResponse.ok) {
      return res.status(500).json({
        reply: "Greška u komunikaciji s AI sustavom."
      });
    }

    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "Trenutno nema odgovora."
    });

  } catch (error) {
    return res.status(500).json({
      reply: "Došlo je do serverske greške."
    });
  }
}

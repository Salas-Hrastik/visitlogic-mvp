const db = {
  grad: { naziv: "Biograd na Moru", web: "https://www.tzg-biograd.hr", telefon: "+385 23 383 123" },
  priroda: [
    { naziv: "Plaža Soline", opis: "Glavna gradska plaža s prirodnim hladom." },
    { naziv: "Vransko jezero", opis: "Park prirode idealan za promatranje ptica i biciklizam." }
  ],
  gastronomija: [
    { naziv: "Restoran Kaciol", opis: "Dalmatinska kuhinja i svježa riba." },
    { naziv: "Carpymore", opis: "Mediteranska jela u centru." }
  ]
};

async function fetchWeather() {
  try {
    const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=43.9433&longitude=15.4519&current_weather=true");
    if (!r.ok) return null;
    const d = await r.json();
    return d.current_weather || null;
  } catch { return null; }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { message, history = [] } = req.body || {};
    if (!message) return res.status(400).json({ error: "Nedostaje poruka." });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "API ključ nije postavljen." });

    const w = await fetchWeather();
    const weatherLine = w ? `Trenutno: ${w.temperature}°C, vjetar ${w.windspeed} km/h.` : "Vrijeme trenutno nije dostupno.";

    const system = `Ti si turistički informator za Biograd na Moru.
Odgovaraj na jeziku korisnika, kratko i praktično.
Ako preporučaš mjesta, dodaj Google Maps link u formatu:
https://www.google.com/maps/search/?api=1&query=NAZIV+Biograd+na+Moru

PODACI:
Grad: ${db.grad.naziv}, tel ${db.grad.telefon}, web ${db.grad.web}
Priroda: ${db.priroda.map(x => `${x.naziv} - ${x.opis}`).join("; ")}
Gastronomija: ${db.gastronomija.map(x => `${x.naziv} - ${x.opis}`).join("; ")}
${weatherLine}`;

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey.trim()}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: system }, ...history.slice(-6), { role: "user", content: message }],
        temperature: 0.7
      })
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: "Greška OpenAI servisa", details: data.error?.message });
    return res.status(200).json({ reply: data.choices?.[0]?.message?.content || "Nema odgovora." });
  } catch (e) {
    return res.status(500).json({ error: "Sistemska pogreška", details: e.message });
  }
}

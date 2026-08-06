export default async function handler(req, res) {
  try {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=43.9433&longitude=15.4519&current_weather=true";
    const r = await fetch(url);
    if (!r.ok) return res.status(502).json({ error: "Nedostupno" });
    const d = await r.json();
    const w = d.current_weather;
    return res.status(200).json({ temperature: w.temperature, windspeed: w.windspeed });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

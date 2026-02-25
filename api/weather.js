export default async function handler(req, res) {
    try {
        const url = "https://api.open-meteo.com/v1/forecast?latitude=45.6609&longitude=18.4186&current_weather=true";
        const r = await fetch(url);
        if (!r.ok) return res.status(502).json({ error: "Nedostupno" });
        const d = await r.json();
        const w = d.current_weather;
        return res.status(200).json({ temperature: w.temperature, windspeed: w.windspeed });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}

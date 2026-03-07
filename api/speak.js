export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    try {
        const { text, voice = "onyx" } = req.body;
        if (!text) return res.status(400).json({ error: "Nedostaje tekst za čitanje." });

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) return res.status(500).json({ error: "API ključ nije postavljen." });

        const response = await fetch("https://api.openai.com/v1/audio/speech", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey.trim()}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "tts-1",
                input: text,
                voice: voice // alloy, echo, fable, onyx, nova, shimmer
            })
        });

        if (!response.ok) {
            const err = await response.json();
            return res.status(response.status).json({ error: "OpenAI TTS greška", details: err.error?.message });
        }

        const audioBuffer = await response.arrayBuffer();
        res.setHeader("Content-Type", "audio/mpeg");
        return res.send(Buffer.from(audioBuffer));

    } catch (e) {
        console.error("TTS Error:", e);
        return res.status(500).json({ error: "Sistemska pogreška", details: e.message });
    }
}

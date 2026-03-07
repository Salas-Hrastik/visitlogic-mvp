import { IncomingForm } from 'formidable';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const form = new IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ error: "Form error", details: err.message });
        }

        const audioFile = Array.isArray(files.file) ? files.file[0] : files.file;
        if (!audioFile) {
            return res.status(400).json({ error: "Nedostaje audio datoteka." });
        }

        try {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) return res.status(500).json({ error: "API ključ nije postavljen." });

            const formData = new FormData();
            formData.append('file', new Blob([fs.readFileSync(audioFile.filepath)], { type: audioFile.mimetype || 'audio/webm' }), 'audio.webm');
            formData.append('model', 'whisper-1');
            // Bez 'language' — Whisper automatski detektira jezik (hr, en, de, it...)

            const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey.trim()}`
                },
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                return res.status(response.status).json({ error: "Whisper greška", details: errData.error?.message });
            }

            const data = await response.json();
            return res.status(200).json({ text: data.text });

        } catch (e) {
            console.error("Transcription Error:", e);
            return res.status(500).json({ error: "Sistemska pogreška", details: e.message });
        } finally {
            if (audioFile?.filepath) {
                try { fs.unlinkSync(audioFile.filepath); } catch (_) {}
            }
        }
    });
}

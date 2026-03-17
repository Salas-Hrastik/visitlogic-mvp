import { IncomingForm } from 'formidable';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

// Konverzija ćirilice u latinicu — sprječava da Whisper vrati ćirilični tekst
// (Whisper ponekad auto-detektira srpski i transkribiraj ćirilicom)
function cyrillicToLatin(text) {
    const map = {
        'а':'a','б':'b','в':'v','г':'g','д':'d','ђ':'đ','е':'e','ж':'ž','з':'z',
        'и':'i','ј':'j','к':'k','л':'l','љ':'lj','м':'m','н':'n','њ':'nj',
        'о':'o','п':'p','р':'r','с':'s','т':'t','ћ':'ć','у':'u','ф':'f',
        'х':'h','ц':'c','ч':'č','џ':'dž','ш':'š','щ':'šč','ю':'ju','я':'ja',
        'ъ':'','ь':'','ы':'i','э':'e','ё':'jo',
        'А':'A','Б':'B','В':'V','Г':'G','Д':'D','Ђ':'Đ','Е':'E','Ж':'Ž','З':'Z',
        'И':'I','Ј':'J','К':'K','Л':'L','Љ':'Lj','М':'M','Н':'N','Њ':'Nj',
        'О':'O','П':'P','Р':'R','С':'S','Т':'T','Ћ':'Ć','У':'U','Ф':'F',
        'Х':'H','Ц':'C','Ч':'Č','Џ':'Dž','Ш':'Š','Щ':'Šč','Ю':'Ju','Я':'Ja',
        'Ъ':'','Ь':'','Ы':'I','Э':'E','Ё':'Jo'
    };
    // Zamijeni višeznačne kombinacije prije pojedinačnih znakova
    return text
        .replace(/Љ/g, 'Lj').replace(/Њ/g, 'Nj').replace(/Џ/g, 'Dž')
        .replace(/Щ/g, 'Šč').replace(/Ю/g, 'Ju').replace(/Я/g, 'Ja')
        .replace(/љ/g, 'lj').replace(/њ/g, 'nj').replace(/џ/g, 'dž')
        .replace(/щ/g, 'šč').replace(/ю/g, 'ju').replace(/я/g, 'ja')
        .replace(/[\u0400-\u04FF]/g, c => map[c] || c);
}

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
            // Prompt navodi Whisper da preferira latinično pismo i kontekst turizma u Hrvatskoj
            formData.append('prompt', 'Turistički chatbot za Valpovo, Hrvatska. Transkribiraj isključivo latiničnim pismom.');

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
            // Post-processing: konvertira svaki preostali ćirilični znak u latinicu
            const latinText = cyrillicToLatin(data.text || '');
            return res.status(200).json({ text: latinText });

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

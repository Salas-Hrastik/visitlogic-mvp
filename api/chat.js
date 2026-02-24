import fs from "fs";
import path from "path";

function detectLanguage(text) {
    const t = text.toLowerCase();
    if (/[äöüß]/.test(t) || t.includes("unterkunft") || t.includes("sehenswürdigkeiten")) return "de";
    if (t.includes("accommodation") || t.includes("sightseeing") || t.includes("where to stay")) return "en";
    return "hr";
}

function buildResponse(items, fields, intro, lang) {
    if (!items || items.length === 0) return null;
    const list = items.map(item => {
        const parts = fields.map(f => item[f]).filter(Boolean);
        return "• " + parts.join(" – ");
    }).join("\n");
    return `${intro}\n${list}`;
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        const lang = detectLanguage(message);
        const dbPath = path.join(process.cwd(), "data", "valpovo.json");
        const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        const q = message.toLowerCase();
        let reply = "";

        // --- ZNAMENITOSTI ---
        if (q.includes("znamenit") || q.includes("posjet") || q.includes("vidjeti") || q.includes("što ima") ||
            q.includes("sightseeing") || q.includes("visit") || q.includes("what to see") ||
            q.includes("sehenswürdig") || q.includes("dvorac") || q.includes("muzej") || q.includes("kazalište") ||
            q.includes("katančić") || q.includes("kula") || q.includes("crkv")) {
            const intro = lang === "hr" ? "🏛️ Znamenitosti u Valpovu:" :
                lang === "en" ? "🏛️ Sights in Valpovo:" :
                    "🏛️ Sehenswürdigkeiten in Valpovo:";
            reply = buildResponse(db.znamenitosti, ["naziv", "opis"], intro, lang);
        }
        // --- GASTRONOMIJA ---
        else if (q.includes("restoran") || q.includes("jesti") || q.includes("gastronomij") || q.includes("hrana") ||
            q.includes("pizza") || q.includes("kavana") || q.includes("kafić") || q.includes("piće") ||
            q.includes("food") || q.includes("restaurant") || q.includes("eat") || q.includes("essen")) {
            const intro = lang === "hr" ? "🍽️ Ugostitelji u Valpovu:" :
                lang === "en" ? "🍽️ Places to eat in Valpovo:" :
                    "🍽️ Gastronomie in Valpovo:";
            reply = buildResponse(db.gastronomija, ["naziv", "tip"], intro, lang);
            if (lang === "hr") {
                reply += "\n\n🥩 Slavonska jela koja morate probati:\n" +
                    db.specijalizirana_jela.map(j => `• **${j.naziv}** – ${j.opis}`).join("\n");
            }
        }
        // --- KULEN / TRADICIJSKA JELA ---
        else if (q.includes("kulen") || q.includes("čobanac") || q.includes("fiš") || q.includes("paprikaš") ||
            q.includes("rakij") || q.includes("slavonsk")) {
            const intro = lang === "hr" ? "🥩 Slavonska gastro baština:" :
                lang === "en" ? "🥩 Slavonian culinary heritage:" :
                    "🥩 Das kulinarische Erbe der Slawonien:";
            reply = buildResponse(db.specijalizirana_jela, ["naziv", "opis"], intro, lang);
        }
        // --- SMJEŠTAJ ---
        else if (q.includes("smještaj") || q.includes("hotel") || q.includes("spavat") || q.includes("noćenje") ||
            q.includes("apartman") || q.includes("sobe") || q.includes("prenoćišt") ||
            q.includes("accommodation") || q.includes("stay") || q.includes("unterkunft")) {
            const intro = lang === "hr" ? "🏨 Smještajni objekti u Valpovu:" :
                lang === "en" ? "🏨 Accommodation in Valpovo:" :
                    "🏨 Unterkunft in Valpovo:";
            const lista = db.smjestaj.map(s => `• ${s.naziv} (${s.tip})`).join("\n");
            reply = `${intro}\n${lista}`;
            if (lang === "hr") {
                reply += "\n\n📍 Detalje, kontakte i Google Maps lokacije svakog objekta pronađite na:\nhttps://tz.valpovo.hr/smjestaj-u-valpovu";
            } else if (lang === "en") {
                reply += "\n\n📍 Details, contacts and Google Maps for each property:\nhttps://tz.valpovo.hr/smjestaj-u-valpovu";
            } else {
                reply += "\n\n📍 Details und Google Maps für jede Unterkunft:\nhttps://tz.valpovo.hr/smjestaj-u-valpovu";
            }
        }
        // --- DOGADANJA / MANIFESTACIJE ---
        else if (q.includes("događaj") || q.includes("manifestacij") || q.includes("festival") || q.includes("program") ||
            q.includes("advent") || q.includes("karneval") || q.includes("fišijada") || q.includes("vashar") ||
            q.includes("events") || q.includes("what's on") || q.includes("veranstaltung")) {
            const intro = lang === "hr" ? "🎉 Manifestacije i događanja u Valpovu:" :
                lang === "en" ? "🎉 Events in Valpovo:" :
                    "🎉 Veranstaltungen in Valpovo:";
            reply = buildResponse(db.dogadanja, ["naziv", "vrijeme"], intro, lang);
        }
        // --- PRIRODA ---
        else if (q.includes("priroda") || q.includes("šetnja") || q.includes("bicikl") || q.includes("rijeka") ||
            q.includes("karašica") || q.includes("staza") || q.includes("park") || q.includes("rekreacij") ||
            q.includes("nature") || q.includes("cycling") || q.includes("hiking") || q.includes("natur")) {
            const intro = lang === "hr" ? "🌿 Priroda i rekreacija u Valpovu:" :
                lang === "en" ? "🌿 Nature & outdoors in Valpovo:" :
                    "🌿 Natur und Erholung in Valpovo:";
            reply = buildResponse(db.priroda, ["naziv", "opis"], intro, lang);
        }
        // --- KONTAKT / INFORMACIJE ---
        else if (q.includes("kontakt") || q.includes("informacij") || q.includes("turistička zajednica") ||
            q.includes("telefon") || q.includes("adresa") || q.includes("radno vrijme") ||
            q.includes("contact") || q.includes("info") || q.includes("how to get") ||
            q.includes("kontakt") || q.includes("gdje je")) {
            const tz = db.korisne_informacije.kontakt_tz;
            if (lang === "hr") {
                reply = `📍 **Turistička zajednica Grada Valpova**\n${tz.adresa}\n📞 ${tz.telefon} | ${tz.mobitel1}\n✉️ ${tz.email}\n🌐 ${tz.web}`;
            } else if (lang === "en") {
                reply = `📍 **Tourist Board of Valpovo**\n${tz.adresa}\n📞 ${tz.telefon}\n✉️ ${tz.email}\n🌐 ${tz.web}`;
            } else {
                reply = `📍 **Tourismusverband der Stadt Valpovo**\n${tz.adresa}\n📞 ${tz.telefon}\n✉️ ${tz.email}\n🌐 ${tz.web}`;
            }
        }
        // --- KAKO DOĆI ---
        else if (q.includes("kako doći") || q.includes("prijevoz") || q.includes("autobus") || q.includes("vlak") ||
            q.includes("how to get") || q.includes("transport") || q.includes("anreise")) {
            const dolazak = db.korisne_informacije.kako_doci;
            reply = lang === "hr"
                ? `🚗 **Kako doći u Valpovo:**\n• Auto: ${dolazak.auto}\n• Vlak: ${dolazak.vlak}\n• Autobus: ${dolazak.autobus}`
                : `🚗 **Getting to Valpovo:**\n• By car: ${dolazak.auto}\n• By train: ${dolazak.vlak}\n• By bus: ${dolazak.autobus}`;
        }
        // --- DEFAULT ---
        else {
            if (lang === "hr") {
                reply = `Mogu vam pomoći s informacijama o:\n🏛️ **Znamenitostima** – Dvorac, Muzej, Kazalište, Katančićev centar...\n🍽️ **Gastronomiji** – restorani, slavonska kuhinja, fiš paprikaš, kulen\n🏨 **Smještaju** – hoteli i apartmani\n🎉 **Događanjima** – festivali, manifestacije, advent\n🌿 **Prirodi** – Karašica, šetnje, biciklizam\n📍 **Kontaktu** – Turistička zajednica Valpova\n\nO čemu biste željeli saznati više?`;
            } else if (lang === "en") {
                reply = `I can help you with information about:\n🏛️ **Sights** – Castle, Museum, Theatre, Katančić Centre...\n🍽️ **Food & Restaurants** – Slavonian cuisine, local specialties\n🏨 **Accommodation** – Hotels and apartments\n🎉 **Events** – Festivals and local events\n🌿 **Nature** – Karašica river, cycling, hiking\n📍 **Contact** – Tourist Board of Valpovo\n\nWhat would you like to know?`;
            } else {
                reply = `Ich kann Ihnen helfen mit:\n🏛️ **Sehenswürdigkeiten** – Schloss, Museum, Theater...\n🍽️ **Gastronomie** – Slawonische Küche, lokale Spezialitäten\n🏨 **Unterkunft** – Hotels und Apartments\n🎉 **Veranstaltungen** – Festivals und Events\n🌿 **Natur** – Karašica, Radwege\n📍 **Kontakt** – Tourist Board\n\nWas möchten Sie wissen?`;
            }
        }

        return res.status(200).json({ reply });

    } catch (error) {
        console.error("Chat API Error:", error);
        return res.status(500).json({ error: "Failed to process chat", details: error.message });
    }
}

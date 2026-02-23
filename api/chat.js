import fs from "fs";
import path from "path";

function detectLanguage(text) {
  const t = text.toLowerCase();

  if (/[äöüß]/.test(t) || t.includes("unterkunft") || t.includes("hotel in")) return "de";
  if (t.includes("accommodation") || t.includes("hotel") && t.includes("where")) return "en";
  return "hr";
}

function getTexts(lang) {
  const texts = {
    hr: {
      choose: "Molimo odaberite vrstu smještaja:",
      option1: "Hotel",
      option2: "Privatni apartman",
      option3: "Sobe / pansion",
      results: "Rezultati",
      maps: "Otvori na Google Maps"
    },
    en: {
      choose: "Please choose accommodation type:",
      option1: "Hotel",
      option2: "Private apartment",
      option3: "Rooms / guesthouse",
      results: "Results",
      maps: "Open on Google Maps"
    },
    de: {
      choose: "Bitte wählen Sie die Unterkunftsart:",
      option1: "Hotel",
      option2: "Privates Apartment",
      option3: "Zimmer / Pension",
      results: "Ergebnisse",
      maps: "Auf Google Maps öffnen"
    }
  };

  return texts[lang];
}

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {

    const { message } = req.body;
    const userQuery = message.trim().toLowerCase();

    const language = detectLanguage(message);
    const t = getTexts(language);

    const filePath = path.join(process.cwd(), "data", "smjestaj.json");
    const rawData = fs.readFileSync(filePath, "utf8");
    const smjestajData = JSON.parse(rawData);
    const objekti = smjestajData.smjestaj;

    /* ===== STEP 1 – ASK TYPE ===== */

    if (
      userQuery === "smještaj" ||
      userQuery === "smjestaj" ||
      userQuery === "accommodation" ||
      userQuery === "unterkunft"
    ) {

      return res.status(200).json({
        reply: `
${t.choose}

1️⃣ ${t.option1}  
2️⃣ ${t.option2}  
3️⃣ ${t.option3}

`
      });
    }

    /* ===== STEP 2 – HANDLE SELECTION ===== */

    let filtrirani = [];

    if (userQuery === "1") {
      filtrirani = objekti.filter(o =>
        o.vrsta?.toLowerCase().includes("hotel")
      );
    }

    if (userQuery === "2") {
      filtrirani = objekti.filter(o =>
        o.vrsta?.toLowerCase().includes("apartman")
      );
    }

    if (userQuery === "3") {
      filtrirani = objekti.filter(o =>
        o.vrsta?.toLowerCase().includes("sobe")
      );
    }

    if (filtrirani.length > 0) {

      filtrirani = filtrirani.sort((a, b) =>
        (b.ocjena || 0) - (a.ocjena || 0)
      );

      let odgovor = `<h3>${t.results}</h3>`;

      filtrirani.forEach((o, index) => {
        odgovor += `
          <div style="margin-bottom:6px;">
            <strong>${index + 1}. ${o.naziv}</strong><br/>
            ${o.adresa}<br/>
            ⭐ ${o.ocjena ?? "N/A"} (${o.broj_recenzija ?? 0})<br/>
            <a href="${o.google_maps_url}" target="_blank">${t.maps}</a>
          </div>
        `;
      });

      return res.status(200).json({ reply: odgovor });
    }

    /* ===== OTHER REQUESTS → OPENAI ===== */

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
            content: `
Ti si službeni turistički informator grada Valpova.
Odgovaraj profesionalno.
Uvijek odgovaraj na jeziku korisnika.
`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.6
      })
    });

    const data = await openaiResponse.json();

    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "No response."
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      reply: "Server error."
    });
  }
}

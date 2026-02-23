import fs from "fs";
import path from "path";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {

    const { message } = req.body;
    const userQuery = message.toLowerCase().trim();

    const filePath = path.join(process.cwd(), "data", "smjestaj.json");
    const rawData = fs.readFileSync(filePath, "utf8");
    const smjestajData = JSON.parse(rawData);
    const objekti = smjestajData.smjestaj;

    /* ===================================== */
    /* ===== 1. PRVI KORAK – PITANJE ====== */
    /* ===================================== */

    if (userQuery === "smještaj" || userQuery === "smjestaj") {

      return res.status(200).json({
        reply: `
Molimo odaberite vrstu smještaja:

1️⃣ Hotel  
2️⃣ Privatni apartman  
3️⃣ Sobe / pansion  

Upišite broj opcije.
        `
      });
    }

    /* ===================================== */
    /* ===== 2. ODABIR PREMA BROJU ======== */
    /* ===================================== */

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

      filtrirani = filtrirani
        .sort((a, b) => (b.ocjena || 0) - (a.ocjena || 0));

      let odgovor = `<h3>Rezultati:</h3>`;

      filtrirani.forEach((o, index) => {
        odgovor += `
          <div style="margin-bottom:8px;">
            <strong>${index + 1}. ${o.naziv}</strong><br/>
            Ocjena: ${o.ocjena ?? "N/A"} (${o.broj_recenzija ?? 0})<br/>
            ${o.adresa}<br/>
            <a href="${o.google_maps_url}" target="_blank">Google Maps</a>
          </div>
        `;
      });

      return res.status(200).json({ reply: odgovor });
    }

    /* ===================================== */
    /* ===== OSTALI UPITI → OPENAI ======== */
    /* ===================================== */

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
            content: "Ti si službeni turistički informator grada Valpova. Odgovaraj profesionalno i sažeto."
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
      reply: data.choices?.[0]?.message?.content || "Trenutno nema odgovora."
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      reply: "Došlo je do greške pri obradi zahtjeva."
    });
  }
}

import fs from "fs";
import path from "path";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {

    const { message } = req.body;
    const userQuery = message.toLowerCase();

    /* ===== UČITAVANJE JSON PODATAKA ===== */

    const filePath = path.join(process.cwd(), "data", "smjestaj.json");
    const rawData = fs.readFileSync(filePath, "utf8");
    const smjestajData = JSON.parse(rawData);
    const objekti = smjestajData.smjestaj;

    /* ===== FILTRACIJA ===== */

    let filtrirani = objekti;

    if (userQuery.includes("hotel")) {
      filtrirani = objekti.filter(o => o.vrsta?.includes("hotel"));
    }

    if (userQuery.includes("apartman")) {
      filtrirani = objekti.filter(o => o.vrsta?.includes("apartman"));
    }

    if (userQuery.includes("hostel")) {
      filtrirani = objekti.filter(o => o.vrsta?.includes("hostel"));
    }

    if (userQuery.includes("povolj")) {
      filtrirani = objekti.filter(o =>
        o.razina_cijene &&
        o.razina_cijene.toLowerCase().includes("povolj")
      );
    }

    if (userQuery.includes("bicikl")) {
      filtrirani = objekti.filter(o =>
        o.sadrzaj?.some(s =>
          s.toLowerCase().includes("bicikl")
        )
      );
    }

    /* ===== SORTIRANJE PO OCJENI ===== */

    filtrirani = filtrirani
      .filter(o => o.ocjena !== null && o.ocjena !== undefined)
      .sort((a, b) => b.ocjena - a.ocjena)
      .slice(0, 5);

    /* ===== SMJEŠTAJ ODGOVOR ===== */

    if (
      userQuery.includes("smještaj") ||
      userQuery.includes("hotel") ||
      userQuery.includes("apartman") ||
      userQuery.includes("hostel")
    ) {

      if (filtrirani.length === 0) {
        return res.status(200).json({
          reply: "Trenutno nemam dostupnih rezultata za traženi kriterij."
        });
      }

      let odgovor = "Preporučeni smještaj u Valpovu i okolici:\n\n";

      filtrirani.forEach((o, index) => {
        odgovor += `${index + 1}. **${o.naziv}** (${o.vrsta})\n`;
        odgovor += `Ocjena: ${o.ocjena || "N/A"} (${o.broj_recenzija || 0} recenzija)\n`;
        odgovor += `Adresa: ${o.adresa}\n`;
        odgovor += `Google Maps: ${o.google_maps_url}\n\n`;
      });

      return res.status(200).json({ reply: odgovor });
    }

    /* ===== OSTALO → OPENAI ===== */

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

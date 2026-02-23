import fs from "fs";
import path from "path";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {

    const { message } = req.body;
    const userQuery = message.toLowerCase();

    const filePath = path.join(process.cwd(), "data", "smjestaj.json");
    const rawData = fs.readFileSync(filePath, "utf8");
    const smjestajData = JSON.parse(rawData);
    const objekti = smjestajData.smjestaj;

    /* ========================================= */
    /* ===== IZLISTAVANJE CIJELOG POPISA ====== */
    /* ========================================= */

    if (
      userQuery.includes("smještaj") ||
      userQuery.includes("popis") ||
      userQuery.includes("svi objekti") ||
      userQuery.includes("izlistaj")
    ) {

      const hoteli = objekti.filter(o =>
        o.vrsta?.toLowerCase().includes("hotel")
      );

      const apartmani = objekti.filter(o =>
        o.vrsta?.toLowerCase().includes("apartman")
      );

      const sobe = objekti.filter(o =>
        o.vrsta?.toLowerCase().includes("sobe")
      );

      const hostel = objekti.filter(o =>
        o.vrsta?.toLowerCase().includes("hostel")
      );

      const ostalo = objekti.filter(o =>
        !o.vrsta?.toLowerCase().includes("hotel") &&
        !o.vrsta?.toLowerCase().includes("apartman") &&
        !o.vrsta?.toLowerCase().includes("sobe") &&
        !o.vrsta?.toLowerCase().includes("hostel")
      );

      const renderGrupa = (naslov, lista) => {
        if (lista.length === 0) return "";
        let block = `<h3 style="margin:10px 0 5px 0;">${naslov}</h3>`;
        lista.forEach(o => {
          block += `
            <div style="margin-bottom:8px;">
              <strong>${o.naziv}</strong><br/>
              Ocjena: ${o.ocjena ?? "N/A"} (${o.broj_recenzija ?? 0})<br/>
              ${o.adresa}<br/>
              <a href="${o.google_maps_url}" target="_blank">Google Maps</a>
            </div>
          `;
        });
        return block;
      };

      let odgovor = "";

      odgovor += renderGrupa("🏨 HOTELS", hoteli);
      odgovor += renderGrupa("🏢 APARTMANI", apartmani);
      odgovor += renderGrupa("🛏 SOBE / PANSIONI", sobe);
      odgovor += renderGrupa("🛌 HOSTELI", hostel);
      odgovor += renderGrupa("🏠 OSTALO", ostalo);

      return res.status(200).json({ reply: odgovor });
    }

    /* ========================================= */
    /* ===== OSTALI UPITI → OPENAI ============ */
    /* ========================================= */

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

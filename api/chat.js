import fs from "fs";
import path from "path";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {

    const { message } = req.body;
    const userQuery = message.toLowerCase();

    /* ============================= */
    /* ===== UČITAVANJE JSON ======= */
    /* ============================= */

    const filePath = path.join(process.cwd(), "data", "smjestaj.json");
    const rawData = fs.readFileSync(filePath, "utf8");
    const smjestajData = JSON.parse(rawData);
    const objekti = smjestajData.smjestaj;

    /* ===================================================== */
    /* ===== IZLISTAVANJE SVIH SMJEŠTAJNIH OBJEKATA ======== */
    /* ===================================================== */

    if (
      userQuery.includes("svi smještaj") ||
      userQuery.includes("popis smještaj") ||
      userQuery.includes("izlistaj smještaj") ||
      userQuery.includes("svi smještajni objekti")
    ) {

      const hoteli = objekti.filter(o =>
        o.vrsta?.toLowerCase().includes("hotel")
      );

      const privatni = objekti.filter(o =>
        !o.vrsta?.toLowerCase().includes("hotel")
      );

      let odgovor = `<h3>🏨 HOTELS</h3>`;

      hoteli.forEach((o, index) => {
        odgovor += `
          <div style="margin-bottom:20px;">
            <strong>${index + 1}. ${o.naziv}</strong><br/>
            Vrsta: ${o.vrsta}<br/>
            Ocjena: ${o.ocjena ?? "N/A"} (${o.broj_recenzija ?? 0} recenzija)<br/>
            Adresa: ${o.adresa}<br/>
            <a href="${o.google_maps_url}" target="_blank">📍 Otvori na Google Maps</a>
          </div>
        `;
      });

      odgovor += `<h3>🏡 PRIVATNI SMJEŠTAJ / APARTMANI / SOBE / HOSTELI</h3>`;

      privatni.forEach((o, index) => {
        odgovor += `
          <div style="margin-bottom:20px;">
            <strong>${index + 1}. ${o.naziv}</strong><br/>
            Vrsta: ${o.vrsta}<br/>
            Ocjena: ${o.ocjena ?? "N/A"} (${o.broj_recenzija ?? 0} recenzija)<br/>
            Adresa: ${o.adresa}<br/>
            <a href="${o.google_maps_url}" target="_blank">📍 Otvori na Google Maps</a>
          </div>
        `;
      });

      return res.status(200).json({ reply: odgovor });
    }

    /* ===================================================== */
    /* ===== FILTRIRANA PREPORUKA (TOP 5) ================== */
    /* ===================================================== */

    if (
      userQuery.includes("smještaj") ||
      userQuery.includes("hotel") ||
      userQuery.includes("apartman") ||
      userQuery.includes("hostel")
    ) {

      let filtrirani = objekti;

      if (userQuery.includes("hotel")) {
        filtrirani = objekti.filter(o =>
          o.vrsta?.toLowerCase().includes("hotel")
        );
      }

      if (userQuery.includes("apartman")) {
        filtrirani = objekti.filter(o =>
          o.vrsta?.toLowerCase().includes("apartman")
        );
      }

      if (userQuery.includes("hostel")) {
        filtrirani = objekti.filter(o =>
          o.vrsta?.toLowerCase().includes("hostel")
        );
      }

      filtrirani = filtrirani
        .filter(o => o.ocjena !== null && o.ocjena !== undefined)
        .sort((a, b) => b.ocjena - a.ocjena)
        .slice(0, 5);

      if (filtrirani.length === 0) {
        return res.status(200).json({
          reply: "Trenutno nemam dostupnih rezultata za traženi kriterij."
        });
      }

      let odgovor = `<h3>Preporučeni smještaj (Top ocjene)</h3>`;

      filtrirani.forEach((o, index) => {
        odgovor += `
          <div style="margin-bottom:20px;">
            <strong>${index + 1}. ${o.naziv}</strong><br/>
            Vrsta: ${o.vrsta}<br/>
            Ocjena: ${o.ocjena ?? "N/A"} (${o.broj_recenzija ?? 0} recenzija)<br/>
            Adresa: ${o.adresa}<br/>
            <a href="${o.google_maps_url}" target="_blank">📍 Otvori na Google Maps</a>
          </div>
        `;
      });

      return res.status(200).json({ reply: odgovor });
    }

    /* ===================================================== */
    /* ===== OSTALI UPITI → OPENAI ========================= */
    /* ===================================================== */

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

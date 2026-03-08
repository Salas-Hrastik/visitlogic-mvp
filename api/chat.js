import fs from "fs";
import path from "path";

export default async function handler(req, res) {

try {

const { conversation } = req.body;

const message =
conversation?.[conversation.length - 1]?.content?.toLowerCase() || "";

const dataPath = path.join(process.cwd(), "data", "biograd.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

let reply = "";

if (message.includes("plaž")) {

reply = data.plaze.map(p => `
<div class="card">

<h3>🏖 ${p.naziv}</h3>

<p>${p.opis}</p>

${p.znacajke.map(z => `• ${z}`).join("<br>")}

<br><br>

<a class="map-btn"
href="${p.maps}"
target="_blank">

📍 Otvori na Google Maps

</a>

</div>
`).join("");

}

else {

reply = `
<div class="card">
👋 Pitajte me o:
<br><br>
🏖 plažama<br>
🍽 restoranima<br>
🏛 znamenitostima<br>
🎉 događanjima
</div>
`;

}

res.status(200).json({ reply });

} catch (error) {

console.error(error);

res.status(500).json({
reply:"Greška u komunikaciji sa serverom."
});

}

}

import fs from "fs"

const data = JSON.parse(
  fs.readFileSync("./data/biograd_osm.json", "utf8")
)

const cleaned = data

fs.writeFileSync(
  "./data/biograd_clean.json",
  JSON.stringify(cleaned, null, 2)
)

console.log("Objekata u bazi:", cleaned.length)

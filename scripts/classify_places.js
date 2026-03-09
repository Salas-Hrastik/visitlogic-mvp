import fs from "fs"

const data = JSON.parse(
  fs.readFileSync("./data/biograd_clean.json", "utf8")
)

function odrediTip(kategorija) {
  if (!kategorija) return "ostalo"

  const k = kategorija.toLowerCase()

  // gastronomija
  if (["restaurant","cafe","bar","fast_food"].includes(k))
    return "gastronomija"

  // smještaj
  if (["hotel","guest_house","apartment","hostel"].includes(k))
    return "smještaj"

  // atrakcije
  if (["beach","museum","attraction","viewpoint","monument"].includes(k))
    return "atrakcija"

  // nautika
  if (["marina","ferry_terminal","harbour"].includes(k))
    return "nautika"

  // infrastruktura
  if ([
    "parking",
    "atm",
    "pharmacy",
    "hospital",
    "fuel",
    "bank",
    "police",
    "toilets",
    "car_repair",
    "supermarket",
    "convenience"
  ].includes(k))
    return "infrastruktura"

  return "ostalo"
}

const rezultat = data.map(obj => ({
  ...obj,
  tip: odrediTip(obj.kategorija)
}))

fs.writeFileSync(
  "./data/biograd_destinacija.json",
  JSON.stringify(rezultat, null, 2)
)

console.log("Objekata u bazi:", rezultat.length)
console.log("Nova baza kreirana: data/biograd_destinacija.json")

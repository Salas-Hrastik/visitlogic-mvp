import fs from "fs"

const data = JSON.parse(
  fs.readFileSync("./data/biograd_destinacija.json", "utf8")
)

// lokacija korisnika (primjer: centar Biograda)
const userLat = 43.9375
const userLon = 15.4410

function udaljenost(lat1, lon1, lat2, lon2) {

  const R = 6371 // radius Earth km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180

  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI/180) *
    Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c
}

const sUdaljenosti = data.map(obj => {

  const d = udaljenost(
    userLat,
    userLon,
    obj.lat,
    obj.lon
  )

  return {
    ...obj,
    udaljenost_km: d
  }

})

sUdaljenosti.sort((a,b) => a.udaljenost_km - b.udaljenost_km)

const najblizi = sUdaljenosti.slice(0,10)

console.log("Najbližih 10 objekata:\n")

najblizi.forEach(o => {

  console.log(
    o.naziv,
    "|",
    o.kategorija,
    "|",
    (o.udaljenost_km*1000).toFixed(0),
    "m"
  )

})

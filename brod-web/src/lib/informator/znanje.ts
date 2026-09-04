import type { Jezik } from "@/lib/content/types";
import { putanja, slugZa, tekst } from "@/lib/i18n";
import {
  sveAtrakcije, svaDogadanja, sveNovosti, savSmjestaj, sviUgostitelji, statusDogadaja,
} from "@/lib/content/source";

/**
 * Pogl. 9.3, izvor 1: baza znanja gradi se iz STRUKTURIRANOG izvoza entiteta,
 * nikad iz HTML-a stranica. Zato ovdje ide isti izvor koji hrani i stranice —
 * informator i sjedište ne mogu se raziću.
 *
 * Strategija predviđa vektorsku bazu. Za ovaj opseg (dvadesetak entiteta) cijela
 * baza stane u jedan zahtjev, što je točnije i jeftinije od dohvaćanja po
 * sličnosti: model vidi sve, pa ne može promašiti zapis. Vektorska baza postaje
 * potrebna tek kad znanje preraste kontekst (vidi ODLUKE.md, O9).
 */
export async function bazaZnanja(jezik: Jezik): Promise<string> {
  const [atr, dog, nov, smj, ugo] = await Promise.all([
    sveAtrakcije(), svaDogadanja(), sveNovosti(), savSmjestaj(), sviUgostitelji(),
  ]);
  const T = (p: Parameters<typeof tekst<string>>[0]) => tekst(p, jezik).v;
  const r: string[] = [];

  r.push("## ATRAKCIJE");
  for (const a of atr) {
    r.push([
      `- ${T(a.naziv)}`,
      `  URL: ${putanja({ vrsta: "atrakcija", slug: slugZa(a, jezik) }, jezik)}`,
      `  Opis: ${T(a.uvodniOpis)}`,
      `  Adresa: ${a.adresa}`,
      a.radnoVrijeme ? `  Radno vrijeme: ${T(a.radnoVrijeme)}` : null,
      `  Cijena: ${a.cijene.besplatno ? "besplatno" : `${a.cijene.odrasli} EUR${a.cijene.demo ? " (NIJE POTVRĐENO NA IZVORU)" : ""}`}`,
      `  Trajanje posjeta: ${a.trajanjePosjeta.min}–${a.trajanjePosjeta.max} min`,
      `  Zadnja provjera: ${a.zadnjaProvjera}`,
    ].filter(Boolean).join("\n"));
  }

  r.push("\n## DOGAĐANJA");
  for (const d of dog) {
    r.push([
      `- ${T(d.naziv)} [${statusDogadaja(d)}]`,
      `  URL: ${putanja({ vrsta: "dogadaj", godina: d.pocetak.slice(0, 4), mjesec: d.pocetak.slice(5, 7), slug: slugZa(d, jezik) }, jezik)}`,
      `  Termin: ${d.pocetak} – ${d.kraj}`,
      `  Mjesto: ${d.lokacija.naziv}`,
      `  Cijena: ${d.cijena.besplatno ? "besplatno" : `od ${d.cijena.od} EUR`}`,
      `  Opis: ${T(d.uvodniOpis)}`,
    ].join("\n"));
  }

  r.push("\n## SMJEŠTAJ");
  for (const x of smj) {
    r.push([
      `- ${T(x.naziv)} (${x.tip})`,
      `  URL: ${putanja({ vrsta: "smjestaj", slug: slugZa(x, jezik) }, jezik)}`,
      `  Adresa: ${x.adresa}`,
      `  Pogodnosti: ${x.pogodnosti.join(", ")}`,
      x.ocjena ? `  Ocjena: ${x.ocjena.prosjek}/5 (${x.ocjena.broj} ocjena, Google Maps)` : null,
      x.kontakt.tel ? `  Telefon: ${x.kontakt.tel}` : null,
      `  Rezervacija: samo upit preko TZ-a, cijene nisu na sjedištu`,
    ].filter(Boolean).join("\n"));
  }

  r.push("\n## GDJE JESTI");
  for (const x of ugo) {
    r.push([
      `- ${T(x.naziv)} (${x.tip})`,
      `  URL: ${putanja({ vrsta: "ugostitelj", slug: slugZa(x, jezik) }, jezik)}`,
      `  Adresa: ${x.adresa}`,
      `  Kuhinja: ${x.kuhinja.join(", ")}`,
      `  Radno vrijeme: ${T(x.radnoVrijeme)}`,
      `  Cjenovni rang: ${"€".repeat(x.cjenovniRang)}`,
      x.ocjena ? `  Ocjena: ${x.ocjena.prosjek}/5 (${x.ocjena.broj} ocjena, Google Maps)` : null,
    ].filter(Boolean).join("\n"));
  }

  r.push("\n## NOVOSTI I OBAVIJESTI");
  for (const n of nov) {
    r.push(`- ${n.datum} [${n.tip}] ${T(n.naziv)}\n  URL: ${putanja({ vrsta: "novost", slug: slugZa(n, jezik) }, jezik)}\n  ${T(n.uvodniOpis)}`);
  }

  r.push("\n## CENTAR ZA POSJETITELJE");
  r.push("- Trg pobjede 28, 35000 Slavonski Brod\n  Telefon: +385 35 447 721\n  E-pošta: info@tzgsb.hr\n  Radno vrijeme: pon–pet 8–16, sub 8–12, nedjeljom zatvoreno");

  return r.join("\n");
}

/** Pogl. 9.4: sustavska uputa, prenesena iz Strategije. */
export function sustavskaUputa(jezik: Jezik, znanje: string): string {
  const naJeziku = { hr: "hrvatskom", en: "engleskom", de: "njemačkom" }[jezik];
  return `Ti si turistički informator Turističke zajednice grada Slavonskog Broda.

Odgovaraš ISKLJUČIVO na temelju konteksta ispod, koji dolazi iz službenih izvora TZ-a.
Ako kontekst ne sadrži odgovor, reci to izravno i uputi na Centar za posjetitelje.
Nikada ne izmišljaj datume, cijene, radna vremena ni kontakte.
Uvijek navedi poveznicu na izvornu stranicu kad je imaš.
Odgovaraj kratko (2–4 rečenice), konkretno i gostoljubivo, na ${naJeziku} jeziku.
Ne raspravljaj o temama izvan turizma i destinacije.

Dodatna pravila:
- Cijene i dostupnost nikad ne izmišljaj. Ako je cijena označena kao NIJE POTVRĐENO
  NA IZVORU, navedi je uz napomenu da je treba provjeriti kod objekta.
- Smještaj se ne rezervira preko sjedišta — upućuj na upit Centru za posjetitelje.
- Ako pitanje izlazi izvan turizma (politika, medicina, osobni savjeti), ljubazno
  odbij i vrati razgovor na destinaciju.
- Poveznice navodi točno onako kako su zapisane u kontekstu, kao relativne putanje.

AKO U KONTEKSTU NEMA POUZDANOG ODGOVORA, odgovori točno ovim tekstom i ničim drugim:
NEMAM_ODGOVOR

KONTEKST:
${znanje}`;
}

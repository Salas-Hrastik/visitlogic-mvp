import type { BiloKojiEntitet, Novost } from "./types";
import { NAJMANJA_SIRINA, slikaObjavljiva } from "./types";

/**
 * Pravila koja Strategija traži, a tip ih sam ne može iznuditi.
 * Poziva se u build koraku: neispravan sadržaj ruši build, ne produkciju.
 */
export function validirajNovosti(novosti: Novost[]): string[] {
  const greske: string[] = [];
  for (const n of novosti) {
    // Pogl. 10.3, anotacija W11
    if (n.hitno && !n.objaviDo) {
      greske.push(`Novost "${n.id}": hitna obavijest bez polja objaviDo.`);
    }
    if (n.objaviDo && n.objaviDo < n.datum) {
      greske.push(`Novost "${n.id}": objaviDo je prije datuma objave.`);
    }
  }
  return greske;
}


/**
 * Pogl. 5.3.3 — automatske provjere pri uvozu. Zapisi koji ne prođu idu u red
 * „Za pregled" i NE objavljuju se automatski. Ovdje se zato ne ruši build nego
 * se vraća popis: odluka o objavi je urednička, ali mora biti svjesna.
 */
export function pregledajSlike(entiteti: BiloKojiEntitet[]): string[] {
  const nalazi: string[] = [];
  for (const e of entiteti) {
    for (const m of e.medij ?? []) {
      if (!m.alt?.hr) nalazi.push(`${e.id} · ${m.datoteka}: nema alt teksta — bez njega se ne može objaviti (E13).`);
      if (!m.autor) nalazi.push(`${e.id} · ${m.datoteka}: nema autora (E13).`);
      if (!slikaObjavljiva(m)) {
        nalazi.push(`${e.id} · ${m.datoteka}: licencija nije utvrđena (5.3.2, t. 2) — ne objavljuje se.`);
      }
      if (m.sirina < NAJMANJA_SIRINA) {
        nalazi.push(`${e.id} · ${m.datoteka}: ${m.sirina} px — ispod praga od ${NAJMANJA_SIRINA} px (5.3.3).`);
      }
    }
  }
  return nalazi;
}

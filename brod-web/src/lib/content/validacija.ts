import type { Novost } from "./types";

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

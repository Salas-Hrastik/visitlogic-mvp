import type { Atrakcija, Dogadaj, Novost, Smjestaj, Status, Ugostitelj } from "./types";
import atrakcijeJson from "../../../content/atrakcije.json";
import dogadanjaJson from "../../../content/dogadanja.json";
import novostiJson from "../../../content/novosti.json";
import smjestajJson from "../../../content/smjestaj.json";
import ugostiteljiJson from "../../../content/ugostitelji.json";

/**
 * IZVOR SADRŽAJA — jedina točka dodira s pohranom.
 *
 * Danas čita JSON iz repozitorija. Kad dođe headless CMS (Pogl. 13.2), mijenja
 * se samo ova datoteka: funkcije ostaju iste i asinkrone su upravo zato da
 * prelazak na `fetch` prema CMS-u ne dira nijednu stranicu.
 *
 * Pogl. 5.1: prikazuje se samo `objavljeno`. Nacrti i arhivirano ne izlaze
 * na javno sjedište ni u feedove.
 */

const objavljeno = <T extends { status: Status }>(x: T[]) =>
  x.filter((e) => e.status === "objavljeno");

const atrakcije = objavljeno(atrakcijeJson as unknown as Atrakcija[]);
const dogadanja = objavljeno(dogadanjaJson as unknown as Dogadaj[]);
const novosti = objavljeno(novostiJson as unknown as Novost[]);
const smjestaj = objavljeno(smjestajJson as unknown as Smjestaj[]);
const ugostitelji = objavljeno(ugostiteljiJson as unknown as Ugostitelj[]);

export async function sveAtrakcije(): Promise<Atrakcija[]> {
  return atrakcije;
}

export async function svaDogadanja(): Promise<Dogadaj[]> {
  return [...dogadanja].sort((a, b) => a.pocetak.localeCompare(b.pocetak));
}

export async function sveNovosti(): Promise<Novost[]> {
  return [...novosti].sort((a, b) => b.datum.localeCompare(a.datum));
}

/** Pogl. 5.1 E5. Rangiranje: bolje ocijenjeni prvi (clanTZ ostaje otvoreno pitanje). */
export async function savSmjestaj(): Promise<Smjestaj[]> {
  return [...smjestaj].sort((a, b) => (b.ocjena?.prosjek ?? 0) - (a.ocjena?.prosjek ?? 0));
}

export async function sviUgostitelji(): Promise<Ugostitelj[]> {
  return [...ugostitelji].sort((a, b) => (b.ocjena?.prosjek ?? 0) - (a.ocjena?.prosjek ?? 0));
}

export async function smjestajPoSlugu(slug: string): Promise<Smjestaj | null> {
  return smjestaj.find((x) => Object.values(x.slug).includes(slug)) ?? null;
}

export async function ugostiteljPoSlugu(slug: string): Promise<Ugostitelj | null> {
  return ugostitelji.find((x) => Object.values(x.slug).includes(slug)) ?? null;
}

export async function atrakcijaPoSlugu(slug: string): Promise<Atrakcija | null> {
  return atrakcije.find((a) => Object.values(a.slug).includes(slug)) ?? null;
}

export async function dogadajPoSlugu(slug: string): Promise<Dogadaj | null> {
  return dogadanja.find((d) => Object.values(d.slug).includes(slug)) ?? null;
}

export async function novostPoSlugu(slug: string): Promise<Novost | null> {
  return novosti.find((n) => Object.values(n.slug).includes(slug)) ?? null;
}

/**
 * Traka hitnih obavijesti (W11).
 *
 * Anotacija uz W11: traka mora imati rok trajanja, "inače ostaje mjesecima i
 * gubi značenje". Zato objava bez `objaviDo` ovdje NE prolazi kao hitna —
 * rok je uvjet, ne ukras.
 */
export async function hitnaObavijest(danas = new Date()): Promise<Novost | null> {
  const d = danas.toISOString().slice(0, 10);
  return (
    novosti.find((n) => n.hitno === true && !!n.objaviDo && n.objaviDo >= d) ?? null
  );
}

/** Status događaja u trenutku upita — nikad se ne zapisuje u sadržaj. */
export function statusDogadaja(d: Dogadaj, danas = new Date()): "proslo" | "u-tijeku" | "nadolazi" {
  const t = danas.toISOString().slice(0, 10);
  if (d.kraj < t) return "proslo";
  if (d.pocetak > t) return "nadolazi";
  return "u-tijeku";
}

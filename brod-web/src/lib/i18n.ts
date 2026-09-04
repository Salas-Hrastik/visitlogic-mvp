import { JEZICI, ZADANI_JEZIK, type Jezik, type Lokalizirano } from "./content/types";

export { JEZICI, ZADANI_JEZIK };
export type { Jezik };

/**
 * Pogl. 7.2: poddirektorij s LOKALIZIRANIM segmentima.
 *   HR: /dogadanja/...      (bez prefiksa — zadani jezik)
 *   EN: /en/events/...
 *   DE: /de/veranstaltungen/...
 * Slug entiteta ostaje isti kad je vlastito ime, a prevodi se kad je generički.
 */
const SEG = {
  dozivi:     { hr: "dozivi",         en: "things-to-do",   de: "erleben" },
  atrakcije:  { hr: "atrakcije",      en: "attractions",    de: "sehenswuerdigkeiten" },
  dogadanja:  { hr: "dogadanja",      en: "events",         de: "veranstaltungen" },
  planiraj:   { hr: "planiraj",       en: "plan",           de: "reise-planen" },
  itinereri:  { hr: "itinereri",      en: "itineraries",    de: "reiserouten" },
  novosti:    { hr: "novosti",        en: "news",           de: "nachrichten" },
  pitaj:      { hr: "pitaj-brod",     en: "ask-brod",       de: "brod-fragen" },
  kontakt:    { hr: "kontakt",        en: "contact",        de: "kontakt" },
  pretraga:   { hr: "pretraga",       en: "search",         de: "suche" },
} as const satisfies Record<string, Record<Jezik, string>>;

export type SegKljuc = keyof typeof SEG;
export const segment = (k: SegKljuc, j: Jezik) => SEG[k][j];

export type Ruta =
  | { vrsta: "naslovnica" }
  | { vrsta: "atrakcije" }
  | { vrsta: "atrakcija"; slug: string }
  | { vrsta: "dogadanja" }
  | { vrsta: "dogadaj"; godina: string; mjesec: string; slug: string }
  | { vrsta: "itinereri" }
  | { vrsta: "itinerer"; slug: string }
  | { vrsta: "novosti" }
  | { vrsta: "novost"; slug: string }
  | { vrsta: "pitaj" }
  | { vrsta: "kontakt" }
  | { vrsta: "pretraga" };

/** Je li prvi segment prefiks jezika. HR nema prefiks (Pogl. 7.2). */
export function odvojiJezik(segmenti: string[]): { jezik: Jezik; ostatak: string[] } {
  const prvi = segmenti[0];
  if (prvi === "en" || prvi === "de") return { jezik: prvi, ostatak: segmenti.slice(1) };
  return { jezik: ZADANI_JEZIK, ostatak: segmenti };
}

/** URL → ruta. Vraća null kad putanja ne postoji (→ 404, Pogl. 4.4.4). */
export function razrijesi(segmenti: string[], j: Jezik): Ruta | null {
  const s = segmenti;
  if (s.length === 0) return { vrsta: "naslovnica" };

  const je = (k: SegKljuc, i = 0) => s[i] === SEG[k][j];

  if (je("dozivi")) {
    if (s.length === 1) return { vrsta: "atrakcije" };
    if (s.length === 3 && je("atrakcije", 1)) return { vrsta: "atrakcija", slug: s[2] };
    return null;
  }
  if (je("dogadanja")) {
    if (s.length === 1) return { vrsta: "dogadanja" };
    // /dogadanja/{godina}/{mjesec}/{slug}
    if (s.length === 4) return { vrsta: "dogadaj", godina: s[1], mjesec: s[2], slug: s[3] };
    return null;
  }
  if (je("planiraj")) {
    if (s.length === 2 && je("itinereri", 1)) return { vrsta: "itinereri" };
    if (s.length === 3 && je("itinereri", 1)) return { vrsta: "itinerer", slug: s[2] };
    return null;
  }
  if (je("novosti")) {
    if (s.length === 1) return { vrsta: "novosti" };
    if (s.length === 2) return { vrsta: "novost", slug: s[1] };
    return null;
  }
  if (s.length === 1 && je("pitaj")) return { vrsta: "pitaj" };
  if (s.length === 1 && je("kontakt")) return { vrsta: "kontakt" };
  if (s.length === 1 && je("pretraga")) return { vrsta: "pretraga" };
  return null;
}

/** Ruta → URL. Jedino mjesto na kojem se putanje sastavljaju. */
export function putanja(r: Ruta, j: Jezik): string {
  const p = (...d: string[]) => "/" + [...(j === ZADANI_JEZIK ? [] : [j]), ...d].join("/");
  switch (r.vrsta) {
    case "naslovnica": return j === ZADANI_JEZIK ? "/" : `/${j}`;
    case "atrakcije":  return p(SEG.dozivi[j]);
    case "atrakcija":  return p(SEG.dozivi[j], SEG.atrakcije[j], r.slug);
    case "dogadanja":  return p(SEG.dogadanja[j]);
    case "dogadaj":    return p(SEG.dogadanja[j], r.godina, r.mjesec, r.slug);
    case "itinereri":  return p(SEG.planiraj[j], SEG.itinereri[j]);
    case "itinerer":   return p(SEG.planiraj[j], SEG.itinereri[j], r.slug);
    case "novosti":    return p(SEG.novosti[j]);
    case "novost":     return p(SEG.novosti[j], r.slug);
    case "pitaj":      return p(SEG.pitaj[j]);
    case "kontakt":    return p(SEG.kontakt[j]);
    case "pretraga":   return p(SEG.pretraga[j]);
  }
}

/**
 * Pogl. 7.4: prijevod koji ne postoji nikad se ne prikazuje kao prazno polje —
 * pada na HR i nosi vidljivu oznaku. Zato ovo vraća i `prevedeno`.
 */
export function tekst<T>(polje: Lokalizirano<T>, j: Jezik): { v: T; prevedeno: boolean } {
  const v = polje[j];
  if (v !== undefined && v !== null && v !== ("" as unknown as T)) return { v, prevedeno: true };
  return { v: polje.hr, prevedeno: j === ZADANI_JEZIK };
}

/** Slug u traženom jeziku, s istim pravilom pada na HR. */
export const slugZa = (e: { slug: Lokalizirano }, j: Jezik) => tekst(e.slug, j).v;

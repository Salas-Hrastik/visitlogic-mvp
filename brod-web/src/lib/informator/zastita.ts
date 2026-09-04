import type { Jezik } from "@/lib/content/types";

/**
 * Pogl. 9.7 — prompt injection: filtriranje ulaza, ograničenje duljine,
 * sanitizacija. Model nema pristup nijednom alatu koji mijenja podatke, pa je
 * najgori ishod neuredan odgovor, ne izmjena sadržaja.
 */
export function ocistiUlaz(sirovo: string, najvise: number): string {
  return sirovo
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, najvise);
}

const HITNO: Record<Jezik, string[]> = {
  hr: ["hitna", "hitno", "nesreća", "nesreca", "policij", "vatrogas", "ozlijeđ", "ozlijed", "krvar", "otrovan"],
  en: ["emergency", "ambulance", "accident", "police", "fire brigade", "injured", "bleeding", "poisoned"],
  de: ["notfall", "notarzt", "unfall", "polizei", "feuerwehr", "verletzt", "blutung", "vergiftet"],
};

const BROJEVI: Record<Jezik, string> = {
  hr: "**Hitne službe: 112** — jedinstveni broj za sve hitne situacije u Hrvatskoj.\n\nPolicija 192 · Hitna pomoć 194 · Vatrogasci 193.\n\nOvo je automatski asistent i ne može pozvati pomoć umjesto vas — nazovite 112.",
  en: "**Emergency services: 112** — the single emergency number in Croatia.\n\nPolice 192 · Ambulance 194 · Fire brigade 193.\n\nThis is an automated assistant and cannot call for help on your behalf — please dial 112.",
  de: "**Notruf: 112** — einheitliche Notrufnummer in Kroatien.\n\nPolizei 192 · Rettungsdienst 194 · Feuerwehr 193.\n\nDies ist ein automatischer Assistent und kann keine Hilfe für Sie rufen — bitte wählen Sie 112.",
};

/**
 * Pogl. 9.4, hitne situacije: prepoznaje ključne riječi i odmah prikazuje
 * brojeve, BEZ generiranja. Provjerava se u sva tri jezika jer se u panici
 * piše na materinjem, ne na jeziku sučelja.
 */
export function hitanSlucaj(pitanje: string, jezik: Jezik): string | null {
  const p = pitanje.toLowerCase();
  const pogodak = Object.values(HITNO).some((rijeci) => rijeci.some((r) => p.includes(r)));
  return pogodak ? BROJEVI[jezik] : null;
}

/**
 * Pogl. 9.6: „Pitanja bez odgovora → rangirana lista → novi FAQ zapisi.”
 * Dokument to zove najkonkretnijim mehanizmom kontinuiranog poboljšanja koji
 * sjedište može imati, pa red za uredništvo postoji od prvog dana.
 *
 * Zapisuje se samo pitanje i jezik, uz anonimizaciju iz Pogl. 9.7 — nikad IP.
 * Zasad ide u zapisnik; kad dođe baza, mijenja se samo ova funkcija.
 */
export async function zabiljeziBezOdgovora(pitanje: string, jezik: Jezik): Promise<void> {
  const anonimno = pitanje
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[e-posta]")
    .replace(/(?:\+?\d[\s/-]?){8,}/g, "[telefon]")
    .replace(/\b\d{11}\b/g, "[OIB]");
  console.info(JSON.stringify({
    dogadaj: "informator_bez_odgovora",
    jezik,
    pitanje: anonimno,
    vrijeme: new Date().toISOString(),
  }));
}

import type { Jezik } from "./content/types";

type Unos = Record<Jezik, string>;
const R = {
  // Pogl. 4.3.1 — primarna navigacija, doslovno prema tablici
  nav_dozivi:   { hr: "Doživi",          en: "Things to do",   de: "Erleben" },
  nav_dogadanja:{ hr: "Događanja",       en: "Events",         de: "Veranstaltungen" },
  nav_stay:     { hr: "Prenoći i jedi",  en: "Stay & Eat",     de: "Übernachten & Essen" },
  nav_planiraj: { hr: "Planiraj",        en: "Plan your trip", de: "Reise planen" },
  nav_otkrij:   { hr: "Otkrij Brod",     en: "About Brod",     de: "Brod entdecken" },

  brand:        { hr: "Brod na Savi",    en: "Brod na Savi",   de: "Brod na Savi" },
  brand_sub:    { hr: "Turistička zajednica", en: "Tourist Board", de: "Tourismusverband" },
  skip:         { hr: "Preskoči na sadržaj", en: "Skip to content", de: "Zum Inhalt springen" },
  glavna_nav:   { hr: "Glavna navigacija", en: "Main navigation", de: "Hauptnavigation" },

  novosti:      { hr: "Novosti i priopćenja", en: "News and announcements", de: "Nachrichten und Mitteilungen" },
  pitaj:        { hr: "Pitaj Brod",      en: "Ask Brod",       de: "Brod fragen" },
  kontakt:      { hr: "Kontakt",         en: "Contact",        de: "Kontakt" },
  pretraga:     { hr: "Pretraga",        en: "Search",         de: "Suche" },
  itinereri:    { hr: "Itinereri",       en: "Itineraries",    de: "Reiserouten" },
  smjestaj:     { hr: "Smještaj",        en: "Accommodation",  de: "Unterkunft" },
  gdje_jesti:   { hr: "Gdje jesti",      en: "Where to eat",   de: "Wo essen" },
  ocjena:       { hr: "Ocjena",          en: "Rating",         de: "Bewertung" },
  ocjena_izvor: { hr: "ocjena s Google Mapsa", en: "ratings from Google Maps", de: "Bewertungen von Google Maps" },
  pogodnosti:   { hr: "Pogodnosti",      en: "Amenities",      de: "Ausstattung" },
  kuhinja:      { hr: "Kuhinja",         en: "Cuisine",        de: "Küche" },
  rezervacija:  { hr: "Rezervacija stola", en: "Table booking", de: "Tischreservierung" },
  posalji_upit: { hr: "Pošalji upit",    en: "Send an enquiry", de: "Anfrage senden" },
  nema_rezultata:{ hr: "Nema rezultata", en: "No results",     de: "Keine Ergebnisse" },
  trazi:        { hr: "Pretražite događanja, smještaj, atrakcije…", en: "Search events, stays, attractions…", de: "Veranstaltungen, Unterkünfte, Sehenswürdigkeiten suchen…" },
  pocetna:      { hr: "Početna",         en: "Home",           de: "Startseite" },

  hitno:        { hr: "Hitna obavijest", en: "Urgent notice",  de: "Dringender Hinweis" },
  azurirano:    { hr: "Ažurirano",       en: "Updated",        de: "Aktualisiert" },
  detalji:      { hr: "Detalji",         en: "Details",        de: "Details" },
  procitaj:     { hr: "Pročitaj",        en: "Read",           de: "Lesen" },

  besplatno:    { hr: "Besplatno",       en: "Free",           de: "Kostenlos" },
  cijena:       { hr: "Cijena",          en: "Price",          de: "Preis" },
  radno_vrijeme:{ hr: "Radno vrijeme",   en: "Opening hours",  de: "Öffnungszeiten" },
  trajanje:     { hr: "Trajanje posjeta",en: "Visit length",   de: "Besuchsdauer" },
  adresa:       { hr: "Adresa",          en: "Address",        de: "Adresse" },
  pristupacnost:{ hr: "Pristupačnost",   en: "Accessibility",  de: "Barrierefreiheit" },

  // Pogl. 7.4: prijevod koji ne postoji nosi vidljivu oznaku, nikad prazno polje
  neprevedeno:  { hr: "Nije prevedeno",  en: "Not translated", de: "Nicht übersetzt" },
  // Pogl. 6.4: vidljiva oznaka ažurnosti
  provjereno:   { hr: "Podaci provjereni", en: "Data verified", de: "Daten geprüft" },
  demo_cijena:  { hr: "cijena nije potvrđena na izvoru", en: "price not confirmed at source", de: "Preis nicht an der Quelle bestätigt" },

  proslo:       { hr: "Prošlo",          en: "Past",           de: "Vergangen" },
  u_tijeku:     { hr: "U tijeku",        en: "On now",         de: "Läuft" },
  nadolazi:     { hr: "Nadolazi",        en: "Upcoming",       de: "Bevorstehend" },
} as const satisfies Record<string, Unos>;

export type Kljuc = keyof typeof R;
export const t = (k: Kljuc, j: Jezik) => R[k][j];

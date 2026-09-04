import type { Jezik } from "./content/types";

type Unos = Record<Jezik, string>;
const R = {
  // Pogl. 4.3.1 — primarna navigacija, doslovno prema tablici
  nav_dozivi:   { hr: "Doživi",          en: "Things to do",   de: "Erleben" },
  nav_dogadanja:{ hr: "Događanja",       en: "Events",         de: "Veranstaltungen" },
  nav_stay:     { hr: "Prenoći i objeduj", en: "Stay & Eat",   de: "Übernachten & Essen" },
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
  gdje_jesti:   { hr: "Gdje objedovati", en: "Where to eat",   de: "Wo essen" },
  ocjena:       { hr: "Ocjena",          en: "Rating",         de: "Bewertung" },
  ocjena_izvor: { hr: "ocjena s Google Mapsa", en: "ratings from Google Maps", de: "Bewertungen von Google Maps" },
  pogodnosti:   { hr: "Pogodnosti",      en: "Amenities",      de: "Ausstattung" },
  kuhinja:      { hr: "Kuhinja",         en: "Cuisine",        de: "Küche" },
  rezervacija:  { hr: "Rezervacija stola", en: "Table booking", de: "Tischreservierung" },
  posalji_upit: { hr: "Pošalji upit",    en: "Send an enquiry", de: "Anfrage senden" },
  nema_rezultata:{ hr: "Nema rezultata", en: "No results",     de: "Keine Ergebnisse" },
  trazi:        { hr: "Pretražite događanja, smještaj, atrakcije…", en: "Search events, stays, attractions…", de: "Veranstaltungen, Unterkünfte, Sehenswürdigkeiten suchen…" },

  filtri:       { hr: "Filtri",           en: "Filters",        de: "Filter" },
  primijeni:    { hr: "Primijeni",        en: "Apply",          de: "Anwenden" },
  ocisti_sve:   { hr: "Očisti sve",       en: "Clear all",      de: "Alle löschen" },
  ukloni:       { hr: "ukloni",           en: "remove",         de: "entfernen" },
  rezultata:    { hr: "rezultata",        en: "results",        de: "Ergebnisse" },
  nema_za_filtre:{ hr: "Nema rezultata za odabrane filtre.", en: "No results for the selected filters.", de: "Keine Ergebnisse für die gewählten Filter." },
  ukloni_filtar:{ hr: "Ukloni filtar",    en: "Remove filter",  de: "Filter entfernen" },

  f_tip:        { hr: "Tip",              en: "Type",           de: "Art" },
  f_kada:       { hr: "Kada",             en: "When",           de: "Wann" },
  f_cijena:     { hr: "Cijena",           en: "Price",          de: "Preis" },
  f_publika:    { hr: "Publika",          en: "Audience",       de: "Publikum" },
  f_vrsta:      { hr: "Vrsta",            en: "Kind",           de: "Art" },
  f_pogodnosti: { hr: "Pogodnosti",       en: "Amenities",      de: "Ausstattung" },
  f_kuhinja:    { hr: "Kuhinja",          en: "Cuisine",        de: "Küche" },
  f_dijeta:     { hr: "Prehrana",         en: "Dietary",        de: "Ernährung" },

  kada_nadolazi:{ hr: "Nadolazeća",       en: "Upcoming",       de: "Bevorstehend" },
  kada_tijek:   { hr: "U tijeku",         en: "On now",         de: "Läuft" },
  kada_proslo:  { hr: "Prošla",           en: "Past",           de: "Vergangen" },
  cijena_free:  { hr: "Besplatno",        en: "Free",           de: "Kostenlos" },
  cijena_do10:  { hr: "do 10 €",          en: "up to €10",      de: "bis 10 €" },
  cijena_10_25: { hr: "10–25 €",          en: "€10–25",         de: "10–25 €" },
  cijena_25p:   { hr: "25 € i više",      en: "€25 and up",     de: "ab 25 €" },

  inf_automatski: {
    hr: "Ovo je automatski asistent. Odgovara iz sadržaja ovog sjedišta i može pogriješiti.",
    en: "This is an automated assistant. It answers from this site's content and can be wrong.",
    de: "Dies ist ein automatischer Assistent. Er antwortet aus den Inhalten dieser Seite und kann irren." },
  inf_privola: {
    hr: "Vaše pitanje šalje se pružatelju jezičnog modela radi sastavljanja odgovora. Ne unosite osobne podatke. Zapisi se anonimiziraju.",
    en: "Your question is sent to a language-model provider to compose an answer. Please do not enter personal data. Logs are anonymised.",
    de: "Ihre Frage wird zur Antworterstellung an einen Sprachmodellanbieter gesendet. Bitte geben Sie keine personenbezogenen Daten ein. Protokolle werden anonymisiert." },
  inf_prihvacam: { hr: "Razumijem, pokreni razgovor", en: "I understand, start the chat", de: "Verstanden, Chat starten" },
  inf_primjeri:  { hr: "Možete pitati, primjerice:", en: "You could ask, for example:", de: "Sie könnten zum Beispiel fragen:" },
  inf_placeholder:{ hr: "Postavite pitanje…",      en: "Ask a question…",   de: "Stellen Sie eine Frage…" },
  inf_posalji:   { hr: "Pošalji",          en: "Send",           de: "Senden" },
  inf_ceka:      { hr: "Informator razmišlja…", en: "The assistant is thinking…", de: "Der Assistent überlegt…" },
  inf_centar:    { hr: "Centar za posjetitelje", en: "Visitor centre", de: "Besucherzentrum" },
  inf_predaja: {
    hr: "Čini se da vam ne mogu pomoći. Pošaljite pitanje Centru za posjetitelje — odgovaramo u jednom radnom danu.",
    en: "It seems I cannot help. Send your question to the visitor centre — we reply within one working day.",
    de: "Ich kann offenbar nicht helfen. Senden Sie Ihre Frage an das Besucherzentrum — Antwort innerhalb eines Werktags." },
  inf_previse:   { hr: "Previše pitanja u kratkom roku. Pričekajte minutu.", en: "Too many questions too quickly. Please wait a minute.", de: "Zu viele Fragen in kurzer Zeit. Bitte warten Sie eine Minute." },
  inf_nepostavljen: {
    hr: "Informator još nije postavljen na ovom poslužitelju. Centar za posjetitelje: +385 35 447 721.",
    en: "The assistant is not configured on this server yet. Visitor centre: +385 35 447 721.",
    de: "Der Assistent ist auf diesem Server noch nicht eingerichtet. Besucherzentrum: +385 35 447 721." },
  inf_greska:    { hr: "Došlo je do greške. Pokušajte ponovno.", en: "Something went wrong. Please try again.", de: "Etwas ist schiefgelaufen. Bitte erneut versuchen." },
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

  nacrt:        { hr: "Nacrt.",           en: "Draft.",         de: "Entwurf." },
  nacrt_opis: {
    hr: "Ovaj tekst nije prošao pravnu provjeru i nije obvezujuć. Mjesta koja TZ mora dopuniti označena su podebljano.",
    en: "This text has not passed legal review and is not binding. Places the tourist board must complete are marked in bold.",
    de: "Dieser Text wurde nicht rechtlich geprüft und ist nicht verbindlich. Vom Tourismusverband zu ergänzende Stellen sind fett markiert." },
  f_privatnost:   { hr: "Politika privatnosti",     en: "Privacy policy",         de: "Datenschutz" },
  f_pristupacnost:{ hr: "Izjava o pristupačnosti",  en: "Accessibility statement", de: "Barrierefreiheit" },
  f_kolacici:     { hr: "Kolačići",                 en: "Cookies",                de: "Cookies" },
  f_uvjeti:       { hr: "Uvjeti korištenja",        en: "Terms of use",           de: "Nutzungsbedingungen" },
} as const satisfies Record<string, Unos>;

export type Kljuc = keyof typeof R;
export const t = (k: Kljuc, j: Jezik) => R[k][j];

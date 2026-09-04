/**
 * Model sadržaja prema Poglavlju 5.1 Strategije.
 *
 * Notacija iz dokumenta: * = obavezno, L = lokalizirano, ↔ = relacija.
 * Ovdje se lokalizirana polja nose tipom `Lokalizirano<T>`, a relacije su
 * id-evi drugog entiteta — isto kako bi ih vratio headless CMS.
 */

export const JEZICI = ["hr", "en", "de"] as const;
export type Jezik = (typeof JEZICI)[number];
export const ZADANI_JEZIK: Jezik = "hr";

/**
 * Lokalizirano polje. HR je obavezan; EN i DE mogu nedostajati.
 * Pogl. 7.4: prazan prijevod nikad se ne prikazuje kao prazno polje nego
 * pada na HR uz vidljivu oznaku — zato je fallback dio tipa, ne slučajnost.
 */
export type Lokalizirano<T = string> = { hr: T } & Partial<Record<Jezik, T>>;

export type Status = "nacrt" | "u-pregledu" | "objavljeno" | "arhivirano";

export type Geo = { lat: number; lng: number };

export type Kontakt = {
  tel?: string;
  email?: string;
  web?: string;
};

/** Pogl. 5.1 E2: multi-enum + napomena. */
export type Pristupacnost = {
  oznake: Array<"kolica" | "taktilno" | "indukcijska-petlja" | "wc">;
  napomena?: Lokalizirano;
};

export type Cijene = {
  besplatno: boolean;
  odrasli?: number;
  djeca?: number;
  obitelj?: number;
  skupine?: number;
  /** Podatak nije potvrđen na izvoru — prikazuje se s oznakom. */
  demo?: boolean;
};

/** Zajednička jezgra svih objavljivih entiteta. */
export type Entitet = {
  id: string;
  slug: Lokalizirano;
  naziv: Lokalizirano;
  uvodniOpis: Lokalizirano;
  opis?: Lokalizirano;
  status: Status;
  /**
   * Pogl. 5.1, E14 — i izričita napomena uz E3:
   * "ovo polje ne postoji ni u jednom standardnom CMS predlošku, ali je za malu
   * TZ NAJVAŽNIJE POLJE U CIJELOM MODELU". Sprječava najgori scenarij — gosta
   * pred zatvorenim vratima — i nosi javnu oznaku ažurnosti (E-E-A-T, Pogl. 6.6).
   * Zato je obavezno, ne neobavezno.
   */
  zadnjaProvjera: string;
};

export type KategorijaAtrakcije =
  | "kultura" | "priroda" | "povijest" | "zabava" | "rekreacija" | "vjerski-objekt";

export type Atrakcija = Entitet & {
  vrsta: "atrakcija";
  kategorija: KategorijaAtrakcije;
  adresa: string;
  geo: Geo;
  radnoVrijeme?: Lokalizirano;
  cijene: Cijene;
  trajanjePosjeta: { min: number; max: number };
  pristupacnost: Pristupacnost;
  prikladnoZaDjecu: boolean;
  kontakt?: Kontakt;
  teme: string[];
};

export type TipDogadaja =
  | "koncert" | "izlozba" | "sport" | "gastro" | "obiteljsko"
  | "sajam" | "tradicija" | "kazaliste" | "konferencija";

export type Dogadaj = Entitet & {
  vrsta: "dogadaj";
  /** ISO 8601, Europe/Zagreb. */
  pocetak: string;
  kraj: string;
  cjelodnevni: boolean;
  serija?: string;
  lokacija: { naziv: string; adresa?: string; geo?: Geo };
  tip: TipDogadaja;
  cijena: { besplatno: boolean; od?: number; do?: number; napomena?: Lokalizirano };
  publika: Array<"obitelji" | "djeca" | "parovi" | "skupine">;
};

export type TipObjave = "obavijest" | "priopcenje" | "natjecaj" | "projekt";

export type Novost = Entitet & {
  vrsta: "novost";
  tip: TipObjave;
  datum: string;
  /** Traka hitnih obavijesti (W11). */
  hitno?: boolean;
  /**
   * Pogl. 10.3, anotacija uz W11: traka mora imati rok trajanja,
   * "inače ostaje mjesecima i gubi značenje". Zato nije neobavezno
   * kad je `hitno` postavljeno — provjerava ga `validirajSadrzaj()`.
   */
  objaviDo?: string;
};

export type Itinerer = Entitet & {
  vrsta: "itinerer";
  trajanjeMin: number;
  km: number;
  nacin: "pjesice" | "bicikl" | "auto";
  publika: Array<"obitelji" | "djeca" | "parovi" | "skupine">;
  postaje: Array<{ vrijeme: string; ref: string; minuta: number; kind: "see" | "eat" | "move" }>;
};

export type BiloKojiEntitet = Atrakcija | Dogadaj | Novost | Itinerer | Smjestaj | Ugostitelj;

/** Pogl. 5.1 E5. */
export type VrstaSmjestaja =
  | "hotel" | "hostel" | "apartman" | "kuca-za-odmor" | "soba" | "kamp" | "seosko-domacinstvo";

export type Pogodnost =
  | "parking" | "wifi" | "dorucak" | "klima" | "bazen" | "kucni-ljubimci"
  | "bike-friendly" | "ev-punjac" | "pristupacno" | "kuhinja" | "praonica";

export type Ocjena = { prosjek: number; broj: number; izvor: "google" | "booking" | "vlastita" };

export type Smjestaj = Entitet & {
  vrsta: "smjestaj";
  tip: VrstaSmjestaja;
  kategorija?: 1 | 2 | 3 | 4 | 5;
  adresa: string;
  geo: Geo;
  pogodnosti: Pogodnost[];
  pristupacnost: Pristupacnost;
  kontakt: Kontakt;
  /** Pogl. 8: upit / vanjski / integrirani. MVP je "upit" (Varijanta A). */
  bookingMod: "upit" | "vanjski" | "integrirani";
  bookingUrl?: string;
  ocjena?: Ocjena;
  clanTZ?: boolean;
};

export type Kuhinja =
  | "slavonska" | "internacionalna" | "talijanska" | "azijska" | "rostilj" | "riblja" | "fusion";

export type Dijeta = "vegetarijansko" | "vegansko" | "bez-glutena" | "halal";

export type Ugostitelj = Entitet & {
  vrsta: "ugostitelj";
  tip: "restoran" | "pizzeria" | "bistro" | "kavana" | "vinarija";
  adresa: string;
  geo: Geo;
  kuhinja: Kuhinja[];
  /** €, €€, €€€ */
  cjenovniRang: 1 | 2 | 3;
  radnoVrijeme: Lokalizirano;
  dijetetskeOpcije: Dijeta[];
  kontakt: Kontakt;
  rezervacijaStola?: { moguca: boolean; tel?: string; url?: string };
  ocjena?: Ocjena;
  preporuka?: Lokalizirano;
};

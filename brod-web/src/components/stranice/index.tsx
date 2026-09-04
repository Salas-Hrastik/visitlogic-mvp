import Link from "next/link";
import type { Atrakcija, Dogadaj, Jezik, Novost, Smjestaj, Ugostitelj } from "@/lib/content/types";
import { putanja, slugZa, tekst } from "@/lib/i18n";
import { t } from "@/lib/rjecnik";
import { statusDogadaja } from "@/lib/content/source";
import s from "./stranice.module.css";

/** Pogl. 7.4: neprevedeno polje pada na HR i nosi vidljivu oznaku. */
export function Polje({ p, jezik }: { p: { v: string; prevedeno: boolean }; jezik: Jezik }) {
  return (
    <>
      {p.v}
      {!p.prevedeno && <span className={s.neprevedeno}> {t("neprevedeno", jezik)}</span>}
    </>
  );
}

/**
 * Bogati tekst koji je pao na HR. Pogl. 7.4 traži vidljivu oznaku i ovdje,
 * ne samo na kratkim poljima — inače čitatelj ne zna da gleda drugi jezik.
 */
export function Blok({ p, jezik }: { p: { v: string; prevedeno: boolean }; jezik: Jezik }) {
  return (
    <div className={s.blok}>
      {!p.prevedeno && (
        <p className={s.neprevedenoBlok} lang="hr">
          {t("neprevedeno", jezik)}
        </p>
      )}
      <div lang={p.prevedeno ? undefined : "hr"} dangerouslySetInnerHTML={{ __html: p.v }} />
    </div>
  );
}

export function Mrvice({ jezik, staza }: { jezik: Jezik; staza: Array<[string, string | null]> }) {
  return (
    <nav aria-label="Breadcrumb" className={s.mrvice}>
      <ol>
        <li><Link href={putanja({ vrsta: "naslovnica" }, jezik)}>{t("pocetna", jezik)}</Link></li>
        {staza.map(([oznaka, href]) => (
          <li key={oznaka}>{href ? <Link href={href}>{oznaka}</Link> : <span aria-current="page">{oznaka}</span>}</li>
        ))}
      </ol>
    </nav>
  );
}

/** Pogl. 6.4: vidljiva oznaka ažurnosti na stranicama s praktičnim podacima. */
export function Azurnost({ datum, jezik }: { datum?: string; jezik: Jezik }) {
  if (!datum) return null;
  return <p className={s.azurnost}>{t("provjereno", jezik)}: <time dateTime={datum}>{datum}</time></p>;
}

export function KarticaAtrakcije({ a, jezik }: { a: Atrakcija; jezik: Jezik }) {
  const naziv = tekst(a.naziv, jezik);
  const uvod = tekst(a.uvodniOpis, jezik);
  return (
    <article className={s.kartica}>
      <h3>
        <Link href={putanja({ vrsta: "atrakcija", slug: slugZa(a, jezik) }, jezik)}>
          <Polje p={naziv} jezik={jezik} />
        </Link>
      </h3>
      <p className={s.uvod}><Polje p={uvod} jezik={jezik} /></p>
      <p className={s.meta}>
        <span>{a.trajanjePosjeta.min}–{a.trajanjePosjeta.max} min</span>
        <span>{a.cijene.besplatno ? t("besplatno", jezik) : `${a.cijene.odrasli} €`}</span>
      </p>
    </article>
  );
}

export function KarticaDogadaja({ d, jezik }: { d: Dogadaj; jezik: Jezik }) {
  const naziv = tekst(d.naziv, jezik);
  const uvod = tekst(d.uvodniOpis, jezik);
  const st = statusDogadaja(d);
  const [god, mj] = d.pocetak.split("-");
  return (
    <article className={`${s.kartica} ${s[`st_${st}`]}`}>
      <p className={s.oznaka}>{t(st === "proslo" ? "proslo" : st === "u-tijeku" ? "u_tijeku" : "nadolazi", jezik)}</p>
      <h3>
        <Link href={putanja({ vrsta: "dogadaj", godina: god, mjesec: mj, slug: slugZa(d, jezik) }, jezik)}>
          <Polje p={naziv} jezik={jezik} />
        </Link>
      </h3>
      <p className={s.meta}>
        <time dateTime={d.pocetak}>{d.pocetak}</time>
        {d.kraj !== d.pocetak && <> – <time dateTime={d.kraj}>{d.kraj}</time></>}
        <span>{d.lokacija.naziv}</span>
        <span>{d.cijena.besplatno ? t("besplatno", jezik) : `${d.cijena.od} €`}</span>
      </p>
      <p className={s.uvod}><Polje p={uvod} jezik={jezik} /></p>
    </article>
  );
}

export function KarticaNovosti({ n, jezik }: { n: Novost; jezik: Jezik }) {
  const naziv = tekst(n.naziv, jezik);
  const uvod = tekst(n.uvodniOpis, jezik);
  return (
    <article className={`${s.kartica} ${s[`tip_${n.tip}`]}`}>
      <p className={s.oznaka}><time dateTime={n.datum}>{n.datum}</time> · {n.tip}</p>
      <h3>
        <Link href={putanja({ vrsta: "novost", slug: slugZa(n, jezik) }, jezik)}>
          <Polje p={naziv} jezik={jezik} />
        </Link>
      </h3>
      <p className={s.uvod}><Polje p={uvod} jezik={jezik} /></p>
    </article>
  );
}

export function KarticaSmjestaja({ x, jezik }: { x: Smjestaj; jezik: Jezik }) {
  const naziv = tekst(x.naziv, jezik);
  return (
    <article className={s.kartica}>
      <p className={s.oznaka}>{x.tip}{x.kategorija ? ` · ${"★".repeat(x.kategorija)}` : ""}</p>
      <h3>
        <Link href={putanja({ vrsta: "smjestaj", slug: slugZa(x, jezik) }, jezik)}>
          <Polje p={naziv} jezik={jezik} />
        </Link>
      </h3>
      <p className={s.uvod}><Polje p={tekst(x.uvodniOpis, jezik)} jezik={jezik} /></p>
      <p className={s.meta}>
        {x.ocjena && <span>★ {x.ocjena.prosjek} ({x.ocjena.broj})</span>}
        <span>{x.pogodnosti.slice(0, 3).join(" · ")}</span>
      </p>
    </article>
  );
}

export function KarticaUgostitelja({ x, jezik }: { x: Ugostitelj; jezik: Jezik }) {
  const naziv = tekst(x.naziv, jezik);
  return (
    <article className={s.kartica}>
      <p className={s.oznaka}>{x.tip} · {"€".repeat(x.cjenovniRang)}</p>
      <h3>
        <Link href={putanja({ vrsta: "ugostitelj", slug: slugZa(x, jezik) }, jezik)}>
          <Polje p={naziv} jezik={jezik} />
        </Link>
      </h3>
      <p className={s.uvod}><Polje p={tekst(x.uvodniOpis, jezik)} jezik={jezik} /></p>
      <p className={s.meta}>
        {x.ocjena && <span>★ {x.ocjena.prosjek} ({x.ocjena.broj})</span>}
        <span>{x.kuhinja.join(" · ")}</span>
      </p>
    </article>
  );
}

export function UPripremi({ naslov, jezik }: { naslov: string; jezik: Jezik }) {
  return (
    <div className="wrap">
      <Mrvice jezik={jezik} staza={[[naslov, null]]} />
      <h1>{naslov}</h1>
      <p className={s.uvod} style={{ marginTop: "var(--s4)", maxWidth: "60ch" }}>
        Ova stranica postoji u sitemapu (Pogl. 4.2), ali još nije izrađena.
        Ovaj je frontend prvi sloj — sadržajni model, rutiranje i tri jezika —
        a ekrani se dodaju redom kojim ih Strategija prioritizira.
      </p>
    </div>
  );
}

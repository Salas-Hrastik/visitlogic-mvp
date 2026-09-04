import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JEZICI, ZADANI_JEZIK, type Jezik } from "@/lib/content/types";
import { putanja, razrijesi, slugZa, tekst, type Ruta } from "@/lib/i18n";
import { t } from "@/lib/rjecnik";
import {
  atrakcijaPoSlugu, dogadajPoSlugu, novostPoSlugu,
  sveAtrakcije, svaDogadanja, sveNovosti, statusDogadaja,
} from "@/lib/content/source";
import { Zaglavlje } from "@/components/Zaglavlje";
import { Podnozje } from "@/components/Podnozje";
import { TrakaObavijesti } from "@/components/TrakaObavijesti";
import {
  Azurnost, Blok, KarticaAtrakcije, KarticaDogadaja, KarticaNovosti, Mrvice, Polje, UPripremi,
} from "@/components/stranice";

type Params = { jezik: string; put?: string[] };

/** Sve stranice u sva tri jezika grade se unaprijed (Pogl. 13.2: SSG). */
export async function generateStaticParams(): Promise<Params[]> {
  const [atr, dog, nov] = await Promise.all([sveAtrakcije(), svaDogadanja(), sveNovosti()]);
  const out: Params[] = [];
  for (const jezik of JEZICI) {
    const seg = (r: Ruta) => {
      const p = putanja(r, jezik);
      const dijelovi = p.split("/").filter(Boolean);
      return jezik === ZADANI_JEZIK ? dijelovi : dijelovi.slice(1);
    };
    const rute: Ruta[] = [
      { vrsta: "naslovnica" }, { vrsta: "atrakcije" }, { vrsta: "dogadanja" },
      { vrsta: "novosti" }, { vrsta: "itinereri" }, { vrsta: "pitaj" },
      { vrsta: "kontakt" }, { vrsta: "pretraga" },
      ...atr.map((a): Ruta => ({ vrsta: "atrakcija", slug: slugZa(a, jezik) })),
      ...dog.map((d): Ruta => {
        const [g, m] = d.pocetak.split("-");
        return { vrsta: "dogadaj", godina: g, mjesec: m, slug: slugZa(d, jezik) };
      }),
      ...nov.map((n): Ruta => ({ vrsta: "novost", slug: slugZa(n, jezik) })),
    ];
    for (const r of rute) out.push({ jezik, put: seg(r) });
  }
  return out;
}

async function razrijesiTrazeno(p: Params) {
  const jezik = ((JEZICI as readonly string[]).includes(p.jezik) ? p.jezik : ZADANI_JEZIK) as Jezik;
  const ruta = razrijesi(p.put ?? [], jezik);
  return { jezik, ruta };
}

/**
 * Pogl. 7.3: hreflang recipročno i potpuno, ali SAMO za jezike u kojima
 * prijevod stvarno postoji. Upućivanje na neprevedenu stranicu je, kaže
 * dokument, "česta i štetna greška".
 */
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { jezik, ruta } = await razrijesiTrazeno(await params);
  if (!ruta) return {};

  let naslov: string = t("brand", jezik);
  let prevedenNa: Jezik[] = [...JEZICI];

  if (ruta.vrsta === "atrakcija") {
    const a = await atrakcijaPoSlugu(ruta.slug);
    if (a) { naslov = tekst(a.naziv, jezik).v; prevedenNa = JEZICI.filter((j) => !!a.naziv[j]); }
  } else if (ruta.vrsta === "dogadaj") {
    const d = await dogadajPoSlugu(ruta.slug);
    if (d) { naslov = tekst(d.naziv, jezik).v; prevedenNa = JEZICI.filter((j) => !!d.naziv[j]); }
  } else if (ruta.vrsta === "novost") {
    const n = await novostPoSlugu(ruta.slug);
    if (n) { naslov = tekst(n.naziv, jezik).v; prevedenNa = JEZICI.filter((j) => !!n.naziv[j]); }
  }

  const languages: Record<string, string> = {};
  for (const j of prevedenNa) languages[j] = putanja(ruta, j);
  if (prevedenNa.includes(ZADANI_JEZIK)) languages["x-default"] = putanja(ruta, ZADANI_JEZIK);

  return { title: naslov, alternates: { canonical: putanja(ruta, jezik), languages } };
}

export default async function Stranica({ params }: { params: Promise<Params> }) {
  const p = await params;
  const { jezik, ruta } = await razrijesiTrazeno(p);
  if (!ruta) notFound();

  return (
    <>
      <a className="skip" href="#glavni">{t("skip", jezik)}</a>
      <TrakaObavijesti jezik={jezik} />
      <Zaglavlje jezik={jezik} putanjaSad={putanja(ruta, jezik)} />
      <main id="glavni">{await Sadrzaj({ ruta, jezik })}</main>
      <Podnozje jezik={jezik} />
    </>
  );
}

async function Sadrzaj({ ruta, jezik }: { ruta: Ruta; jezik: Jezik }) {
  switch (ruta.vrsta) {
    case "naslovnica": {
      const [atr, dog, nov] = await Promise.all([sveAtrakcije(), svaDogadanja(), sveNovosti()]);
      const nadolazeca = dog.filter((d) => statusDogadaja(d) !== "proslo").slice(0, 3);
      return (
        <div className="wrap">
          <h1 style={{ marginBlock: "var(--s12) var(--s4)" }}>{t("brand", jezik)}</h1>
          <p style={{ maxWidth: "60ch", color: "var(--ink-2)", fontSize: "1.125rem" }}>
            {jezik === "hr" ? "Što raditi, kada doći, gdje spavati i kako planirati boravak."
              : jezik === "en" ? "What to do, when to come, where to sleep and how to plan your stay."
              : "Was tun, wann kommen, wo schlafen und wie den Aufenthalt planen."}
          </p>

          <h2 style={{ marginTop: "var(--s12)" }}>{t("nav_dogadanja", jezik)}</h2>
          <div className="mreza">{nadolazeca.map((d) => <KarticaDogadaja key={d.id} d={d} jezik={jezik} />)}</div>

          <h2 style={{ marginTop: "var(--s12)" }}>{t("nav_dozivi", jezik)}</h2>
          <div className="mreza">{atr.slice(0, 3).map((a) => <KarticaAtrakcije key={a.id} a={a} jezik={jezik} />)}</div>

          <h2 style={{ marginTop: "var(--s12)" }}>{t("novosti", jezik)}</h2>
          <div className="mreza">{nov.slice(0, 3).map((n) => <KarticaNovosti key={n.id} n={n} jezik={jezik} />)}</div>
        </div>
      );
    }

    case "atrakcije": {
      const atr = await sveAtrakcije();
      return (
        <div className="wrap">
          <Mrvice jezik={jezik} staza={[[t("nav_dozivi", jezik), null]]} />
          <h1>{t("nav_dozivi", jezik)}</h1>
          <div className="mreza" style={{ marginTop: "var(--s8)" }}>
            {atr.map((a) => <KarticaAtrakcije key={a.id} a={a} jezik={jezik} />)}
          </div>
        </div>
      );
    }

    case "atrakcija": {
      const a = await atrakcijaPoSlugu(ruta.slug);
      if (!a) notFound();
      const naziv = tekst(a.naziv, jezik);
      const opis = a.opis ? tekst(a.opis, jezik) : null;
      return (
        <div className="wrap">
          <Mrvice jezik={jezik} staza={[
            [t("nav_dozivi", jezik), putanja({ vrsta: "atrakcije" }, jezik)],
            [naziv.v, null],
          ]} />
          <h1><Polje p={naziv} jezik={jezik} /></h1>
          <p style={{ marginTop: "var(--s4)", fontSize: "1.125rem", color: "var(--ink-2)", maxWidth: "62ch" }}>
            <Polje p={tekst(a.uvodniOpis, jezik)} jezik={jezik} />
          </p>
          {opis && <Blok p={opis} jezik={jezik} />}
          <dl className="cinjenice">
            <dt>{t("adresa", jezik)}</dt><dd>{a.adresa}</dd>
            {a.radnoVrijeme && <><dt>{t("radno_vrijeme", jezik)}</dt><dd>{tekst(a.radnoVrijeme, jezik).v}</dd></>}
            <dt>{t("cijena", jezik)}</dt>
            <dd>
              {a.cijene.besplatno ? t("besplatno", jezik) : `${a.cijene.odrasli} €`}
              {a.cijene.demo && <em> ({t("demo_cijena", jezik)})</em>}
            </dd>
            <dt>{t("trajanje", jezik)}</dt><dd>{a.trajanjePosjeta.min}–{a.trajanjePosjeta.max} min</dd>
          </dl>
          <Azurnost datum={a.provjereno} jezik={jezik} />
        </div>
      );
    }

    case "dogadanja": {
      const dog = await svaDogadanja();
      return (
        <div className="wrap">
          <Mrvice jezik={jezik} staza={[[t("nav_dogadanja", jezik), null]]} />
          <h1>{t("nav_dogadanja", jezik)}</h1>
          <div className="mreza" style={{ marginTop: "var(--s8)" }}>
            {dog.map((d) => <KarticaDogadaja key={d.id} d={d} jezik={jezik} />)}
          </div>
        </div>
      );
    }

    case "dogadaj": {
      const d = await dogadajPoSlugu(ruta.slug);
      if (!d) notFound();
      const naziv = tekst(d.naziv, jezik);
      return (
        <div className="wrap">
          <Mrvice jezik={jezik} staza={[
            [t("nav_dogadanja", jezik), putanja({ vrsta: "dogadanja" }, jezik)],
            [naziv.v, null],
          ]} />
          <h1><Polje p={naziv} jezik={jezik} /></h1>
          <p style={{ marginTop: "var(--s4)", fontSize: "1.125rem", color: "var(--ink-2)", maxWidth: "62ch" }}>
            <Polje p={tekst(d.uvodniOpis, jezik)} jezik={jezik} />
          </p>
          <dl className="cinjenice">
            <dt>{t("nadolazi", jezik)}</dt>
            <dd><time dateTime={d.pocetak}>{d.pocetak}</time> – <time dateTime={d.kraj}>{d.kraj}</time></dd>
            <dt>{t("adresa", jezik)}</dt><dd>{d.lokacija.naziv}</dd>
            <dt>{t("cijena", jezik)}</dt>
            <dd>{d.cijena.besplatno ? t("besplatno", jezik) : `${d.cijena.od} €`}</dd>
          </dl>
          {/* Pogl. 6.2: svaki događaj nosi Event schemu. */}
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org", "@type": "Event",
            name: naziv.v, startDate: d.pocetak, endDate: d.kraj,
            eventStatus: "https://schema.org/EventScheduled",
            location: { "@type": "Place", name: d.lokacija.naziv },
            offers: d.cijena.besplatno ? { "@type": "Offer", price: 0, priceCurrency: "EUR" } : undefined,
          }) }} />
        </div>
      );
    }

    case "novosti": {
      const nov = await sveNovosti();
      return (
        <div className="wrap">
          <Mrvice jezik={jezik} staza={[[t("novosti", jezik), null]]} />
          <h1>{t("novosti", jezik)}</h1>
          <div className="mreza" style={{ marginTop: "var(--s8)" }}>
            {nov.map((n) => <KarticaNovosti key={n.id} n={n} jezik={jezik} />)}
          </div>
        </div>
      );
    }

    case "novost": {
      const n = await novostPoSlugu(ruta.slug);
      if (!n) notFound();
      const naziv = tekst(n.naziv, jezik);
      const opis = n.opis ? tekst(n.opis, jezik) : null;
      return (
        <div className="wrap">
          <Mrvice jezik={jezik} staza={[
            [t("novosti", jezik), putanja({ vrsta: "novosti" }, jezik)],
            [naziv.v, null],
          ]} />
          <p style={{ color: "var(--ink-3)", fontWeight: 600 }}>
            <time dateTime={n.datum}>{n.datum}</time> · {n.tip}
          </p>
          <h1><Polje p={naziv} jezik={jezik} /></h1>
          <p style={{ marginTop: "var(--s4)", fontSize: "1.125rem", color: "var(--ink-2)", maxWidth: "62ch" }}>
            <Polje p={tekst(n.uvodniOpis, jezik)} jezik={jezik} />
          </p>
          {opis && <Blok p={opis} jezik={jezik} />}
        </div>
      );
    }

    case "kontakt":
      return (
        <div className="wrap">
          <Mrvice jezik={jezik} staza={[[t("kontakt", jezik), null]]} />
          <h1>{t("kontakt", jezik)}</h1>
          <dl className="cinjenice">
            <dt>{t("adresa", jezik)}</dt><dd>Trg pobjede 28, 35000 Slavonski Brod</dd>
            <dt>Telefon</dt><dd><a href="tel:+38535447721">+385 35 447 721</a></dd>
            <dt>E-pošta</dt><dd><a href="mailto:info@tzgsb.hr">info@tzgsb.hr</a></dd>
            <dt>{t("radno_vrijeme", jezik)}</dt><dd>Pon–pet 8–16 · sub 8–12 · nedjeljom zatvoreno</dd>
          </dl>
          <p style={{ marginTop: "var(--s8)" }}>
            <Link href={putanja({ vrsta: "pitaj" }, jezik)}>{t("pitaj", jezik)} →</Link>
          </p>
        </div>
      );

    case "itinereri": return <UPripremi naslov={t("itinereri", jezik)} jezik={jezik} />;
    case "pitaj":     return <UPripremi naslov={t("pitaj", jezik)} jezik={jezik} />;
    case "pretraga":  return <UPripremi naslov={t("pretraga", jezik)} jezik={jezik} />;
  }
}

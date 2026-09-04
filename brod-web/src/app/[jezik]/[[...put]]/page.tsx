import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JEZICI, ZADANI_JEZIK, type Jezik } from "@/lib/content/types";
import { putanja, razrijesi, slugZa, tekst, type Ruta } from "@/lib/i18n";
import { t } from "@/lib/rjecnik";
import {
  atrakcijaPoSlugu, dogadajPoSlugu, novostPoSlugu,
  smjestajPoSlugu, ugostiteljPoSlugu, pravniDokumentPoSlugu, sviPravniDokumenti,
  sveAtrakcije, svaDogadanja, sveNovosti, savSmjestaj, sviUgostitelji, statusDogadaja,
} from "@/lib/content/source";
import { Pretraga, type Zapis } from "@/components/Pretraga";
import { Filtri, type Faceta, type Stavka } from "@/components/Filtri";
import { Informator } from "@/components/Informator";
import { Galerija } from "@/components/Galerija";
import { Zaglavlje } from "@/components/Zaglavlje";
import { Podnozje } from "@/components/Podnozje";
import { TrakaObavijesti } from "@/components/TrakaObavijesti";
import {
  Azurnost, Blok, KarticaAtrakcije, KarticaDogadaja, KarticaNovosti,
  KarticaSmjestaja, KarticaUgostitelja, Mrvice, Polje, UPripremi,
} from "@/components/stranice";

type Params = { jezik: string; put?: string[] };

/** Sve stranice u sva tri jezika grade se unaprijed (Pogl. 13.2: SSG). */
export async function generateStaticParams(): Promise<Params[]> {
  const [atr, dog, nov, smj, ugo, prav] = await Promise.all([
    sveAtrakcije(), svaDogadanja(), sveNovosti(), savSmjestaj(), sviUgostitelji(), sviPravniDokumenti(),
  ]);
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
      { vrsta: "kontakt" }, { vrsta: "pretraga" }, { vrsta: "otkrij" },
      { vrsta: "smjestajPopis" }, { vrsta: "gdjeJesti" },
      ...smj.map((x): Ruta => ({ vrsta: "smjestaj", slug: slugZa(x, jezik) })),
      ...ugo.map((x): Ruta => ({ vrsta: "ugostitelj", slug: slugZa(x, jezik) })),
      ...prav.map((x): Ruta => ({ vrsta: "pravno", slug: slugZa(x, jezik) })),
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
  } else if (ruta.vrsta === "smjestaj") {
    const x = await smjestajPoSlugu(ruta.slug);
    if (x) { naslov = tekst(x.naziv, jezik).v; prevedenNa = JEZICI.filter((j) => !!x.naziv[j]); }
  } else if (ruta.vrsta === "ugostitelj") {
    const x = await ugostiteljPoSlugu(ruta.slug);
    if (x) { naslov = tekst(x.naziv, jezik).v; prevedenNa = JEZICI.filter((j) => !!x.naziv[j]); }
  } else if (ruta.vrsta === "pravno") {
    const x = await pravniDokumentPoSlugu(ruta.slug);
    if (x) { naslov = tekst(x.naziv, jezik).v; prevedenNa = JEZICI.filter((j) => !!x.naziv[j]); }
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
          {a.medij && <Galerija medij={a.medij} jezik={jezik} />}
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
          <Azurnost datum={a.zadnjaProvjera} jezik={jezik} />
        </div>
      );
    }

    case "dogadanja": {
      const dog = await svaDogadanja();
      const cjenovni = (d: (typeof dog)[number]) =>
        d.cijena.besplatno ? "free" : (d.cijena.od ?? 0) <= 10 ? "do10" : (d.cijena.od ?? 0) <= 25 ? "d10_25" : "od25";
      const facete: Faceta[] = [
        { kljuc: "kada", naziv: t("f_kada", jezik), opcije: [
          { v: "nadolazi", oznaka: t("kada_nadolazi", jezik) },
          { v: "u-tijeku", oznaka: t("kada_tijek", jezik) },
          { v: "proslo", oznaka: t("kada_proslo", jezik) },
        ] },
        { kljuc: "tip", naziv: t("f_tip", jezik), opcije:
          [...new Set(dog.map((d) => d.tip))].map((v) => ({ v, oznaka: v })) },
        { kljuc: "cijena", naziv: t("f_cijena", jezik), opcije: [
          { v: "free", oznaka: t("cijena_free", jezik) },
          { v: "do10", oznaka: t("cijena_do10", jezik) },
          { v: "d10_25", oznaka: t("cijena_10_25", jezik) },
          { v: "od25", oznaka: t("cijena_25p", jezik) },
        ] },
        { kljuc: "publika", naziv: t("f_publika", jezik), opcije:
          [...new Set(dog.flatMap((d) => d.publika))].map((v) => ({ v, oznaka: v })) },
      ];
      const stavke: Stavka[] = dog.map((d) => ({
        id: d.id,
        facete: { kada: [statusDogadaja(d)], tip: [d.tip], cijena: [cjenovni(d)], publika: d.publika },
        prikaz: <KarticaDogadaja d={d} jezik={jezik} />,
      }));
      return (
        <div className="wrap">
          <Mrvice jezik={jezik} staza={[[t("nav_dogadanja", jezik), null]]} />
          <h1>{t("nav_dogadanja", jezik)}</h1>
          <Filtri facete={facete} stavke={stavke} jezik={jezik} />
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

    case "smjestajPopis": {
      const smj = await savSmjestaj();
      return (
        <div className="wrap">
          <Mrvice jezik={jezik} staza={[[t("nav_stay", jezik), null], [t("smjestaj", jezik), null]]} />
          <h1>{t("smjestaj", jezik)}</h1>
          <p style={{ marginTop: "var(--s3)" }}>
            <Link href={putanja({ vrsta: "gdjeJesti" }, jezik)}>{t("gdje_jesti", jezik)} →</Link>
          </p>
          <Filtri
            jezik={jezik}
            facete={[
              { kljuc: "vrsta", naziv: t("f_vrsta", jezik), opcije:
                [...new Set(smj.map((x) => x.tip))].map((v) => ({ v, oznaka: v })) },
              { kljuc: "pogodnost", naziv: t("f_pogodnosti", jezik), opcije:
                [...new Set(smj.flatMap((x) => x.pogodnosti))].map((v) => ({ v, oznaka: v })) },
            ]}
            stavke={smj.map((x): Stavka => ({
              id: x.id,
              facete: { vrsta: [x.tip], pogodnost: x.pogodnosti },
              prikaz: <KarticaSmjestaja x={x} jezik={jezik} />,
            }))}
          />
        </div>
      );
    }

    case "gdjeJesti": {
      const ugo = await sviUgostitelji();
      return (
        <div className="wrap">
          <Mrvice jezik={jezik} staza={[[t("nav_stay", jezik), null], [t("gdje_jesti", jezik), null]]} />
          <h1>{t("gdje_jesti", jezik)}</h1>
          <p style={{ marginTop: "var(--s3)" }}>
            <Link href={putanja({ vrsta: "smjestajPopis" }, jezik)}>{t("smjestaj", jezik)} →</Link>
          </p>
          <Filtri
            jezik={jezik}
            facete={[
              { kljuc: "vrsta", naziv: t("f_vrsta", jezik), opcije:
                [...new Set(ugo.map((x) => x.tip))].map((v) => ({ v, oznaka: v })) },
              { kljuc: "kuhinja", naziv: t("f_kuhinja", jezik), opcije:
                [...new Set(ugo.flatMap((x) => x.kuhinja))].map((v) => ({ v, oznaka: v })) },
              { kljuc: "prehrana", naziv: t("f_dijeta", jezik), opcije:
                [...new Set(ugo.flatMap((x) => x.dijetetskeOpcije))].map((v) => ({ v, oznaka: v })) },
            ]}
            stavke={ugo.map((x): Stavka => ({
              id: x.id,
              facete: { vrsta: [x.tip], kuhinja: x.kuhinja, prehrana: x.dijetetskeOpcije },
              prikaz: <KarticaUgostitelja x={x} jezik={jezik} />,
            }))}
          />
        </div>
      );
    }

    case "smjestaj": {
      const x = await smjestajPoSlugu(ruta.slug);
      if (!x) notFound();
      const naziv = tekst(x.naziv, jezik);
      return (
        <div className="wrap">
          <Mrvice jezik={jezik} staza={[
            [t("smjestaj", jezik), putanja({ vrsta: "smjestajPopis" }, jezik)], [naziv.v, null],
          ]} />
          <h1><Polje p={naziv} jezik={jezik} /></h1>
          <p style={{ marginTop: "var(--s4)", fontSize: "1.125rem", color: "var(--ink-2)", maxWidth: "62ch" }}>
            <Polje p={tekst(x.uvodniOpis, jezik)} jezik={jezik} />
          </p>
          <dl className="cinjenice">
            <dt>{t("adresa", jezik)}</dt><dd>{x.adresa}</dd>
            <dt>{t("pogodnosti", jezik)}</dt><dd>{x.pogodnosti.join(" · ")}</dd>
            {x.ocjena && <><dt>{t("ocjena", jezik)}</dt>
              <dd>{x.ocjena.prosjek} / 5 — {x.ocjena.broj} {t("ocjena_izvor", jezik)}</dd></>}
            {x.kontakt.tel && <><dt>Telefon</dt><dd><a href={`tel:${x.kontakt.tel.replace(/\s/g, "")}`}>{x.kontakt.tel}</a></dd></>}
            {x.kontakt.web && <><dt>Web</dt><dd><a href={x.kontakt.web} rel="noopener noreferrer">{x.kontakt.web}</a></dd></>}
          </dl>
          {/* Pogl. 8: MVP je Varijanta A — upit, ne rezervacija. */}
          <p style={{ marginTop: "var(--s6)" }}>
            <Link href={putanja({ vrsta: "kontakt" }, jezik)}>{t("posalji_upit", jezik)} →</Link>
          </p>
          <Azurnost datum={x.zadnjaProvjera} jezik={jezik} />
        </div>
      );
    }

    case "ugostitelj": {
      const x = await ugostiteljPoSlugu(ruta.slug);
      if (!x) notFound();
      const naziv = tekst(x.naziv, jezik);
      return (
        <div className="wrap">
          <Mrvice jezik={jezik} staza={[
            [t("gdje_jesti", jezik), putanja({ vrsta: "gdjeJesti" }, jezik)], [naziv.v, null],
          ]} />
          <h1><Polje p={naziv} jezik={jezik} /></h1>
          <p style={{ marginTop: "var(--s4)", fontSize: "1.125rem", color: "var(--ink-2)", maxWidth: "62ch" }}>
            <Polje p={tekst(x.uvodniOpis, jezik)} jezik={jezik} />
          </p>
          <dl className="cinjenice">
            <dt>{t("adresa", jezik)}</dt><dd>{x.adresa}</dd>
            <dt>{t("kuhinja", jezik)}</dt><dd>{x.kuhinja.join(" · ")}</dd>
            <dt>{t("radno_vrijeme", jezik)}</dt><dd>{tekst(x.radnoVrijeme, jezik).v}</dd>
            <dt>{t("cijena", jezik)}</dt><dd>{"€".repeat(x.cjenovniRang)}</dd>
            {x.ocjena && <><dt>{t("ocjena", jezik)}</dt>
              <dd>{x.ocjena.prosjek} / 5 — {x.ocjena.broj} {t("ocjena_izvor", jezik)}</dd></>}
            {x.rezervacijaStola?.moguca && x.rezervacijaStola.tel && (
              <><dt>{t("rezervacija", jezik)}</dt>
                <dd><a href={`tel:${x.rezervacijaStola.tel.replace(/\s/g, "")}`}>{x.rezervacijaStola.tel}</a></dd></>
            )}
          </dl>
          <Azurnost datum={x.zadnjaProvjera} jezik={jezik} />
        </div>
      );
    }

    case "pretraga": {
      const [atr, dog, nov, smj, ugo] = await Promise.all([
        sveAtrakcije(), svaDogadanja(), sveNovosti(), savSmjestaj(), sviUgostitelji(),
      ]);
      const zapisi: Zapis[] = [
        ...atr.map((x): Zapis => ({ naslov: tekst(x.naziv, jezik).v, uvod: tekst(x.uvodniOpis, jezik).v,
          url: putanja({ vrsta: "atrakcija", slug: slugZa(x, jezik) }, jezik), skupina: t("nav_dozivi", jezik) })),
        ...dog.map((x): Zapis => {
          const [g, m] = x.pocetak.split("-");
          return { naslov: tekst(x.naziv, jezik).v, uvod: tekst(x.uvodniOpis, jezik).v,
            url: putanja({ vrsta: "dogadaj", godina: g, mjesec: m, slug: slugZa(x, jezik) }, jezik),
            skupina: t("nav_dogadanja", jezik) };
        }),
        ...smj.map((x): Zapis => ({ naslov: tekst(x.naziv, jezik).v, uvod: tekst(x.uvodniOpis, jezik).v,
          url: putanja({ vrsta: "smjestaj", slug: slugZa(x, jezik) }, jezik), skupina: t("smjestaj", jezik) })),
        ...ugo.map((x): Zapis => ({ naslov: tekst(x.naziv, jezik).v, uvod: tekst(x.uvodniOpis, jezik).v,
          url: putanja({ vrsta: "ugostitelj", slug: slugZa(x, jezik) }, jezik), skupina: t("gdje_jesti", jezik) })),
        ...nov.map((x): Zapis => ({ naslov: tekst(x.naziv, jezik).v, uvod: tekst(x.uvodniOpis, jezik).v,
          url: putanja({ vrsta: "novost", slug: slugZa(x, jezik) }, jezik), skupina: t("novosti", jezik) })),
      ];
      return (
        <div className="wrap">
          <Mrvice jezik={jezik} staza={[[t("pretraga", jezik), null]]} />
          <h1>{t("pretraga", jezik)}</h1>
          <Pretraga zapisi={zapisi} jezik={jezik} />
        </div>
      );
    }

    case "pravno": {
      const x = await pravniDokumentPoSlugu(ruta.slug);
      if (!x) notFound();
      const naziv = tekst(x.naziv, jezik);
      const opis = x.opis ? tekst(x.opis, jezik) : null;
      return (
        <div className="wrap" style={{ maxWidth: "52rem" }}>
          <Mrvice jezik={jezik} staza={[[naziv.v, null]]} />
          <h1><Polje p={naziv} jezik={jezik} /></h1>
          {/*
            Nacrt se najavljuje prije teksta, ne u podnožju. Stranica koja
            izgleda kao objavljena politika privatnosti čita se kao obveza,
            pa mora sama reći da to još nije.
          */}
          {x.nacrt && (
            <p className="nacrt" role="note">
              <strong>{t("nacrt", jezik)}</strong> {t("nacrt_opis", jezik)}
            </p>
          )}
          <p style={{ marginTop: "var(--s4)", fontSize: "1.125rem", color: "var(--ink-2)" }}>
            <Polje p={tekst(x.uvodniOpis, jezik)} jezik={jezik} />
          </p>
          {opis && <Blok p={opis} jezik={jezik} />}
          <Azurnost datum={x.zadnjaProvjera} jezik={jezik} />
        </div>
      );
    }

    case "otkrij":    return <UPripremi naslov={t("nav_otkrij", jezik)} jezik={jezik} />;
    case "itinereri": return <UPripremi naslov={t("itinereri", jezik)} jezik={jezik} />;
    case "pitaj":
      return (
        <div className="wrap">
          <Mrvice jezik={jezik} staza={[[t("pitaj", jezik), null]]} />
          <h1>{t("pitaj", jezik)}</h1>
          <p style={{ marginTop: "var(--s4)", fontSize: "1.125rem", color: "var(--ink-2)", maxWidth: "60ch" }}>
            {jezik === "hr" ? "Pitajte o događanjima, atrakcijama, smještaju i praktičnim informacijama. Informator odgovara iz sadržaja ovog sjedišta."
              : jezik === "en" ? "Ask about events, attractions, places to stay and practical information. The assistant answers from this site's content."
              : "Fragen Sie zu Veranstaltungen, Sehenswürdigkeiten, Unterkünften und praktischen Informationen. Der Assistent antwortet aus den Inhalten dieser Seite."}
          </p>
          <Informator jezik={jezik} />
        </div>
      );
  }
}

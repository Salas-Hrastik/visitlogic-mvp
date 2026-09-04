import Image from "next/image";
import type { Jezik, Slika } from "@/lib/content/types";
import { slikaObjavljiva } from "@/lib/content/types";
import { tekst } from "@/lib/i18n";
import s from "./Galerija.module.css";

const ZADRZANO: Record<Jezik, (n: number) => string> = {
  hr: (n) => `${n} fotografija čeka potvrdu prava korištenja i zato nije objavljena.`,
  en: (n) => `${n} photographs are awaiting confirmation of usage rights and are not published.`,
  de: (n) => `${n} Fotos warten auf die Bestätigung der Nutzungsrechte und sind nicht veröffentlicht.`,
};

/**
 * Pogl. 5.3.2, točka 2 je jednoznačna: fotografija bez utvrđene licencije
 * NE SMIJE biti objavljena. Filtriranje je zato prvo što komponenta radi —
 * ne oslanja se na to da će urednik pripaziti.
 *
 * Zadržane fotografije se ne prešućuju: prikazuje se koliko ih čeka, da se
 * vidi da posao postoji i da nije zaboravljen.
 */
export function Galerija({ medij, jezik }: { medij: Slika[]; jezik: Jezik }) {
  const objavljive = medij.filter(slikaObjavljiva);
  const zadrzano = medij.length - objavljive.length;

  if (objavljive.length === 0) {
    return zadrzano > 0 ? <p className={s.zadrzano}>{ZADRZANO[jezik](zadrzano)}</p> : null;
  }

  const [prva, ...ostale] = objavljive;
  return (
    <figure className={s.galerija}>
      <Image
        src={prva.datoteka}
        alt={tekst(prva.alt, jezik).v}
        width={prva.sirina}
        height={prva.visina}
        priority
        sizes="(min-width: 60rem) 44rem, 100vw"
        className={s.glavna}
      />
      {ostale.length > 0 && (
        <div className={s.ostale}>
          {ostale.map((m) => (
            <Image key={m.datoteka} src={m.datoteka} alt={tekst(m.alt, jezik).v}
                   width={m.sirina} height={m.visina}
                   sizes="(min-width: 60rem) 14rem, 45vw" loading="lazy" />
          ))}
        </div>
      )}
      {/* Pogl. 5.3.2, točka 3: kredit autora vidljiv u galeriji, ne samo u metapodacima. */}
      <figcaption className={s.kredit}>
        {[...new Set(objavljive.map((m) => m.atribucija ?? m.autor))].join(" · ")}
        {zadrzano > 0 && <span className={s.zadrzanoUz}> {ZADRZANO[jezik](zadrzano)}</span>}
      </figcaption>
    </figure>
  );
}

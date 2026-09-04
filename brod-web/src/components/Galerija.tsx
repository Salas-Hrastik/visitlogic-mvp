import Image from "next/image";
import type { Jezik, Slika } from "@/lib/content/types";
import { tekst } from "@/lib/i18n";
import s from "./Galerija.module.css";

/**
 * Pogl. 5.1, E13: prva slika je ujedno OG slika. Alt dolazi iz podatka i
 * obavezan je — komponenta ga ne izmišlja i ne ostavlja prazan.
 *
 * Slika s licencom "nepotvrdeno" nosi vidljivu napomenu. Fotografija bez
 * utvrđenih prava ne smije tiho proći u produkciju samo zato što izgleda dobro.
 */
export function Galerija({ medij, jezik }: { medij: Slika[]; jezik: Jezik }) {
  if (medij.length === 0) return null;
  const [prva, ...ostale] = medij;
  const nepotvrdenih = medij.filter((m) => m.licenca === "nepotvrdeno").length;

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
            <Image
              key={m.datoteka}
              src={m.datoteka}
              alt={tekst(m.alt, jezik).v}
              width={m.sirina}
              height={m.visina}
              sizes="(min-width: 60rem) 14rem, 45vw"
              loading="lazy"
            />
          ))}
        </div>
      )}
      {nepotvrdenih > 0 && (
        <figcaption className={s.prava}>
          {jezik === "hr"
            ? `Prava korištenja nisu potvrđena za ${nepotvrdenih} od ${medij.length} fotografija. Preuzeto s tzgsb.hr.`
            : jezik === "en"
            ? `Usage rights are unconfirmed for ${nepotvrdenih} of ${medij.length} photographs. Taken from tzgsb.hr.`
            : `Nutzungsrechte für ${nepotvrdenih} von ${medij.length} Fotos sind nicht bestätigt. Übernommen von tzgsb.hr.`}
        </figcaption>
      )}
    </figure>
  );
}

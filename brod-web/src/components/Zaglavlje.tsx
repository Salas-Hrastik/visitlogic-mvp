import Link from "next/link";
import type { Jezik } from "@/lib/content/types";
import { JEZICI, putanja, segment } from "@/lib/i18n";
import { t } from "@/lib/rjecnik";
import s from "./Zaglavlje.module.css";

/** Pogl. 4.3.1: pet stavki, ne sedam. Nazivi doslovno iz tablice. */
const NAV = [
  { k: "dozivi", oznaka: "nav_dozivi" },
  { k: "dogadanja", oznaka: "nav_dogadanja" },
  { k: "planiraj", oznaka: "nav_planiraj" },
] as const;

export function Zaglavlje({ jezik, putanjaSad }: { jezik: Jezik; putanjaSad: string }) {
  return (
    <header className={s.head}>
      <div className={`wrap ${s.in}`}>
        <Link href={putanja({ vrsta: "naslovnica" }, jezik)} className={s.brand}>
          <span className={s.mark} aria-hidden="true" />
          <span className={s.brandTxt}>
            {t("brand", jezik)}
            <small>{t("brand_sub", jezik)}</small>
          </span>
        </Link>

        <nav className={s.nav} aria-label={t("glavna_nav", jezik)}>
          <Link href={putanja({ vrsta: "atrakcije" }, jezik)}>{t("nav_dozivi", jezik)}</Link>
          <Link href={putanja({ vrsta: "dogadanja" }, jezik)}>{t("nav_dogadanja", jezik)}</Link>
          <Link href={putanja({ vrsta: "itinereri" }, jezik)}>{t("nav_planiraj", jezik)}</Link>
          <Link href={putanja({ vrsta: "novosti" }, jezik)}>{t("novosti", jezik)}</Link>
          <Link href={putanja({ vrsta: "kontakt" }, jezik)}>{t("kontakt", jezik)}</Link>
        </nav>

        {/*
          Pogl. 7.4: promjena jezika vodi na EKVIVALENTNU stranicu, ne na
          naslovnicu. Zato se prenosi trenutna ruta, a ne fiksni link.
        */}
        <div className={s.jezici}>
          <span className="sr" id="izbor-jezika">Jezik / Language</span>
          <ul aria-labelledby="izbor-jezika">
            {JEZICI.map((j) => (
              <li key={j}>
                <Link
                  href={putanjaSad}
                  hrefLang={j}
                  aria-current={j === jezik ? "true" : undefined}
                  className={j === jezik ? s.aktivan : undefined}
                  data-jezik={j}
                >
                  {j.toUpperCase()}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}

export { segment };

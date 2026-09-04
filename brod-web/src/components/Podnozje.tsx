import Link from "next/link";
import type { Jezik } from "@/lib/content/types";
import { putanja } from "@/lib/i18n";
import { t } from "@/lib/rjecnik";
import s from "./Podnozje.module.css";

export function Podnozje({ jezik }: { jezik: Jezik }) {
  return (
    <footer className={s.foot}>
      <div className="wrap">
        <div className={s.grid}>
          <div>
            <h3>{t("brand_sub", jezik)}</h3>
            <address>
              Turistička zajednica područja<br />
              „Slavonski Brod–Posavina”<br />
              Trg pobjede 28, 35000 Slavonski Brod<br />
              <a href="tel:+38535447721">+385 35 447 721</a><br />
              <a href="mailto:info@tzgsb.hr">info@tzgsb.hr</a>
            </address>
          </div>
          <div>
            <h3>{t("nav_dozivi", jezik)}</h3>
            <ul>
              <li><Link href={putanja({ vrsta: "atrakcije" }, jezik)}>{t("nav_dozivi", jezik)}</Link></li>
              <li><Link href={putanja({ vrsta: "dogadanja" }, jezik)}>{t("nav_dogadanja", jezik)}</Link></li>
              <li><Link href={putanja({ vrsta: "smjestajPopis" }, jezik)}>{t("smjestaj", jezik)}</Link></li>
              <li><Link href={putanja({ vrsta: "gdjeJesti" }, jezik)}>{t("gdje_jesti", jezik)}</Link></li>
              <li><Link href={putanja({ vrsta: "itinereri" }, jezik)}>{t("itinereri", jezik)}</Link></li>
              <li><Link href={putanja({ vrsta: "novosti" }, jezik)}>{t("novosti", jezik)}</Link></li>
            </ul>
          </div>
          <div>
            <h3>{t("kontakt", jezik)}</h3>
            <ul>
              <li><Link href={putanja({ vrsta: "kontakt" }, jezik)}>{t("kontakt", jezik)}</Link></li>
              <li><Link href={putanja({ vrsta: "pitaj" }, jezik)}>{t("pitaj", jezik)}</Link></li>
              <li><Link href={putanja({ vrsta: "pretraga" }, jezik)}>{t("pretraga", jezik)}</Link></li>
            </ul>
          </div>
        </div>
        <ul className={s.pravno}>
          <li><Link href={putanja({ vrsta: "pravno", slug: "politika-privatnosti" }, jezik)}>{t("f_privatnost", jezik)}</Link></li>
          <li><Link href={putanja({ vrsta: "pravno", slug: "izjava-o-pristupacnosti" }, jezik)}>{t("f_pristupacnost", jezik)}</Link></li>
          <li><Link href={putanja({ vrsta: "pravno", slug: "kolacici" }, jezik)}>{t("f_kolacici", jezik)}</Link></li>
          <li><Link href={putanja({ vrsta: "pravno", slug: "uvjeti-koristenja" }, jezik)}>{t("f_uvjeti", jezik)}</Link></li>
        </ul>
        <p className={s.bot}>
          © {new Date().getFullYear()} Turistička zajednica grada Slavonskog Broda
        </p>
      </div>
    </footer>
  );
}

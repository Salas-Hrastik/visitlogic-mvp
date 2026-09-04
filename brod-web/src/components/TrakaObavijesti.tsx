import Link from "next/link";
import type { Jezik } from "@/lib/content/types";
import { hitnaObavijest } from "@/lib/content/source";
import { putanja, slugZa, tekst } from "@/lib/i18n";
import { t } from "@/lib/rjecnik";
import s from "./TrakaObavijesti.module.css";

/**
 * W11 — traka hitnih obavijesti, na vrhu svake stranice.
 *
 * Rok trajanja provodi `hitnaObavijest()`: objava bez `objaviDo` nikad ne
 * dolazi dovde. Anotacija uz W11: "inače ostaje mjesecima i gubi značenje."
 */
export async function TrakaObavijesti({ jezik }: { jezik: Jezik }) {
  const n = await hitnaObavijest();
  if (!n) return null;

  const naziv = tekst(n.naziv, jezik);
  const uvod = tekst(n.uvodniOpis, jezik);

  return (
    <div className={s.alert} role="alert">
      <div className={`wrap ${s.in}`}>
        <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor"
             strokeWidth="2" aria-hidden="true" className={s.ico}>
          <path d="M10 2.5 18.5 17.5H1.5Z" /><path d="M10 8v4" /><path d="M10 15h.01" />
        </svg>
        <div className={s.body}>
          <strong>{t("hitno", jezik)} · {naziv.v}</strong>
          <p>{uvod.v}</p>
          <p className={s.meta}>
            <span>{t("azurirano", jezik)}: {n.datum}</span>{" "}
            <Link href={putanja({ vrsta: "novost", slug: slugZa(n, jezik) }, jezik)}>
              {t("detalji", jezik)} →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

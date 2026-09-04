import Anthropic from "@anthropic-ai/sdk";
import { NextResponse, type NextRequest } from "next/server";
import { JEZICI, ZADANI_JEZIK, type Jezik } from "@/lib/content/types";
import { bazaZnanja, sustavskaUputa } from "@/lib/informator/znanje";
import { hitanSlucaj, ocistiUlaz, zabiljeziBezOdgovora } from "@/lib/informator/zastita";

export const runtime = "nodejs";

const MODEL = "claude-opus-5";
const NAJVISE_ZNAKOVA = 500;

/** Pogl. 9.7: ograničenje po IP-u, zaštita od zloupotrebe i troška tokena. */
const POSJETE = new Map<string, number[]>();
const PROZOR_MS = 60_000;
const NAJVISE_U_PROZORU = 8;

function prekoracen(ip: string): boolean {
  const sad = Date.now();
  const prije = (POSJETE.get(ip) ?? []).filter((t) => sad - t < PROZOR_MS);
  prije.push(sad);
  POSJETE.set(ip, prije);
  return prije.length > NAJVISE_U_PROZORU;
}

const NE_ZNAM: Record<Jezik, string> = {
  hr: "Na to nemam pouzdan odgovor. Centar za posjetitelje: +385 35 447 721, info@tzgsb.hr — rado će vam pomoći.",
  en: "I do not have a reliable answer to that. The visitor centre: +385 35 447 721, info@tzgsb.hr — they will be glad to help.",
  de: "Darauf habe ich keine verlässliche Antwort. Besucherzentrum: +385 35 447 721, info@tzgsb.hr — man hilft Ihnen gern.",
};

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "nepoznato";
  if (prekoracen(ip)) {
    return NextResponse.json({ greska: "previse_upita" }, { status: 429 });
  }

  let tijelo: { pitanje?: unknown; jezik?: unknown };
  try {
    tijelo = await req.json();
  } catch {
    return NextResponse.json({ greska: "neispravan_zahtjev" }, { status: 400 });
  }

  const jezik: Jezik = (JEZICI as readonly string[]).includes(String(tijelo.jezik))
    ? (tijelo.jezik as Jezik)
    : ZADANI_JEZIK;

  const pitanje = ocistiUlaz(String(tijelo.pitanje ?? ""), NAJVISE_ZNAKOVA);
  if (!pitanje) {
    return NextResponse.json({ greska: "prazno_pitanje" }, { status: 400 });
  }

  /**
   * Pogl. 9.4, hitne situacije: prepoznaju se ključne riječi i odmah se
   * prikazuju brojevi — BEZ generiranja. Model se ovdje uopće ne poziva, jer
   * je jedini prihvatljiv odgovor onaj koji ne može biti izmišljen.
   */
  const hitno = hitanSlucaj(pitanje, jezik);
  if (hitno) {
    return NextResponse.json({ odgovor: hitno, znam: true, hitno: true });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ greska: "informator_nije_postavljen" }, { status: 503 });
  }

  try {
    const client = new Anthropic();
    const znanje = await bazaZnanja(jezik);

    const odgovor = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      // Pogl. 9.6 traži p95 ≤ 3 s. Kratak odgovor iz zadanog konteksta ne
      // treba duboko promišljanje, pa niži napor čuva i vrijeme i trošak.
      output_config: { effort: "low" },
      // Baza znanja je stabilan prefiks — keširanje je ovdje najveća ušteda.
      system: [
        { type: "text", text: sustavskaUputa(jezik, znanje), cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: pitanje }],
    });

    const tekst = odgovor.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    if (!tekst || tekst.includes("NEMAM_ODGOVOR")) {
      // Pogl. 9.6: pitanja bez odgovora su rangirana lista → uredničke zadaće.
      await zabiljeziBezOdgovora(pitanje, jezik);
      return NextResponse.json({ odgovor: NE_ZNAM[jezik], znam: false });
    }

    return NextResponse.json({ odgovor: tekst, znam: true });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ greska: "previse_upita" }, { status: 429 });
    }
    if (e instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ greska: "informator_nije_postavljen" }, { status: 503 });
    }
    console.error("[pitaj] neuspjeh:", e);
    return NextResponse.json({ greska: "greska_posluzitelja" }, { status: 500 });
  }
}

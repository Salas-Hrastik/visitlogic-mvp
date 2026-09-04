import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JEZICI, type Jezik } from "@/lib/content/types";
import "../globals.css";

/**
 * Pogl. 7.3 pokazuje hreflang s punom domenom, i to nije stilska sitnica:
 * relativan hreflang tražilice ignoriraju. metadataBase pretvara sve
 * kanonske i alternativne putanje u apsolutne URL-ove.
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://tzgsb.hr"),
  title: { default: "Brod na Savi — Turistička zajednica grada Slavonskog Broda", template: "%s · Brod na Savi" },
  description: "Što raditi, kada doći, gdje spavati i kako planirati boravak u Slavonskom Brodu.",
};

/** Sve tri jezične inačice gradе se statički. */
export function generateStaticParams() {
  return JEZICI.map((jezik) => ({ jezik }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ jezik: string }>;
}) {
  const { jezik } = await params;
  const j = (JEZICI as readonly string[]).includes(jezik) ? (jezik as Jezik) : "hr";
  // Pogl. 11.3, kriterij 1.3.1: jezik dokumenta mora odgovarati sadržaju.
  return (
    <html lang={j}>
      <body>{children}</body>
    </html>
  );
}

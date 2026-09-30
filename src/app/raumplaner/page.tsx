import type { Metadata } from "next";
import RoomPlanner from "@/components/room-planner/RoomPlannerLoader";
import { getProducts } from "@/lib/commerce/service";
import { plannerChairConfig } from "@/lib/room-planner/chairs";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Raumplaner", description: "Raumgrundriss in 2D zeichnen und Bestuhlung im 3D-Prototyp ansehen.", path: "/raumplaner" });

export default async function RaumplanerPage() {
  const products = await getProducts();
  const chairs = plannerChairConfig.map((chair) => {
    const product = chair.productHandle ? products.find((entry) => entry.handle === chair.productHandle) : null;
    return { ...chair, productName: product?.title ?? chair.fallbackName, productUrl: product ? `/produkte/artikel/${product.handle}` : null };
  });
  return <div className="page-stack"><header className="max-w-3xl py-6 sm:py-10"><p className="section-eyebrow">Raumplaner</p><h1 className="mt-4 font-display text-4xl font-medium leading-tight text-premium-ink sm:text-5xl">Ihren Raum planen.</h1><p className="section-lead mt-5">Zeichnen Sie Ihren Grundriss maßhaltig in 2D oder probieren Sie die bestehende 3D-Bestuhlung aus.</p><p className="mt-4 inline-flex rounded-full border border-premium-beige bg-premium-warm px-4 py-2 text-xs font-medium text-premium-muted">Prototyp – Bestuhlung ohne baurechtliche Prüfung</p></header><RoomPlanner chairs={chairs} /></div>;
}

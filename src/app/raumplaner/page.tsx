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
  return <div className="page-stack planner-page"><RoomPlanner chairs={chairs} /></div>;
}

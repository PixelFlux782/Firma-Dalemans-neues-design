"use client";

import ChairConfigurator from "@/components/chairs/ChairConfigurator";
import ChairGallery from "@/components/chairs/ChairGallery";
import { ChairProductProvider, useChairVariantImage } from "@/components/chairs/ChairProductConfigurator";
import ProductDetailPage, { type ProductDetailData } from "@/components/product-detail/ProductDetailPage";
import type { CommerceProduct } from "@/lib/commerce/types";
import type { ChairConfiguration } from "@/lib/commerce/stacking-chairs";

export default function ChairDetail({ product, data, configuration, quantity }: {
  product: CommerceProduct; data: ProductDetailData; configuration: ChairConfiguration; quantity: number;
}) {
  return <ChairProductProvider><ChairDetailBody product={product} data={data} configuration={configuration} quantity={quantity} /></ChairProductProvider>;
}

function ChairDetailBody({ product, data, configuration, quantity }: {
  product: CommerceProduct; data: ProductDetailData; configuration: ChairConfiguration; quantity: number;
}) {
  const image = useChairVariantImage();
  return <ProductDetailPage data={data}
    media={<ChairGallery images={product.images} modelCode={product.stackingChair?.modelCode ?? "Stuhl"} />}
    purchase={<ChairConfigurator product={product} initialConfiguration={configuration} initialQuantity={quantity} onVariantImageChange={image?.setImage} />}
  >{product.stackingChair?.editorialStatus === "reference" ? <section className="grid overflow-hidden rounded-[2rem] bg-premium-ink text-white lg:grid-cols-2" aria-label="Reihenbestuhlung und Raumnutzung">
    <div className="px-7 py-10 sm:px-10 lg:px-14 lg:py-14"><p className="section-eyebrow text-premium-sand">Reihenbestuhlung</p><h2 className="mt-4 font-display text-3xl font-medium tracking-[-0.025em] text-white sm:text-4xl">Reihenverbindung bewusst mitplanen.</h2><p className="mt-5 text-sm leading-7 text-white/70 sm:text-base">Jede Ausführung von Modell 1021 ist laut Preisliste mit und ohne Reihenverbindung geführt. Für geordnete Reihen sollten Raum, Wege und Veranstaltungsablauf gemeinsam betrachtet werden.</p></div>
    <div className="border-t border-white/15 px-7 py-10 sm:px-10 lg:border-l lg:border-t-0 lg:px-14 lg:py-14"><p className="section-eyebrow text-premium-sand">Flexible Raumnutzung</p><h2 className="mt-4 font-display text-3xl font-medium tracking-[-0.025em] text-white">Umbau, Lagerung und Transport zusammendenken.</h2><p className="mt-5 text-sm leading-7 text-white/70 sm:text-base">Dalemans plant auch Wege zwischen Nutzung, Umbau und Lagerung. Konkrete Stapelmengen oder Transportkapazitäten werden erst mit verifizierten technischen Daten benannt.</p></div>
  </section> : null}</ProductDetailPage>;
}

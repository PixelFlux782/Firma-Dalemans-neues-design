"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import ChairConfigurator from "@/components/chairs/ChairConfigurator";
import ChairGallery from "@/components/chairs/ChairGallery";
import type { CommerceImage, CommerceProduct } from "@/lib/commerce/types";
import type { ChairConfiguration } from "@/lib/commerce/stacking-chairs";

const ChairVariantImageContext = createContext<{
  image: CommerceImage | null;
  setImage: (image: CommerceImage | null) => void;
} | null>(null);

export default function ChairProductConfigurator({
  product,
  initialConfiguration,
  initialQuantity,
  children,
}: {
  product: CommerceProduct;
  initialConfiguration: ChairConfiguration;
  initialQuantity?: number;
  children?: ReactNode;
}) {
  const [image, setImage] = useState<CommerceImage | null>(null);
  return <ChairVariantImageContext.Provider value={{ image, setImage }}>
    <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1.06fr_.94fr] lg:gap-14">
      <div className="min-w-0 lg:sticky lg:top-28">
        <ChairGallery images={product.images} modelCode={product.stackingChair?.modelCode ?? "Stuhl"} />
      </div>
      <div className="min-w-0 lg:pt-3">
        {children}
        <ChairConfigurator product={product} initialConfiguration={initialConfiguration} initialQuantity={initialQuantity} onVariantImageChange={setImage} />
      </div>
    </div>
  </ChairVariantImageContext.Provider>;
}

export function useChairVariantImage() {
  return useContext(ChairVariantImageContext);
}

export function ChairProductProvider({ children }: { children: ReactNode }) {
  const [image, setImage] = useState<CommerceImage | null>(null);
  return <ChairVariantImageContext.Provider value={{ image, setImage }}>{children}</ChairVariantImageContext.Provider>;
}

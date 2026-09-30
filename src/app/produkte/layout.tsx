import type { ReactNode } from "react";
import ShopNavigation from "@/components/shop/ShopNavigation";

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return <><ShopNavigation />{children}</>;
}

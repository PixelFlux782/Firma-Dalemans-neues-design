import type { ReactNode } from "react";
import ShopNavigation from "@/components/shop/ShopNavigation";
import { getGliderNavigation } from "@/lib/commerce/glider-navigation";

// Templates refresh on navigation, unlike persistent layouts. The menu follows
// the same render/build and provider cache lifetime as the collection page.
export default async function ProductsTemplate({ children }: { children: ReactNode }) {
  const gliderLinks = await getGliderNavigation();
  return <><ShopNavigation gliderLinks={gliderLinks} />{children}</>;
}

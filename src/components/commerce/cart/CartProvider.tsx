"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import CartDrawer from "@/components/commerce/cart/CartDrawer";
import {
  createEmptyCart,
  createLocalCartProvider,
  LOCAL_CART_STORAGE_KEY,
} from "@/lib/commerce/cart/local";
import { createCommerceCartService } from "@/lib/commerce/cart/service";
import type {
  CartInputLine,
  CommerceCart,
  CommerceCartProvider as CommerceCartProviderContract,
} from "@/lib/commerce/types";

interface CartContextValue {
  cart: CommerceCart;
  hydrated: boolean;
  pending: boolean;
  drawerOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addLines: (lines: CartInputLine[]) => Promise<void>;
  updateLine: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart muss innerhalb des CartProvider verwendet werden.");
  return context;
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const providerRef = useRef<CommerceCartProviderContract | null>(null);
  const [cart, setCart] = useState<CommerceCart>(() => createEmptyCart());
  const [hydrated, setHydrated] = useState(false);
  const [pending, setPending] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const provider = createCommerceCartService(
      createLocalCartProvider({ storage: window.localStorage }),
    );
    providerRef.current = provider;
    Promise.resolve(provider.getCart()).then((nextCart) => {
      setCart(nextCart);
      setHydrated(true);
    });

    function syncTabs(event: StorageEvent) {
      if (event.key !== LOCAL_CART_STORAGE_KEY || !providerRef.current) return;
      Promise.resolve(providerRef.current.getCart()).then(setCart);
    }

    window.addEventListener("storage", syncTabs);
    return () => window.removeEventListener("storage", syncTabs);
  }, []);

  const run = useCallback(async (
    action: (provider: CommerceCartProviderContract) => Promise<CommerceCart> | CommerceCart,
  ) => {
    const provider = providerRef.current;
    if (!provider) return;
    setPending(true);
    try {
      setCart(await action(provider));
    } finally {
      setPending(false);
    }
  }, []);

  const value = useMemo<CartContextValue>(() => ({
    cart,
    hydrated,
    pending,
    drawerOpen,
    openCart: () => setDrawerOpen(true),
    closeCart: () => setDrawerOpen(false),
    addLines: async (lines) => {
      await run((provider) => provider.addLines(lines));
      setDrawerOpen(true);
    },
    updateLine: (lineId, quantity) => run((provider) => provider.updateLines([{ lineId, quantity }])),
    removeLine: (lineId) => run((provider) => provider.removeLines([lineId])),
    clearCart: () => run((provider) => provider.clearCart()),
  }), [cart, drawerOpen, hydrated, pending, run]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

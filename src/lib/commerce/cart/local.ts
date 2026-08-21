import type {
  CartInputLine,
  CartUpdateLine,
  CommerceCart,
  CommerceCartLine,
  CommerceCartProvider,
  CommerceMoney,
} from "@/lib/commerce/types";
import { multiplyCommerceMoney } from "@/lib/commerce/money";

export const LOCAL_CART_STORAGE_KEY = "dlmns-commerce-cart";
export const LOCAL_CART_VERSION = 1;
export const LOCAL_CART_MAX_QUANTITY = 100_000;

export interface CartStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface LocalCartProvider extends CommerceCartProvider {
  getCart(): CommerceCart;
  addLines(lines: CartInputLine[]): CommerceCart;
  updateLines(lines: CartUpdateLine[]): CommerceCart;
  removeLines(lineIds: string[]): CommerceCart;
  clearCart(): CommerceCart;
}

interface PersistedCartV1 {
  version: 1;
  cartId: string;
  lines: CartInputLineWithId[];
}

type CartInputLineWithId = CartInputLine & { id: string };

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

function isMoney(value: unknown): value is CommerceMoney {
  if (!value || typeof value !== "object") return false;
  const money = value as Partial<CommerceMoney>;
  return typeof money.amount === "string"
    && Number.isFinite(Number(money.amount))
    && typeof money.currencyCode === "string"
    && money.currencyCode.length === 3;
}

function isPersistedLine(value: unknown): value is CartInputLineWithId {
  if (!value || typeof value !== "object") return false;
  const line = value as Partial<CartInputLineWithId>;
  return typeof line.id === "string"
    && typeof line.productId === "string"
    && typeof line.productHandle === "string"
    && typeof line.productTitle === "string"
    && typeof line.variantId === "string"
    && typeof line.variantTitle === "string"
    && isPositiveInteger(line.quantity)
    && line.quantity <= LOCAL_CART_MAX_QUANTITY
    && line.priceStatus === "fixed"
    && isMoney(line.unitPrice)
    && isPositiveInteger(line.minimumQuantity)
    && isPositiveInteger(line.quantityStep)
    && (line.packSize === null || isPositiveInteger(line.packSize))
    && typeof line.unitLabel === "string"
    && line.availability === "in_stock"
    && (line.source === "product" || line.source === "glider_finder");
}

export function normalizeCartQuantity(
  quantity: number,
  minimumQuantity: number,
  quantityStep: number,
) {
  if (!isPositiveInteger(minimumQuantity) || !isPositiveInteger(quantityStep)) {
    throw new RangeError("Mindestmenge und Mengenschritt müssen positiv sein.");
  }
  if (!Number.isFinite(quantity)) return minimumQuantity;

  const requested = Math.max(minimumQuantity, Math.ceil(quantity));
  const steps = Math.ceil((requested - minimumQuantity) / quantityStep);
  return Math.min(
    LOCAL_CART_MAX_QUANTITY,
    minimumQuantity + Math.max(0, steps) * quantityStep,
  );
}

function lineFromInput(input: CartInputLine, id: string): CommerceCartLine {
  const quantity = normalizeCartQuantity(
    input.quantity,
    input.minimumQuantity,
    input.quantityStep,
  );
  return {
    ...input,
    id,
    quantity,
    lineTotal: multiplyCommerceMoney(input.unitPrice, quantity),
  };
}

export function createEmptyCart(id: string | null = null): CommerceCart {
  return {
    id,
    totalQuantity: 0,
    lines: [],
    totals: {
      subtotalAmount: null,
      pricedLineCount: 0,
      unpricedLineCount: 0,
    },
  };
}

export function calculateCart(lines: CommerceCartLine[], id: string | null): CommerceCart {
  const pricedLines = lines.filter((line) => line.lineTotal !== null);
  const currencyCodes = new Set(
    pricedLines.map((line) => line.lineTotal!.currencyCode),
  );
  const subtotalAmount = pricedLines.length > 0 && currencyCodes.size === 1
    ? {
        amount: pricedLines
          .reduce((sum, line) => sum + Number(line.lineTotal!.amount), 0)
          .toFixed(2),
        currencyCode: pricedLines[0].lineTotal!.currencyCode,
      }
    : null;

  return {
    id,
    lines,
    totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
    totals: {
      subtotalAmount,
      pricedLineCount: pricedLines.length,
      unpricedLineCount: lines.length - pricedLines.length,
    },
  };
}

export function parsePersistedCart(raw: string | null): CommerceCart | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<PersistedCartV1>;
    if (value.version !== LOCAL_CART_VERSION
      || typeof value.cartId !== "string"
      || !Array.isArray(value.lines)) {
      return null;
    }
    const lines = value.lines.filter(isPersistedLine).map((line) => lineFromInput(line, line.id));
    return calculateCart(lines, value.cartId);
  } catch {
    return null;
  }
}

function canAddLine(line: CartInputLine) {
  return Boolean(
    line.productId
      && line.productHandle
      && line.variantId
      && line.priceStatus === "fixed"
      && isMoney(line.unitPrice)
      && line.availability === "in_stock"
      && isPositiveInteger(line.minimumQuantity)
      && isPositiveInteger(line.quantityStep),
  );
}

function persisted(cart: CommerceCart): PersistedCartV1 {
  return {
    version: LOCAL_CART_VERSION,
    cartId: cart.id ?? "local-cart",
    lines: cart.lines.map(({ lineTotal, ...line }) => {
      void lineTotal;
      return line;
    }),
  };
}

export function createLocalCartProvider({
  storage,
  idFactory = () => globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}-${Math.random()}`,
}: {
  storage: CartStorage;
  idFactory?: () => string;
}): LocalCartProvider {
  function read() {
    const raw = storage.getItem(LOCAL_CART_STORAGE_KEY);
    const cart = parsePersistedCart(raw);
    if (cart) return cart;
    if (raw !== null) storage.removeItem(LOCAL_CART_STORAGE_KEY);
    return createEmptyCart(idFactory());
  }

  function write(cart: CommerceCart) {
    storage.setItem(LOCAL_CART_STORAGE_KEY, JSON.stringify(persisted(cart)));
    return cart;
  }

  return {
    getCart: read,

    addLines(inputs) {
      const current = read();
      const lines = [...current.lines];
      for (const input of inputs) {
        if (!canAddLine(input)) continue;
        const existingIndex = lines.findIndex((line) => line.variantId === input.variantId);
        if (existingIndex >= 0) {
          const existing = lines[existingIndex];
          lines[existingIndex] = lineFromInput(
            {
              ...existing,
              ...input,
              quantity: existing.quantity + input.quantity,
              finderContext: input.finderContext ?? existing.finderContext,
              source: input.source,
            },
            existing.id,
          );
        } else {
          lines.push(lineFromInput(input, idFactory()));
        }
      }
      return write(calculateCart(lines, current.id));
    },

    updateLines(updates: CartUpdateLine[]) {
      const current = read();
      const byId = new Map(updates.map((update) => [update.lineId, update.quantity]));
      const lines = current.lines.map((line) => {
        const quantity = byId.get(line.id);
        return quantity === undefined
          ? line
          : lineFromInput({ ...line, quantity }, line.id);
      });
      return write(calculateCart(lines, current.id));
    },

    removeLines(lineIds) {
      const current = read();
      const ids = new Set(lineIds);
      return write(calculateCart(
        current.lines.filter((line) => !ids.has(line.id)),
        current.id,
      ));
    },

    clearCart() {
      const current = read();
      return write(createEmptyCart(current.id));
    },
  };
}

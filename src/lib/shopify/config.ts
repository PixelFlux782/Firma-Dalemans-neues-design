import "server-only";

const SHOPIFY_ENV_KEYS = [
  "SHOPIFY_STORE_DOMAIN",
  "SHOPIFY_STOREFRONT_ACCESS_TOKEN",
  "SHOPIFY_STOREFRONT_API_VERSION",
] as const;

type ShopifyEnvironment = Readonly<Record<string, string | undefined>>;

export interface ShopifyConfig {
  storeDomain: string;
  storefrontAccessToken: string;
  apiVersion: string;
  endpoint: string;
}

export class ShopifyConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShopifyConfigurationError";
  }
}

function normalizeStoreDomain(value: string) {
  const withoutProtocol = value.trim().replace(/^https?:\/\//i, "");
  return withoutProtocol.replace(/\/+$/, "").toLowerCase();
}

export function getShopifyConfig(
  environment: ShopifyEnvironment = process.env,
): ShopifyConfig {
  const missing = SHOPIFY_ENV_KEYS.filter((key) => !environment[key]?.trim());

  if (missing.length > 0) {
    throw new ShopifyConfigurationError(
      `Shopify Storefront API is not configured. Missing: ${missing.join(", ")}.`,
    );
  }

  const storeDomain = normalizeStoreDomain(environment.SHOPIFY_STORE_DOMAIN!);
  const apiVersion = environment.SHOPIFY_STOREFRONT_API_VERSION!.trim();
  const storefrontAccessToken = environment.SHOPIFY_STOREFRONT_ACCESS_TOKEN!.trim();

  if (!/^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/i.test(storeDomain)) {
    throw new ShopifyConfigurationError(
      "SHOPIFY_STORE_DOMAIN must be a valid hostname without a path.",
    );
  }

  if (!/^\d{4}-(01|04|07|10)$/.test(apiVersion)) {
    throw new ShopifyConfigurationError(
      "SHOPIFY_STOREFRONT_API_VERSION must use Shopify's YYYY-MM format.",
    );
  }

  return {
    storeDomain,
    storefrontAccessToken,
    apiVersion,
    endpoint: `https://${storeDomain}/api/${apiVersion}/graphql.json`,
  };
}

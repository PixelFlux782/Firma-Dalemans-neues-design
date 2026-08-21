import "server-only";
import {
  getShopifyConfig,
  type ShopifyConfig,
} from "@/lib/shopify/config";

interface ShopifyGraphQLError {
  message: string;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
}

interface ShopifyGraphQLResponse<TData> {
  data?: TData;
  errors?: ShopifyGraphQLError[];
}

interface ShopifyFetchOptions<TVariables extends object> {
  query: string;
  variables?: TVariables;
  cache?: RequestCache;
  revalidate?: number | false;
  tags?: string[];
}

interface CreateShopifyClientOptions {
  config?: ShopifyConfig;
  fetchImplementation?: typeof fetch;
}

export class ShopifyRequestError extends Error {
  readonly status: number | null;
  readonly graphQLErrors: ReadonlyArray<ShopifyGraphQLError>;

  constructor(
    message: string,
    options: {
      status?: number | null;
      graphQLErrors?: ShopifyGraphQLError[];
      cause?: unknown;
    } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "ShopifyRequestError";
    this.status = options.status ?? null;
    this.graphQLErrors = options.graphQLErrors ?? [];
  }
}

function errorSummary(errors: ShopifyGraphQLError[]) {
  return errors.map((error) => error.message).join("; ");
}

function isGraphQLResponse<TData>(
  value: unknown,
): value is ShopifyGraphQLResponse<TData> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const errors = (value as { errors?: unknown }).errors;
  return (
    errors === undefined ||
    (Array.isArray(errors) &&
      errors.every(
        (error) =>
          typeof error === "object" &&
          error !== null &&
          typeof (error as { message?: unknown }).message === "string",
      ))
  );
}

export function createShopifyClient({
  config = getShopifyConfig(),
  fetchImplementation = fetch,
}: CreateShopifyClientOptions = {}) {
  return async function shopifyFetch<
    TData,
    TVariables extends object = Record<string, never>,
  >({
    query,
    variables,
    cache,
    revalidate = 300,
    tags = [],
  }: ShopifyFetchOptions<TVariables>): Promise<TData> {
    let response: Response;

    try {
      response = await fetchImplementation(config.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": config.storefrontAccessToken,
        },
        body: JSON.stringify({ query, variables }),
        ...(cache ? { cache } : {}),
        ...(!cache ? { next: { revalidate, tags } } : {}),
      });
    } catch (cause) {
      throw new ShopifyRequestError(
        "Shopify Storefront API could not be reached.",
        { cause },
      );
    }

    if (!response.ok) {
      throw new ShopifyRequestError(
        `Shopify Storefront API returned HTTP ${response.status}.`,
        { status: response.status },
      );
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch (cause) {
      throw new ShopifyRequestError(
        "Shopify Storefront API returned an invalid JSON response.",
        { status: response.status, cause },
      );
    }

    if (!isGraphQLResponse<TData>(payload)) {
      throw new ShopifyRequestError(
        "Shopify Storefront API returned an invalid GraphQL response.",
        { status: response.status },
      );
    }

    if (payload.errors?.length) {
      throw new ShopifyRequestError(
        `Shopify Storefront API reported an error: ${errorSummary(payload.errors)}`,
        { status: response.status, graphQLErrors: payload.errors },
      );
    }

    if (payload.data === undefined || payload.data === null) {
      throw new ShopifyRequestError(
        "Shopify Storefront API returned no data.",
        { status: response.status },
      );
    }

    return payload.data;
  };
}

export async function shopifyFetch<
  TData,
  TVariables extends object = Record<string, never>,
>(options: ShopifyFetchOptions<TVariables>) {
  return createShopifyClient()<TData, TVariables>(options);
}

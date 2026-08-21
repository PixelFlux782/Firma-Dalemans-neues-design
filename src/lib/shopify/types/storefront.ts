export interface ShopifyMoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  sku: string | null;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
  price: ShopifyMoneyV2;
  compareAtPrice: ShopifyMoneyV2 | null;
  image: ShopifyImage | null;
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  images: {
    nodes: ShopifyImage[];
  };
  variants: {
    nodes: ShopifyProductVariant[];
  };
  priceRange: {
    minVariantPrice: ShopifyMoneyV2;
    maxVariantPrice: ShopifyMoneyV2;
  };
  seo: {
    title: string | null;
    description: string | null;
  };
  updatedAt: string;
}

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
  products: {
    nodes: ShopifyProduct[];
  };
}

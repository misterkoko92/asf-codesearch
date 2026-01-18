export type ExternalProductInfo = {
  name: string | null;
  brand: string | null;
  ean: string | null;
  gtin: string | null;
  cip: string | null;
  sku: string | null;
  barcode: string | null;
  priceHt: string | number | null;
  vatRate: string | number | null;
  priceTtc: string | number | null;
  currency: string | null;
};

export type ExternalSearchResult = {
  id: string;
  source: string;
  sourceLabel: string;
  sourceRef?: string | null;
  title?: string | null;
  snippet?: string | null;
  url?: string | null;
  score?: number;
  isBest?: boolean;
  product?: ExternalProductInfo | null;
};

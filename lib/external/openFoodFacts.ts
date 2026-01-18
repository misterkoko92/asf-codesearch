import { getCountryCode } from "@/lib/external/config";

export type ExternalLookupResult = {
  source: string;
  sourceLabel: string;
  sourceRef?: string | null;
  product: {
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
};

export async function fetchOpenFoodFacts(code: string): Promise<ExternalLookupResult | null> {
  const country = getCountryCode();
  const base = country === "FR" ? "https://fr.openfoodfacts.org" : "https://world.openfoodfacts.org";
  const url = `${base}/api/v2/product/${encodeURIComponent(code)}.json`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "ASF-Codesearch/0.1"
    },
    cache: "no-store"
  });

  if (!response.ok) return null;
  const data = (await response.json()) as { status?: number; product?: Record<string, unknown> };
  if (data.status !== 1 || !data.product) return null;

  const product = data.product as Record<string, unknown>;
  const name = (product["product_name"] as string) || (product["generic_name"] as string) || null;
  const brand = (product["brands"] as string) || null;

  return {
    source: "open_food_facts",
    sourceLabel: "Open Food Facts",
    sourceRef: String(product["id"] ?? ""),
    product: {
      name: name ? name.trim() : null,
      brand: brand ? brand.trim() : null,
      ean: code,
      gtin: code,
      cip: null,
      sku: null,
      barcode: null,
      priceHt: null,
      vatRate: null,
      priceTtc: null,
      currency: null
    }
  };
}

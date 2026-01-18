import type { ExternalSearchResult } from "@/lib/external/types";
import { AsfWmsConfig, getAsfWmsConfig } from "@/lib/external/config";
import { normalizeCode } from "@/lib/normalize";

type AsfWmsSearchInput = {
  ean?: string | null;
  gtin?: string | null;
  cip?: string | null;
  q?: string | null;
};

type WmsProduct = {
  id: number | string;
  sku?: string | null;
  name?: string | null;
  brand?: string | null;
  barcode?: string | null;
  ean?: string | null;
  pu_ht?: number | string | null;
  tva?: number | string | null;
  pu_ttc?: number | string | null;
};

type WmsResponse = WmsProduct[] | { results?: WmsProduct[] };

function buildApiBase(baseUrl: string) {
  const trimmed = baseUrl.replace(/\/+$/, "");
  if (trimmed.endsWith("/api/v1")) return trimmed;
  if (trimmed.endsWith("/api")) return `${trimmed}/v1`;
  return `${trimmed}/api/v1`;
}

function extractDigits(text?: string | null) {
  if (!text) return null;
  const sequences = text.match(/\d{7,14}/g) ?? [];
  const pick = (len: number) => sequences.find((seq) => seq.length === len);
  return pick(14) ?? pick(13) ?? pick(7) ?? sequences[0] ?? null;
}

function buildSearchQuery(input: AsfWmsSearchInput) {
  const ean = normalizeCode(input.ean, { skipEmpty: true });
  const gtin = normalizeCode(input.gtin, { skipEmpty: true });
  const cip = normalizeCode(input.cip, { skipEmpty: true });
  if (ean || gtin || cip) return ean || gtin || cip;

  const raw = (input.q || "").trim();
  if (!raw) return null;

  const lower = raw.toLowerCase();
  const digits = extractDigits(raw);
  if (digits && (/^\d+$/.test(raw) || /^(ean|gtin|cip)\b/.test(lower))) {
    return digits;
  }
  return raw;
}

function toExternalResult(product: WmsProduct): ExternalSearchResult {
  const normalizedEan = normalizeCode(product.ean, { skipEmpty: true }) ?? null;
  const barcode = normalizeCode(product.barcode, { skipEmpty: true }) ?? null;
  const barcodeDigits = barcode && /^\d+$/.test(barcode) ? barcode : null;
  const ean = normalizedEan ?? (barcodeDigits && barcodeDigits.length === 13 ? barcodeDigits : null);
  const gtinCandidate = normalizedEan ?? (barcodeDigits && barcodeDigits.length === 14 ? barcodeDigits : null);
  const name = product.name?.trim() || null;
  const brand = product.brand?.trim() || null;

  return {
    id: `asf-wms-${product.id}`,
    source: "asf_wms",
    sourceLabel: "ASF WMS",
    sourceRef: String(product.id),
    title: name,
    snippet: brand,
    url: null,
    product: {
      name,
      brand,
      ean,
      gtin: gtinCandidate ?? ean,
      cip: null,
      sku: product.sku ?? null,
      barcode,
      priceHt: product.pu_ht ?? null,
      vatRate: product.tva ?? null,
      priceTtc: product.pu_ttc ?? null,
      currency: "EUR"
    }
  };
}

export async function searchAsfWms(
  input: AsfWmsSearchInput,
  config: AsfWmsConfig = getAsfWmsConfig() || {
    baseUrl: "",
    apiKey: ""
  }
): Promise<ExternalSearchResult[]> {
  if (!config.baseUrl) return [];

  const query = buildSearchQuery(input);
  if (!query) return [];

  const apiBase = buildApiBase(config.baseUrl);
  const url = new URL(`${apiBase}/products/`);
  url.searchParams.set("q", query);

  const headers: HeadersInit = {
    Accept: "application/json"
  };

  if (config.apiKey) {
    headers["X-ASF-Integration-Key"] = config.apiKey;
  }

  const response = await fetch(url.toString(), { headers, cache: "no-store" });
  if (!response.ok) {
    throw new Error(`ASF WMS request failed (${response.status})`);
  }

  const data = (await response.json()) as WmsResponse;
  const items = Array.isArray(data) ? data : data.results ?? [];

  return items.map(toExternalResult);
}

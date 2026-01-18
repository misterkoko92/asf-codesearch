import { ExternalSearchResult } from "@/lib/external/types";
import { normalizeCode } from "@/lib/normalize";

const GOOGLE_ENDPOINT = "https://www.googleapis.com/customsearch/v1";

function getGoogleConfig() {
  const enabled = process.env.EXTERNAL_GOOGLE_ENABLED === "true";
  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cseId = process.env.GOOGLE_CSE_ID;
  if (!enabled || !apiKey || !cseId) return null;
  return { apiKey, cseId };
}

function extractCodes(text: string, queryDigits?: string) {
  const safeText = text || "";
  const cipMatch = safeText.match(/CIP(?:13|7)?\s*[:#-]?\s*(\d{7,13})/i);
  const eanMatch = safeText.match(/EAN(?:13)?\s*[:#-]?\s*(\d{13})/i);
  const gtinMatch = safeText.match(/GTIN(?:14)?\s*[:#-]?\s*(\d{14})/i);

  const sequences = safeText.match(/\d{7,14}/g) ?? [];
  const pick = (len: number) => sequences.find((seq) => seq.length === len);

  const ean = normalizeCode(eanMatch?.[1] ?? (queryDigits?.length === 13 ? queryDigits : pick(13)));
  const gtin = normalizeCode(gtinMatch?.[1] ?? (queryDigits?.length === 14 ? queryDigits : pick(14)));
  const cip = normalizeCode(cipMatch?.[1] ?? (queryDigits?.length === 7 ? queryDigits : pick(7)));

  return {
    ean: ean ?? null,
    gtin: gtin ?? null,
    cip: cip ?? null
  };
}

function toResult(item: GoogleItem, queryDigits?: string): ExternalSearchResult {
  const title = item.title ?? null;
  const snippet = item.snippet ?? null;
  const url = item.link ?? null;
  const codes = extractCodes(`${title ?? ""} ${snippet ?? ""}`, queryDigits);

  return {
    id: url ?? `${title ?? ""}-${Math.random().toString(36).slice(2, 8)}`,
    source: "google_cse",
    sourceLabel: "Google CSE",
    sourceRef: url,
    title,
    snippet,
    url,
    product: {
      name: title,
      brand: null,
      ean: codes.ean,
      gtin: codes.gtin,
      cip: codes.cip,
      sku: null,
      barcode: null,
      priceHt: null,
      vatRate: null,
      priceTtc: null,
      currency: null
    }
  };
}

type GoogleItem = {
  title?: string;
  snippet?: string;
  link?: string;
};

type GoogleResponse = {
  items?: GoogleItem[];
};

export async function searchGoogleCustom(query: string, limit = 5): Promise<ExternalSearchResult[]> {
  const config = getGoogleConfig();
  if (!config) return [];

  const num = Math.max(1, Math.min(10, limit));
  const queryDigits = normalizeCode(query, { skipEmpty: true })?.replace(/\D/g, "") ?? undefined;

  const url = new URL(GOOGLE_ENDPOINT);
  url.searchParams.set("key", config.apiKey);
  url.searchParams.set("cx", config.cseId);
  url.searchParams.set("q", query);
  url.searchParams.set("num", String(num));

  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) return [];

  const data = (await response.json()) as GoogleResponse;
  const items = data.items ?? [];

  return items.map((item) => toResult(item, queryDigits));
}

import { ExternalProduct } from "@prisma/client";
import { isExternalDatasetEnabled, isOpenFoodFactsEnabled } from "@/lib/external/config";
import { lookupExternalDatasets } from "@/lib/external/datasets";
import { fetchOpenFoodFacts, ExternalLookupResult } from "@/lib/external/openFoodFacts";
import { searchGoogleCustom } from "@/lib/external/google";
import { ExternalSearchResult } from "@/lib/external/types";

export type ExternalLookupInput = {
  ean?: string | null;
  gtin?: string | null;
  cip?: string | null;
};

export type ExternalSearchInput = ExternalLookupInput & {
  q?: string | null;
};

export type ExternalSearchOptions = {
  includeGoogle?: boolean;
  includeLookups?: boolean;
};

function mapDatasetProduct(product: ExternalProduct): ExternalLookupResult {
  const sourceLabel = product.source === "bdpm" ? "BDPM" : product.source === "open_medic" ? "Open Medic" : "External";
  return {
    source: product.source,
    sourceLabel,
    sourceRef: product.sourceId,
    product: {
      name: product.name ?? null,
      brand: product.brand ?? null,
      ean: product.ean ?? null,
      gtin: product.gtin ?? null,
      cip: product.cip ?? null,
      sku: null,
      barcode: null,
      priceHt: null,
      vatRate: null,
      priceTtc: null,
      currency: null
    }
  };
}

export async function lookupExternalSources(input: ExternalLookupInput): Promise<ExternalLookupResult[]> {
  const results: ExternalLookupResult[] = [];

  if (isExternalDatasetEnabled()) {
    const datasetMatches = await lookupExternalDatasets(input);
    results.push(...datasetMatches.map(mapDatasetProduct));
  }

  if (isOpenFoodFactsEnabled()) {
    const code = input.ean || input.gtin;
    if (code) {
      const offResult = await fetchOpenFoodFacts(code);
      if (offResult) results.push(offResult);
    }
  }

  return results;
}

function mapLookupResult(result: ExternalLookupResult): ExternalSearchResult {
  const title = result.product.name ?? null;
  return {
    id: `${result.source}-${result.sourceRef ?? result.product.ean ?? result.product.cip ?? title ?? Math.random()}`,
    source: result.source,
    sourceLabel: result.sourceLabel,
    sourceRef: result.sourceRef ?? null,
    title,
    snippet: result.product.brand ?? null,
    url: null,
    product: result.product
  };
}

export async function searchExternalSources(
  input: ExternalSearchInput,
  options: ExternalSearchOptions = {}
): Promise<ExternalSearchResult[]> {
  const results: ExternalSearchResult[] = [];
  const { ean, gtin, cip, q } = input;
  const includeGoogle = options.includeGoogle ?? true;
  const includeLookups = options.includeLookups ?? true;

  if (includeLookups && (ean || gtin || cip)) {
    const lookupResults = await lookupExternalSources({ ean, gtin, cip });
    results.push(...lookupResults.map(mapLookupResult));
  }

  if (q && includeGoogle) {
    const googleResults = await searchGoogleCustom(q, 6);
    results.push(...googleResults);
  }

  return results;
}

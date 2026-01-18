import { ExternalSearchResult } from "@/lib/external/types";

const TRUSTED_DOMAINS = [
  "openfoodfacts.org",
  "openproductsfacts.org",
  "openbeautyfacts.org",
  "open-medic.org",
  "base-donnees-publique.medicaments.gouv.fr"
];

function getDomain(url?: string | null) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function scoreExternalResult(result: ExternalSearchResult, query?: string | null) {
  let score = 0;
  const queryText = query?.trim().toLowerCase();
  const queryDigits = queryText ? queryText.replace(/\D/g, "") : "";

  const title = result.title?.toLowerCase() ?? "";
  const snippet = result.snippet?.toLowerCase() ?? "";

  if (queryText && (title.includes(queryText) || snippet.includes(queryText))) {
    score += 2;
  }

  if (queryDigits) {
    if (title.includes(queryDigits) || snippet.includes(queryDigits)) {
      score += 5;
    }
    if (result.product?.ean === queryDigits || result.product?.gtin === queryDigits || result.product?.cip === queryDigits) {
      score += 6;
    }
  }

  if (result.product?.ean) score += 2;
  if (result.product?.gtin) score += 2;
  if (result.product?.cip) score += 2;

  const domain = getDomain(result.url);
  if (domain && TRUSTED_DOMAINS.includes(domain)) {
    score += 3;
  }

  return score;
}

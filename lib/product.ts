import { Product } from "@prisma/client";
import { normalizeCode } from "@/lib/normalize";

export function buildProductLookup(input: {
  sku?: string | null;
  ean?: string | null;
  gtin?: string | null;
  cip?: string | null;
}) {
  const sku = normalizeCode(input.sku, { skipEmpty: true });
  if (sku) return { sku };
  const ean = normalizeCode(input.ean, { skipEmpty: true });
  if (ean) return { ean };
  const gtin = normalizeCode(input.gtin, { skipEmpty: true });
  if (gtin) return { gtin };
  const cip = normalizeCode(input.cip, { skipEmpty: true });
  if (cip) return { cip };
  return null;
}

export function serializeProduct(product: Product) {
  return {
    ...product,
    priceHt: product.priceHt ? Number(product.priceHt) : null,
    vatRate: product.vatRate ? Number(product.vatRate) : null,
    priceTtc: product.priceTtc ? Number(product.priceTtc) : null
  };
}

import { Product } from "@prisma/client";

export type WmsProductPayload = {
  sku?: string | null;
  name: string;
  brand?: string | null;
  ean?: string | null;
  gtin?: string | null;
  cip?: string | null;
  priceHt?: number | null;
  priceTtc?: number | null;
  vatRate?: number | null;
  quantity?: number | null;
};

export function mapProductToWms(product: Product): WmsProductPayload {
  return {
    sku: product.sku,
    name: product.name,
    brand: product.brand,
    ean: product.ean,
    gtin: product.gtin,
    cip: product.cip,
    priceHt: product.priceHt ? Number(product.priceHt) : null,
    priceTtc: product.priceTtc ? Number(product.priceTtc) : null,
    vatRate: product.vatRate ? Number(product.vatRate) : null,
    quantity: product.quantity
  };
}

export async function pushProductToWms(_payload: WmsProductPayload) {
  throw new Error("ASF WMS integration is not configured yet");
}

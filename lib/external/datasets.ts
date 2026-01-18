import { ExternalProduct } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCountryCode } from "@/lib/external/config";
import { normalizeCode } from "@/lib/normalize";

export type DatasetLookupInput = {
  ean?: string | null;
  gtin?: string | null;
  cip?: string | null;
  name?: string | null;
  brand?: string | null;
};

export async function lookupExternalDatasets(input: DatasetLookupInput): Promise<ExternalProduct[]> {
  const country = getCountryCode();
  if (country !== "FR") return [];

  const ean = normalizeCode(input.ean, { skipEmpty: true });
  const gtin = normalizeCode(input.gtin, { skipEmpty: true });
  const cip = normalizeCode(input.cip, { skipEmpty: true });

  const orFilters = [] as { ean?: string; gtin?: string; cip?: string }[];
  if (ean) orFilters.push({ ean });
  if (gtin) orFilters.push({ gtin });
  if (cip) orFilters.push({ cip });

  if (!orFilters.length) return [];

  return prisma.externalProduct.findMany({
    where: {
      OR: orFilters
    },
    take: 25
  });
}

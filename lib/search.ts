import { Prisma } from "@prisma/client";
import { cleanString, normalizeCode, parseTags } from "@/lib/normalize";

export function buildProductWhere(params: URLSearchParams) {
  const and: Prisma.ProductWhereInput[] = [];

  const sku = normalizeCode(params.get("sku"), { skipEmpty: true });
  if (sku) and.push({ sku });

  const ean = normalizeCode(params.get("ean"), { skipEmpty: true });
  if (ean) and.push({ ean });

  const gtin = normalizeCode(params.get("gtin"), { skipEmpty: true });
  if (gtin) and.push({ gtin });

  const cip = normalizeCode(params.get("cip"), { skipEmpty: true });
  if (cip) and.push({ cip });

  const barcode = normalizeCode(params.get("barcode"), { skipEmpty: true });
  if (barcode) and.push({ barcode });

  const name = cleanString(params.get("name"), { skipEmpty: true });
  if (name) and.push({ name: { contains: name, mode: "insensitive" } });

  const brand = cleanString(params.get("brand"), { skipEmpty: true });
  if (brand) and.push({ brand: { contains: brand, mode: "insensitive" } });

  const categoryL1 = cleanString(params.get("category_l1"), { skipEmpty: true });
  if (categoryL1) and.push({ categoryL1: { contains: categoryL1, mode: "insensitive" } });

  const categoryL2 = cleanString(params.get("category_l2"), { skipEmpty: true });
  if (categoryL2) and.push({ categoryL2: { contains: categoryL2, mode: "insensitive" } });

  const categoryL3 = cleanString(params.get("category_l3"), { skipEmpty: true });
  if (categoryL3) and.push({ categoryL3: { contains: categoryL3, mode: "insensitive" } });

  const categoryL4 = cleanString(params.get("category_l4"), { skipEmpty: true });
  if (categoryL4) and.push({ categoryL4: { contains: categoryL4, mode: "insensitive" } });

  const tags = parseTags(params.get("tags"), { skipEmpty: true });
  if (tags && Array.isArray(tags) && tags.length) {
    and.push({ tags: { hasEvery: tags } });
  }

  const q = cleanString(params.get("q"), { skipEmpty: true });
  if (q) {
    and.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
        { sku: { contains: q, mode: "insensitive" } },
        { ean: { contains: q } },
        { gtin: { contains: q } },
        { cip: { contains: q } }
      ]
    });
  }

  if (!and.length) return {};
  return { AND: and } as Prisma.ProductWhereInput;
}

import { SourceType } from "@prisma/client";

export type ProductInput = {
  sku?: string | null;
  name?: string | null;
  brand?: string | null;
  color?: string | null;
  categoryL1?: string | null;
  categoryL2?: string | null;
  categoryL3?: string | null;
  categoryL4?: string | null;
  tags?: string | string[] | null;
  warehouse?: string | null;
  rack?: string | null;
  shelf?: string | null;
  bin?: string | null;
  rackColor?: string | null;
  barcode?: string | null;
  ean?: string | null;
  gtin?: string | null;
  cip?: string | null;
  priceHt?: string | number | null;
  vatRate?: string | number | null;
  priceTtc?: string | number | null;
  currency?: string | null;
  lengthCm?: string | number | null;
  widthCm?: string | number | null;
  heightCm?: string | number | null;
  weightG?: string | number | null;
  volumeCm3?: string | number | null;
  quantity?: string | number | null;
  storageConditions?: string | null;
  perishable?: string | boolean | null;
  quarantineDefault?: string | boolean | null;
  notes?: string | null;
  photoUrl?: string | null;
  sourceType?: SourceType;
  sourceName?: string | null;
  sourceSupplier?: string | null;
  sourceRef?: string | null;
};

export type NormalizedProduct = {
  sku: string | null;
  name: string;
  brand: string | null;
  color: string | null;
  categoryL1: string | null;
  categoryL2: string | null;
  categoryL3: string | null;
  categoryL4: string | null;
  tags: string[];
  warehouse: string | null;
  rack: string | null;
  shelf: string | null;
  bin: string | null;
  rackColor: string | null;
  barcode: string | null;
  ean: string | null;
  gtin: string | null;
  cip: string | null;
  priceHt: string | null;
  vatRate: string | null;
  priceTtc: string | null;
  currency: string;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
  weightG: number | null;
  volumeCm3: number | null;
  quantity: number | null;
  storageConditions: string | null;
  perishable: boolean | null;
  quarantineDefault: boolean | null;
  notes: string | null;
  photoUrl: string | null;
  sourceType: SourceType;
  sourceName: string | null;
  sourceSupplier: string | null;
  sourceRef: string | null;
};

export type NormalizeOptions = {
  defaultSourceType?: SourceType;
  defaultSourceName?: string | null;
  defaultSourceSupplier?: string | null;
  skipEmpty?: boolean;
};

export function cleanString(value: unknown, { skipEmpty }: { skipEmpty?: boolean } = {}) {
  if (value === undefined) return undefined;
  if (value === null) return skipEmpty ? undefined : null;
  const text = String(value).trim();
  if (!text) return skipEmpty ? undefined : null;
  return text;
}

export function normalizeCode(value: unknown, options?: { skipEmpty?: boolean }) {
  const text = cleanString(value, options);
  if (text === undefined) return undefined;
  if (text === null) return options?.skipEmpty ? undefined : null;
  return text.replace(/[\s-]/g, "");
}

export function parseTags(value: unknown, options?: { skipEmpty?: boolean }) {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) {
    const tags = value
      .map((tag) => String(tag).trim())
      .filter((tag) => tag.length > 0);
    return tags.length ? tags : options?.skipEmpty ? undefined : [];
  }
  const text = cleanString(value, options);
  if (text === undefined || text === null) return text;
  const tags = text
    .split(/[|,;]+/g)
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
  return tags.length ? tags : options?.skipEmpty ? undefined : [];
}

export function parseBoolean(value: unknown, options?: { skipEmpty?: boolean }) {
  if (value === undefined) return undefined;
  if (value === null) return options?.skipEmpty ? undefined : null;
  if (typeof value === "boolean") return value;
  const text = String(value).trim().toLowerCase();
  if (!text) return options?.skipEmpty ? undefined : null;
  if (["1", "true", "yes", "y", "oui"].includes(text)) return true;
  if (["0", "false", "no", "n", "non"].includes(text)) return false;
  return options?.skipEmpty ? undefined : null;
}

export function parseNumber(value: unknown, options?: { skipEmpty?: boolean; integer?: boolean }) {
  if (value === undefined) return undefined;
  if (value === null) return options?.skipEmpty ? undefined : null;
  const text = String(value).trim();
  if (!text) return options?.skipEmpty ? undefined : null;
  const normalized = text.replace(/\s+/g, "").replace(",", ".");
  const num = Number(normalized);
  if (!Number.isFinite(num)) return options?.skipEmpty ? undefined : null;
  return options?.integer ? Math.trunc(num) : num;
}

export function parseDecimalString(value: unknown, options?: { skipEmpty?: boolean }) {
  if (value === undefined) return undefined;
  if (value === null) return options?.skipEmpty ? undefined : null;
  const text = String(value).trim();
  if (!text) return options?.skipEmpty ? undefined : null;
  const normalized = text.replace(/\s+/g, "").replace(",", ".");
  const num = Number(normalized);
  if (!Number.isFinite(num)) return options?.skipEmpty ? undefined : null;
  return normalized;
}

export function normalizeProductInput(input: ProductInput, options: NormalizeOptions = {}): NormalizedProduct {
  const skipEmpty = false;
  const sku = cleanString(input.sku, { skipEmpty });
  const name = cleanString(input.name, { skipEmpty });
  const brand = cleanString(input.brand, { skipEmpty });
  const color = cleanString(input.color, { skipEmpty });
  const categoryL1 = cleanString(input.categoryL1, { skipEmpty });
  const categoryL2 = cleanString(input.categoryL2, { skipEmpty });
  const categoryL3 = cleanString(input.categoryL3, { skipEmpty });
  const categoryL4 = cleanString(input.categoryL4, { skipEmpty });
  const tags = parseTags(input.tags, { skipEmpty }) ?? [];
  const warehouse = cleanString(input.warehouse, { skipEmpty });
  const rack = cleanString(input.rack, { skipEmpty });
  const shelf = cleanString(input.shelf, { skipEmpty });
  const bin = cleanString(input.bin, { skipEmpty });
  const rackColor = cleanString(input.rackColor, { skipEmpty });
  const barcode = normalizeCode(input.barcode, { skipEmpty });
  const ean = normalizeCode(input.ean, { skipEmpty });
  const gtin = normalizeCode(input.gtin, { skipEmpty }) ?? ean ?? null;
  const cip = normalizeCode(input.cip, { skipEmpty });
  const priceHt = parseDecimalString(input.priceHt, { skipEmpty });
  const vatRate = parseDecimalString(input.vatRate, { skipEmpty });
  const priceTtc = parseDecimalString(input.priceTtc, { skipEmpty });
  const currency = cleanString(input.currency ?? "EUR", { skipEmpty }) ?? "EUR";
  const lengthCm = parseNumber(input.lengthCm, { skipEmpty });
  const widthCm = parseNumber(input.widthCm, { skipEmpty });
  const heightCm = parseNumber(input.heightCm, { skipEmpty });
  const weightG = parseNumber(input.weightG, { skipEmpty });
  const volumeCm3 = parseNumber(input.volumeCm3, { skipEmpty });
  const quantity = parseNumber(input.quantity, { skipEmpty, integer: true });
  const storageConditions = cleanString(input.storageConditions, { skipEmpty });
  const perishable = parseBoolean(input.perishable, { skipEmpty });
  const quarantineDefault = parseBoolean(input.quarantineDefault, { skipEmpty });
  const notes = cleanString(input.notes, { skipEmpty });
  const photoUrl = cleanString(input.photoUrl, { skipEmpty });
  const sourceType = input.sourceType ?? options.defaultSourceType ?? SourceType.manual;
  const sourceName = cleanString(input.sourceName ?? options.defaultSourceName, { skipEmpty });
  const sourceSupplier = cleanString(input.sourceSupplier ?? options.defaultSourceSupplier, { skipEmpty });
  const sourceRef = cleanString(input.sourceRef, { skipEmpty });

  const fallbackName = name ?? sku ?? ean ?? gtin ?? cip ?? "Produit sans nom";

  return {
    sku: sku ?? null,
    name: fallbackName,
    brand: brand ?? null,
    color: color ?? null,
    categoryL1: categoryL1 ?? null,
    categoryL2: categoryL2 ?? null,
    categoryL3: categoryL3 ?? null,
    categoryL4: categoryL4 ?? null,
    tags,
    warehouse: warehouse ?? null,
    rack: rack ?? null,
    shelf: shelf ?? null,
    bin: bin ?? null,
    rackColor: rackColor ?? null,
    barcode: barcode ?? null,
    ean: ean ?? null,
    gtin: gtin ?? null,
    cip: cip ?? null,
    priceHt: priceHt ?? null,
    vatRate: vatRate ?? null,
    priceTtc: priceTtc ?? null,
    currency,
    lengthCm: lengthCm ?? null,
    widthCm: widthCm ?? null,
    heightCm: heightCm ?? null,
    weightG: weightG ?? null,
    volumeCm3: volumeCm3 ?? null,
    quantity: quantity ?? null,
    storageConditions: storageConditions ?? null,
    perishable: perishable ?? null,
    quarantineDefault: quarantineDefault ?? null,
    notes: notes ?? null,
    photoUrl: photoUrl ?? null,
    sourceType,
    sourceName: sourceName ?? null,
    sourceSupplier: sourceSupplier ?? null,
    sourceRef: sourceRef ?? null
  };
}

export function normalizeProductPatch(input: ProductInput, options: NormalizeOptions = {}) {
  const skipEmpty = options.skipEmpty ?? false;
  const data: Partial<NormalizedProduct> = {};

  const setIfDefined = <K extends keyof NormalizedProduct>(key: K, value: NormalizedProduct[K] | undefined) => {
    if (value !== undefined) {
      data[key] = value;
    }
  };

  if (Object.prototype.hasOwnProperty.call(input, "sku")) setIfDefined("sku", cleanString(input.sku, { skipEmpty }) as NormalizedProduct["sku"]);
  if (Object.prototype.hasOwnProperty.call(input, "name")) setIfDefined("name", cleanString(input.name, { skipEmpty }) as NormalizedProduct["name"]);
  if (Object.prototype.hasOwnProperty.call(input, "brand")) setIfDefined("brand", cleanString(input.brand, { skipEmpty }) as NormalizedProduct["brand"]);
  if (Object.prototype.hasOwnProperty.call(input, "color")) setIfDefined("color", cleanString(input.color, { skipEmpty }) as NormalizedProduct["color"]);
  if (Object.prototype.hasOwnProperty.call(input, "categoryL1")) setIfDefined("categoryL1", cleanString(input.categoryL1, { skipEmpty }) as NormalizedProduct["categoryL1"]);
  if (Object.prototype.hasOwnProperty.call(input, "categoryL2")) setIfDefined("categoryL2", cleanString(input.categoryL2, { skipEmpty }) as NormalizedProduct["categoryL2"]);
  if (Object.prototype.hasOwnProperty.call(input, "categoryL3")) setIfDefined("categoryL3", cleanString(input.categoryL3, { skipEmpty }) as NormalizedProduct["categoryL3"]);
  if (Object.prototype.hasOwnProperty.call(input, "categoryL4")) setIfDefined("categoryL4", cleanString(input.categoryL4, { skipEmpty }) as NormalizedProduct["categoryL4"]);
  if (Object.prototype.hasOwnProperty.call(input, "tags")) setIfDefined("tags", parseTags(input.tags, { skipEmpty }) as NormalizedProduct["tags"]);
  if (Object.prototype.hasOwnProperty.call(input, "warehouse")) setIfDefined("warehouse", cleanString(input.warehouse, { skipEmpty }) as NormalizedProduct["warehouse"]);
  if (Object.prototype.hasOwnProperty.call(input, "rack")) setIfDefined("rack", cleanString(input.rack, { skipEmpty }) as NormalizedProduct["rack"]);
  if (Object.prototype.hasOwnProperty.call(input, "shelf")) setIfDefined("shelf", cleanString(input.shelf, { skipEmpty }) as NormalizedProduct["shelf"]);
  if (Object.prototype.hasOwnProperty.call(input, "bin")) setIfDefined("bin", cleanString(input.bin, { skipEmpty }) as NormalizedProduct["bin"]);
  if (Object.prototype.hasOwnProperty.call(input, "rackColor")) setIfDefined("rackColor", cleanString(input.rackColor, { skipEmpty }) as NormalizedProduct["rackColor"]);
  if (Object.prototype.hasOwnProperty.call(input, "barcode")) setIfDefined("barcode", normalizeCode(input.barcode, { skipEmpty }) as NormalizedProduct["barcode"]);
  if (Object.prototype.hasOwnProperty.call(input, "ean")) setIfDefined("ean", normalizeCode(input.ean, { skipEmpty }) as NormalizedProduct["ean"]);
  if (Object.prototype.hasOwnProperty.call(input, "gtin")) setIfDefined("gtin", normalizeCode(input.gtin, { skipEmpty }) as NormalizedProduct["gtin"]);
  if (Object.prototype.hasOwnProperty.call(input, "cip")) setIfDefined("cip", normalizeCode(input.cip, { skipEmpty }) as NormalizedProduct["cip"]);
  if (Object.prototype.hasOwnProperty.call(input, "priceHt")) setIfDefined("priceHt", parseDecimalString(input.priceHt, { skipEmpty }) as NormalizedProduct["priceHt"]);
  if (Object.prototype.hasOwnProperty.call(input, "vatRate")) setIfDefined("vatRate", parseDecimalString(input.vatRate, { skipEmpty }) as NormalizedProduct["vatRate"]);
  if (Object.prototype.hasOwnProperty.call(input, "priceTtc")) setIfDefined("priceTtc", parseDecimalString(input.priceTtc, { skipEmpty }) as NormalizedProduct["priceTtc"]);
  if (Object.prototype.hasOwnProperty.call(input, "currency")) setIfDefined("currency", (cleanString(input.currency, { skipEmpty }) ?? "EUR") as NormalizedProduct["currency"]);
  if (Object.prototype.hasOwnProperty.call(input, "lengthCm")) setIfDefined("lengthCm", parseNumber(input.lengthCm, { skipEmpty }) as NormalizedProduct["lengthCm"]);
  if (Object.prototype.hasOwnProperty.call(input, "widthCm")) setIfDefined("widthCm", parseNumber(input.widthCm, { skipEmpty }) as NormalizedProduct["widthCm"]);
  if (Object.prototype.hasOwnProperty.call(input, "heightCm")) setIfDefined("heightCm", parseNumber(input.heightCm, { skipEmpty }) as NormalizedProduct["heightCm"]);
  if (Object.prototype.hasOwnProperty.call(input, "weightG")) setIfDefined("weightG", parseNumber(input.weightG, { skipEmpty }) as NormalizedProduct["weightG"]);
  if (Object.prototype.hasOwnProperty.call(input, "volumeCm3")) setIfDefined("volumeCm3", parseNumber(input.volumeCm3, { skipEmpty }) as NormalizedProduct["volumeCm3"]);
  if (Object.prototype.hasOwnProperty.call(input, "quantity")) setIfDefined("quantity", parseNumber(input.quantity, { skipEmpty, integer: true }) as NormalizedProduct["quantity"]);
  if (Object.prototype.hasOwnProperty.call(input, "storageConditions")) setIfDefined("storageConditions", cleanString(input.storageConditions, { skipEmpty }) as NormalizedProduct["storageConditions"]);
  if (Object.prototype.hasOwnProperty.call(input, "perishable")) setIfDefined("perishable", parseBoolean(input.perishable, { skipEmpty }) as NormalizedProduct["perishable"]);
  if (Object.prototype.hasOwnProperty.call(input, "quarantineDefault")) setIfDefined("quarantineDefault", parseBoolean(input.quarantineDefault, { skipEmpty }) as NormalizedProduct["quarantineDefault"]);
  if (Object.prototype.hasOwnProperty.call(input, "notes")) setIfDefined("notes", cleanString(input.notes, { skipEmpty }) as NormalizedProduct["notes"]);
  if (Object.prototype.hasOwnProperty.call(input, "photoUrl")) setIfDefined("photoUrl", cleanString(input.photoUrl, { skipEmpty }) as NormalizedProduct["photoUrl"]);
  if (Object.prototype.hasOwnProperty.call(input, "sourceType")) setIfDefined("sourceType", input.sourceType ?? options.defaultSourceType ?? SourceType.manual);
  if (Object.prototype.hasOwnProperty.call(input, "sourceName")) setIfDefined("sourceName", cleanString(input.sourceName ?? options.defaultSourceName, { skipEmpty }) as NormalizedProduct["sourceName"]);
  if (Object.prototype.hasOwnProperty.call(input, "sourceSupplier")) setIfDefined("sourceSupplier", cleanString(input.sourceSupplier ?? options.defaultSourceSupplier, { skipEmpty }) as NormalizedProduct["sourceSupplier"]);
  if (Object.prototype.hasOwnProperty.call(input, "sourceRef")) setIfDefined("sourceRef", cleanString(input.sourceRef, { skipEmpty }) as NormalizedProduct["sourceRef"]);

  return data;
}

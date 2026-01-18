import { getAsfWmsConfig } from "@/lib/external/config";

export type WmsProduct = {
  id: string;
  sku: string | null;
  name: string;
  brand: string | null;
  color: string | null;
  categoryId: number | null;
  categoryName: string | null;
  tags: string[];
  barcode: string | null;
  ean: string | null;
  priceHt: number | null;
  vatRate: number | null;
  priceTtc: number | null;
  availableStock: number | null;
  defaultLocationId: number | null;
  storageConditions: string | null;
  weightG: number | null;
  volumeCm3: number | null;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
  perishable: boolean | null;
  quarantineDefault: boolean | null;
  notes: string | null;
  isActive: boolean | null;
  photoUrl: string | null;
};

type WmsProductApi = {
  id: number | string;
  sku?: string | null;
  name?: string | null;
  brand?: string | null;
  color?: string | null;
  category_id?: number | null;
  category_name?: string | null;
  tags?: string[] | null;
  barcode?: string | null;
  ean?: string | null;
  pu_ht?: number | string | null;
  tva?: number | string | null;
  pu_ttc?: number | string | null;
  available_stock?: number | string | null;
  default_location_id?: number | string | null;
  storage_conditions?: string | null;
  weight_g?: number | string | null;
  volume_cm3?: number | string | null;
  length_cm?: number | string | null;
  width_cm?: number | string | null;
  height_cm?: number | string | null;
  perishable?: boolean | string | null;
  quarantine_default?: boolean | string | null;
  notes?: string | null;
  is_active?: boolean | string | null;
  photo?: string | null;
};

type WmsResponse = WmsProductApi[] | { results?: WmsProductApi[] };

const FILTER_MAP: Record<string, string> = {
  q: "q",
  name: "name",
  brand: "brand",
  sku: "sku",
  barcode: "barcode",
  ean: "ean",
  gtin: "ean",
  color: "color",
  category: "category",
  categoryId: "category_id",
  tag: "tag",
  tagId: "tag_id",
  storageConditions: "storage_conditions",
  notes: "notes",
  perishable: "perishable",
  quarantineDefault: "quarantine_default",
  isActive: "is_active",
  defaultLocationId: "default_location_id",
  availableStock: "available_stock",
  priceHt: "pu_ht",
  vatRate: "tva",
  priceTtc: "pu_ttc",
  weightG: "weight_g",
  volumeCm3: "volume_cm3",
  lengthCm: "length_cm",
  widthCm: "width_cm",
  heightCm: "height_cm"
};

function buildApiBase(baseUrl: string) {
  const trimmed = baseUrl.replace(/\/+$/, "");
  if (trimmed.endsWith("/api/v1")) return trimmed;
  if (trimmed.endsWith("/api")) return `${trimmed}/v1`;
  return `${trimmed}/api/v1`;
}

function toNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const num = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  return Number.isFinite(num) ? num : null;
}

function toInt(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const num = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  return Number.isFinite(num) ? num : null;
}

function toBool(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return value;
  const text = String(value).trim().toLowerCase();
  if (!text) return null;
  if (["1", "true", "yes", "y", "oui"].includes(text)) return true;
  if (["0", "false", "no", "n", "non"].includes(text)) return false;
  return null;
}

function mapWmsProduct(product: WmsProductApi): WmsProduct {
  return {
    id: String(product.id),
    sku: product.sku ?? null,
    name: product.name ?? "Produit sans nom",
    brand: product.brand ?? null,
    color: product.color ?? null,
    categoryId: toInt(product.category_id),
    categoryName: product.category_name ?? null,
    tags: Array.isArray(product.tags) ? product.tags : [],
    barcode: product.barcode ?? null,
    ean: product.ean ?? null,
    priceHt: toNumber(product.pu_ht),
    vatRate: toNumber(product.tva),
    priceTtc: toNumber(product.pu_ttc),
    availableStock: toInt(product.available_stock),
    defaultLocationId: toInt(product.default_location_id),
    storageConditions: product.storage_conditions ?? null,
    weightG: toInt(product.weight_g),
    volumeCm3: toInt(product.volume_cm3),
    lengthCm: toNumber(product.length_cm),
    widthCm: toNumber(product.width_cm),
    heightCm: toNumber(product.height_cm),
    perishable: toBool(product.perishable),
    quarantineDefault: toBool(product.quarantine_default),
    notes: product.notes ?? null,
    isActive: toBool(product.is_active),
    photoUrl: product.photo ?? null
  };
}

function buildSearchParams(source: URLSearchParams) {
  const params = new URLSearchParams();
  const rawEan = source.get("ean");
  const rawGtin = source.get("gtin");

  Object.entries(FILTER_MAP).forEach(([key, target]) => {
    const value = source.get(key);
    if (!value) return;
    if (key === "gtin" && rawEan) return;
    params.set(target, value);
  });

  if (!rawEan && rawGtin) {
    params.set("ean", rawGtin);
  }

  return params;
}

export async function fetchWmsProducts(filters: URLSearchParams): Promise<WmsProduct[]> {
  const config = getAsfWmsConfig();
  if (!config?.baseUrl || !config.apiKey) {
    throw new Error("ASF WMS not configured");
  }

  const apiBase = buildApiBase(config.baseUrl);
  const url = new URL(`${apiBase}/products/`);
  const query = buildSearchParams(filters);
  query.forEach((value, key) => url.searchParams.set(key, value));

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "X-ASF-Integration-Key": config.apiKey
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`ASF WMS request failed (${response.status})`);
  }

  const data = (await response.json()) as WmsResponse;
  const items = Array.isArray(data) ? data : data.results ?? [];
  return items.map(mapWmsProduct);
}

export async function fetchWmsProduct(id: string): Promise<WmsProduct | null> {
  const config = getAsfWmsConfig();
  if (!config?.baseUrl || !config.apiKey) {
    throw new Error("ASF WMS not configured");
  }

  const apiBase = buildApiBase(config.baseUrl);
  const url = new URL(`${apiBase}/products/${encodeURIComponent(id)}/`);
  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "X-ASF-Integration-Key": config.apiKey
    },
    cache: "no-store"
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`ASF WMS request failed (${response.status})`);
  }

  const data = (await response.json()) as WmsProductApi;
  return mapWmsProduct(data);
}

import Papa from "papaparse";
import { ProductInput } from "@/lib/normalize";

export type CsvParseResult = {
  rows: ProductInput[];
  errors: string[];
};

export function parseCsv(csvText: string): CsvParseResult {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true
  });

  const errors = result.errors.map((err) => err.message);

  const rows = (result.data || []).map((row) => mapCsvRow(row));

  return { rows, errors };
}

export function mapCsvRow(row: Record<string, string>): ProductInput {
  return {
    sku: row.sku,
    name: row.nom,
    brand: row.marque,
    color: row.couleur,
    categoryL1: row.category_l1,
    categoryL2: row.category_l2,
    categoryL3: row.category_l3,
    categoryL4: row.category_l4,
    tags: row.tags,
    warehouse: row.entrepot,
    rack: row.rack,
    shelf: row.etagere,
    bin: row.bac,
    rackColor: row.rack_color,
    barcode: row.barcode,
    ean: row.ean,
    priceHt: row.pu_ht,
    vatRate: row.tva,
    priceTtc: row.pu_ttc,
    lengthCm: row.length_cm,
    widthCm: row.width_cm,
    heightCm: row.height_cm,
    weightG: row.weight_g,
    volumeCm3: row.volume_cm3,
    quantity: row.quantity,
    storageConditions: row.storage_conditions,
    perishable: row.perishable,
    quarantineDefault: row.quarantine_default,
    notes: row.notes,
    photoUrl: row.photo
  };
}

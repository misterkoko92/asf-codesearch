import fs from "fs";
import Papa from "papaparse";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function parseArgs(argv) {
  const args = {
    source: null,
    file: null,
    maps: {},
    limit: null,
    dryRun: false
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--source") {
      args.source = argv[++i];
    } else if (arg === "--file") {
      args.file = argv[++i];
    } else if (arg === "--map") {
      const [target, source] = argv[++i].split("=");
      if (target && source) {
        args.maps[target] = source;
      }
    } else if (arg === "--limit") {
      args.limit = Number(argv[++i]);
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    }
  }

  return args;
}

function pick(row, key) {
  if (!key) return null;
  const value = row[key];
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

async function main() {
  const args = parseArgs(process.argv);

  if (!args.source || !args.file) {
    console.error("Usage: node scripts/import-external.mjs --source bdpm --file ./data.csv --map name=COL --map cip=CIP7");
    process.exit(1);
  }

  const content = fs.readFileSync(args.file, "utf8");
  const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });

  const rows = parsed.data;
  const limit = args.limit ? Math.min(rows.length, args.limit) : rows.length;

  let created = 0;
  let skipped = 0;

  for (let index = 0; index < limit; index += 1) {
    const row = rows[index];
    const entry = {
      source: args.source,
      sourceId: pick(row, args.maps.sourceId),
      name: pick(row, args.maps.name),
      brand: pick(row, args.maps.brand),
      ean: pick(row, args.maps.ean),
      gtin: pick(row, args.maps.gtin),
      cip: pick(row, args.maps.cip),
      raw: row
    };

    if (!entry.name && !entry.ean && !entry.gtin && !entry.cip) {
      skipped += 1;
      continue;
    }

    if (!args.dryRun) {
      await prisma.externalProduct.create({ data: entry });
    }
    created += 1;
  }

  await prisma.$disconnect();

  console.log(`Done. Created: ${created}, Skipped: ${skipped}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

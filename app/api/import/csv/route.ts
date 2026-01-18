import { NextResponse } from "next/server";
import { SourceType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { parseCsv } from "@/lib/csv";
import { normalizeProductInput, normalizeProductPatch } from "@/lib/normalize";
import { buildProductLookup } from "@/lib/product";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const sourceNameParam = url.searchParams.get("source_name");
  const sourceSupplierParam = url.searchParams.get("source_supplier");

  const contentType = request.headers.get("content-type") ?? "";
  let csvText = "";
  let sourceName = sourceNameParam ?? "CSV import";
  let sourceSupplier = sourceSupplierParam ?? null;

  if (contentType.includes("application/json")) {
    const payload = (await request.json()) as {
      csv?: string;
      sourceName?: string;
      sourceSupplier?: string;
    };
    csvText = payload.csv ?? "";
    sourceName = payload.sourceName ?? sourceName;
    sourceSupplier = payload.sourceSupplier ?? sourceSupplier;
  } else {
    csvText = await request.text();
  }

  if (!csvText.trim()) {
    return NextResponse.json({ error: "CSV content is empty" }, { status: 400 });
  }

  const { rows, errors } = parseCsv(csvText);

  const results = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors
  };

  for (const [index, row] of rows.entries()) {
    const baseInput = {
      ...row,
      sourceType: SourceType.csv,
      sourceName,
      sourceSupplier
    };

    const createData = normalizeProductInput(baseInput, {
      defaultSourceType: SourceType.csv,
      defaultSourceName: sourceName,
      defaultSourceSupplier: sourceSupplier
    });
    const updateData = normalizeProductPatch(baseInput, {
      defaultSourceType: SourceType.csv,
      defaultSourceName: sourceName,
      defaultSourceSupplier: sourceSupplier,
      skipEmpty: true
    });

    const lookup = buildProductLookup(createData);
    if (!lookup) {
      results.skipped += 1;
      continue;
    }

    const existing = await prisma.product.findFirst({
      where: {
        OR: [lookup]
      }
    });

    try {
      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: updateData
        });
        results.updated += 1;
      } else {
        await prisma.product.create({
          data: {
            ...createData,
            createdById: user.id
          }
        });
        results.created += 1;
      }
    } catch (error) {
      results.errors.push(`Row ${index + 1}: ${String(error)}`);
    }
  }

  return NextResponse.json({ data: results });
}

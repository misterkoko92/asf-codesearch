import { NextResponse } from "next/server";
import { lookupExternalSources } from "@/lib/external";
import { normalizeCode } from "@/lib/normalize";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const ean = normalizeCode(searchParams.get("ean"), { skipEmpty: true });
  const gtin = normalizeCode(searchParams.get("gtin"), { skipEmpty: true });
  const cip = normalizeCode(searchParams.get("cip"), { skipEmpty: true });

  if (!ean && !gtin && !cip) {
    return NextResponse.json({ error: "Provide ean, gtin, or cip" }, { status: 400 });
  }

  const results = await lookupExternalSources({ ean, gtin, cip });
  return NextResponse.json({ data: results });
}

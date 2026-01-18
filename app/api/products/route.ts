import { NextResponse } from "next/server";
import { fetchWmsProducts } from "@/lib/integrations/asfWmsProducts";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  try {
    const products = await fetchWmsProducts(searchParams);
    return NextResponse.json({ data: products });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ error: "ASF WMS is read-only from Codesearch." }, { status: 501 });
}

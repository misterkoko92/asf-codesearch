import { NextResponse } from "next/server";
import { fetchWmsProduct } from "@/lib/integrations/asfWmsProducts";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

type Params = { params: { id: string } };

export async function GET(request: Request, { params }: Params) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const product = await fetchWmsProduct(params.id);
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 502 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ error: "ASF WMS is read-only from Codesearch." }, { status: 501 });
}

export async function DELETE(request: Request, { params }: Params) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ error: "ASF WMS is read-only from Codesearch." }, { status: 501 });
}

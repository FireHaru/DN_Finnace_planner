import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { idSchema, wishlistSchema } from "@/lib/finance";
import { apiError } from "@/lib/http";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!idSchema.safeParse(id).success) {
      return NextResponse.json({ error: "Mã mục tiêu không hợp lệ." }, { status: 400 });
    }
    const input = wishlistSchema.parse(await request.json());
    const rows = await getSql().query(
      `UPDATE wishlist
       SET name = $1, cost = $2, priority = $3, category = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, cost, priority, category, notified`,
      [input.name, input.cost, input.priority, input.category, id],
    );
    const wish = rows[0];
    if (!wish) {
      return NextResponse.json({ error: "Không tìm thấy mục tiêu." }, { status: 404 });
    }
    return NextResponse.json({ ...wish, cost: Number(wish.cost) });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!idSchema.safeParse(id).success) {
      return NextResponse.json({ error: "Mã mục tiêu không hợp lệ." }, { status: 400 });
    }
    const rows = await getSql().query("DELETE FROM wishlist WHERE id = $1 RETURNING id", [id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy mục tiêu." }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}

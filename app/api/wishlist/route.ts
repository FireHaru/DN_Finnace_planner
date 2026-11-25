import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { wishlistSchema } from "@/lib/finance";
import { apiError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await getSql().query(
      `SELECT id, name, cost, priority, category, notified
       FROM wishlist ORDER BY created_at DESC`,
    );
    return NextResponse.json(rows.map((row) => ({ ...row, cost: Number(row.cost) })));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = wishlistSchema.parse(await request.json());
    const rows = await getSql().query(
      `INSERT INTO wishlist (name, cost, priority, category)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, cost, priority, category, notified`,
      [input.name, input.cost, input.priority, input.category],
    );
    const wish = rows[0];
    if (!wish) throw new Error("Neon không trả về mục tiêu vừa tạo.");
    return NextResponse.json({ ...wish, cost: Number(wish.cost) }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

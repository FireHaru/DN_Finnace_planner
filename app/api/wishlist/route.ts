import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { wishlistSchema } from "@/lib/finance";
import { apiError, authenticationRequiredResponse } from "@/lib/http";
import { getAuthSession } from "@/lib/auth-session";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return authenticationRequiredResponse();

    const rows = await getSql().query(
      `SELECT id, name, cost, saved_amount AS "savedAmount", priority, category, notified
       FROM wishlist WHERE user_id = $1 ORDER BY created_at DESC`,
      [session.user.id],
    );
    return NextResponse.json(rows.map((row) => ({ ...row, cost: Number(row.cost), savedAmount: Number(row.savedAmount) })));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return authenticationRequiredResponse();

    const input = wishlistSchema.parse(await request.json());
    const rows = await getSql().query(
      `INSERT INTO wishlist (user_id, name, cost, priority, category)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, cost, saved_amount AS "savedAmount", priority, category, notified`,
      [session.user.id, input.name, input.cost, input.priority, input.category],
    );
    const wish = rows[0];
    if (!wish) throw new Error("Neon không trả về mục tiêu vừa tạo.");
    return NextResponse.json({ ...wish, cost: Number(wish.cost), savedAmount: Number(wish.savedAmount) }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

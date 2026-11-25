import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { idSchema, wishlistSchema } from "@/lib/finance";
import { apiError, authenticationRequiredResponse } from "@/lib/http";
import { getAuthSession } from "@/lib/auth-session";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const session = await getAuthSession();
    if (!session) return authenticationRequiredResponse();

    const { id } = await params;
    if (!idSchema.safeParse(id).success) {
      return NextResponse.json({ error: "Mã mục tiêu không hợp lệ." }, { status: 400 });
    }
    const input = wishlistSchema.parse(await request.json());
    const [, rows, currentRows] = await getSql().transaction((sql) => [
      sql`SELECT id FROM finance_fund_lock WHERE id = 1 FOR UPDATE`,
      sql`UPDATE wishlist
          SET name = ${input.name}, cost = ${input.cost}, priority = ${input.priority},
              category = ${input.category}, updated_at = NOW()
          WHERE id = ${id} AND user_id = ${session.user.id} AND saved_amount <= ${input.cost}
          RETURNING id, name, cost, saved_amount AS "savedAmount", priority, category, notified`,
      sql`SELECT saved_amount AS "savedAmount" FROM wishlist
          WHERE id = ${id} AND user_id = ${session.user.id}`,
    ]);
    const wish = rows[0];
    if (!wish) {
      const currentWish = currentRows[0];
      if (!currentWish) {
        return NextResponse.json({ error: "Không tìm thấy mục tiêu." }, { status: 404 });
      }
      return NextResponse.json({ error: "Chi phí mục tiêu không thể thấp hơn số tiền đã bỏ vào quỹ." }, { status: 400 });
    }
    return NextResponse.json({ ...wish, cost: Number(wish.cost), savedAmount: Number(wish.savedAmount) });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const session = await getAuthSession();
    if (!session) return authenticationRequiredResponse();

    const { id } = await params;
    if (!idSchema.safeParse(id).success) {
      return NextResponse.json({ error: "Mã mục tiêu không hợp lệ." }, { status: 400 });
    }
    const rows = await getSql().query(
      "DELETE FROM wishlist WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, session.user.id],
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy mục tiêu." }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}

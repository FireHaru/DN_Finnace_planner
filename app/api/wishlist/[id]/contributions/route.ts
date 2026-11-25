import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { contributionSchema, idSchema } from "@/lib/finance";
import { apiError, authenticationRequiredResponse } from "@/lib/http";
import { getAuthSession } from "@/lib/auth-session";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const session = await getAuthSession();
    if (!session) return authenticationRequiredResponse();

    const { id } = await params;
    if (!idSchema.safeParse(id).success) {
      return NextResponse.json({ error: "Mã mục tiêu không hợp lệ." }, { status: 400 });
    }

    const { amount } = contributionSchema.parse(await request.json());
    const sql = getSql();
    const [, updatedRows, currentRows] = await sql.transaction((transaction) => [
      transaction`SELECT id FROM finance_fund_lock WHERE id = 1 FOR UPDATE`,
      transaction`UPDATE wishlist AS goal
                  SET saved_amount = goal.saved_amount + ${amount}, updated_at = NOW()
                  WHERE goal.id = ${id} AND goal.user_id = ${session.user.id}
                    AND goal.saved_amount + ${amount} <= goal.cost
                    AND ${amount} <= (
                      COALESCE((
                        SELECT SUM(CASE WHEN type = 'INCOME' THEN amount ELSE -amount END)
                        FROM transactions WHERE user_id = ${session.user.id}
                      ), 0) - COALESCE((
                        SELECT SUM(saved_amount) FROM wishlist WHERE user_id = ${session.user.id}
                      ), 0)
                    )
                  RETURNING goal.id, goal.name, goal.cost, goal.saved_amount AS "savedAmount"`,
      transaction`SELECT id, cost, saved_amount AS "savedAmount",
                    COALESCE((
                      SELECT SUM(CASE WHEN type = 'INCOME' THEN amount ELSE -amount END)
                      FROM transactions WHERE user_id = ${session.user.id}
                    ), 0) - COALESCE((
                      SELECT SUM(saved_amount) FROM wishlist WHERE user_id = ${session.user.id}
                    ), 0) AS "availableBalance"
                  FROM wishlist WHERE id = ${id} AND user_id = ${session.user.id}`,
    ]);

    const updatedWish = updatedRows[0];
    if (updatedWish) {
      return NextResponse.json({
        ...updatedWish,
        cost: Number(updatedWish.cost),
        savedAmount: Number(updatedWish.savedAmount),
      });
    }

    const currentWish = currentRows[0];
    if (!currentWish) {
      return NextResponse.json({ error: "Không tìm thấy mục tiêu." }, { status: 404 });
    }
    if (amount > Number(currentWish.cost) - Number(currentWish.savedAmount)) {
      return NextResponse.json({ error: "Số tiền vượt quá phần còn thiếu của mục tiêu." }, { status: 400 });
    }
    if (amount > Number(currentWish.availableBalance)) {
      return NextResponse.json({ error: "Số dư khả dụng không đủ để chuyển vào quỹ." }, { status: 409 });
    }

    throw new Error("Không thể cập nhật số tiền trong quỹ.");
  } catch (error) {
    return apiError(error);
  }
}

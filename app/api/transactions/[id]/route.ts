import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { idSchema, transactionSchema } from "@/lib/finance";
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
      return NextResponse.json({ error: "Mã giao dịch không hợp lệ." }, { status: 400 });
    }
    const input = transactionSchema.parse(await request.json());
    const [, rows] = await getSql().transaction((sql) => [
      sql`SELECT id FROM finance_fund_lock WHERE id = 1 FOR UPDATE`,
      sql`UPDATE transactions
          SET type = ${input.type}, amount = ${input.amount}, description = ${input.description},
              category = ${input.category}, date = ${input.date}, updated_at = NOW()
          WHERE id = ${id} AND user_id = ${session.user.id}
          RETURNING id, type, amount, description, category, to_char(date, 'YYYY-MM-DD') AS date`,
    ]);
    const transaction = rows[0];
    if (!transaction) {
      return NextResponse.json({ error: "Không tìm thấy giao dịch." }, { status: 404 });
    }
    return NextResponse.json({ ...transaction, amount: Number(transaction.amount) });
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
      return NextResponse.json({ error: "Mã giao dịch không hợp lệ." }, { status: 400 });
    }
    const [, rows] = await getSql().transaction((sql) => [
      sql`SELECT id FROM finance_fund_lock WHERE id = 1 FOR UPDATE`,
      sql`DELETE FROM transactions WHERE id = ${id} AND user_id = ${session.user.id} RETURNING id`,
    ]);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy giao dịch." }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}

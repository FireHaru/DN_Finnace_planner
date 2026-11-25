import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { transactionSchema } from "@/lib/finance";
import { apiError, authenticationRequiredResponse } from "@/lib/http";
import { getAuthSession } from "@/lib/auth-session";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return authenticationRequiredResponse();

    const rows = await getSql().query(
      `SELECT id, type, amount, description, category, to_char(date, 'YYYY-MM-DD') AS date
       FROM transactions WHERE user_id = $1 ORDER BY date DESC, created_at DESC`,
      [session.user.id],
    );
    return NextResponse.json(
      rows.map((row) => ({ ...row, amount: Number(row.amount) })),
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return authenticationRequiredResponse();

    const input = transactionSchema.parse(await request.json());
    const [, rows] = await getSql().transaction((sql) => [
      sql`SELECT id FROM finance_fund_lock WHERE id = 1 FOR UPDATE`,
      sql`INSERT INTO transactions (user_id, type, amount, description, category, date)
          VALUES (${session.user.id}, ${input.type}, ${input.amount}, ${input.description}, ${input.category}, ${input.date})
          RETURNING id, type, amount, description, category, to_char(date, 'YYYY-MM-DD') AS date`,
    ]);
    const transaction = rows[0];
    if (!transaction) throw new Error("Neon không trả về giao dịch vừa tạo.");
    return NextResponse.json(
      { ...transaction, amount: Number(transaction.amount) },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error);
  }
}

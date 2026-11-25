import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { transactionSchema } from "@/lib/finance";
import { apiError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await getSql().query(
      `SELECT id, type, amount, description, category, to_char(date, 'YYYY-MM-DD') AS date
       FROM transactions ORDER BY date DESC, created_at DESC`,
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
    const input = transactionSchema.parse(await request.json());
    const rows = await getSql().query(
      `INSERT INTO transactions (type, amount, description, category, date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, type, amount, description, category, to_char(date, 'YYYY-MM-DD') AS date`,
      [input.type, input.amount, input.description, input.category, input.date],
    );
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

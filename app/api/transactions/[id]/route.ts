import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { idSchema, transactionSchema } from "@/lib/finance";
import { apiError } from "@/lib/http";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!idSchema.safeParse(id).success) {
      return NextResponse.json({ error: "Mã giao dịch không hợp lệ." }, { status: 400 });
    }
    const input = transactionSchema.parse(await request.json());
    const rows = await getSql().query(
      `UPDATE transactions
       SET type = $1, amount = $2, description = $3, category = $4, date = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING id, type, amount, description, category, to_char(date, 'YYYY-MM-DD') AS date`,
      [input.type, input.amount, input.description, input.category, input.date, id],
    );
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
    const { id } = await params;
    if (!idSchema.safeParse(id).success) {
      return NextResponse.json({ error: "Mã giao dịch không hợp lệ." }, { status: 400 });
    }
    const rows = await getSql().query("DELETE FROM transactions WHERE id = $1 RETURNING id", [id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy giao dịch." }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}

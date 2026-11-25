import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: error.issues[0]?.message ?? "Dữ liệu không hợp lệ." },
      { status: 400 },
    );
  }
  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: "Nội dung JSON không hợp lệ." }, { status: 400 });
  }

  console.error("Finance Planner API error:", error);
  const missingDatabaseUrl = error instanceof Error && error.message.startsWith("Thiếu DATABASE_URL.");
  return NextResponse.json(
    {
      error: missingDatabaseUrl
        ? error.message
        : "Không thể xử lý yêu cầu. Kiểm tra kết nối PostgreSQL rồi thử lại.",
    },
    { status: missingDatabaseUrl ? 503 : 500 },
  );
}

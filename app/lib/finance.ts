import { z } from "zod";

export const CATEGORIES = [
  "FOOD",
  "TRANSPORT",
  "ENTERTAINMENT",
  "SHOPPING",
  "BILLS",
  "SALARY",
  "INVESTMENT",
  "OTHER",
] as const;
export type Category = (typeof CATEGORIES)[number];
export type TxType = "INCOME" | "EXPENSE";

export const CATEGORY_LABEL: Record<Category, string> = {
  FOOD: "Ăn uống",
  TRANSPORT: "Di chuyển",
  ENTERTAINMENT: "Giải trí",
  SHOPPING: "Mua sắm",
  BILLS: "Hoá đơn",
  SALARY: "Lương",
  INVESTMENT: "Đầu tư",
  OTHER: "Khác",
};

export const WISH_CATEGORIES = [
  "FOOD",
  "TRAVEL",
  "HOUSEHOLD",
  "TECHNOLOGY",
  "FASHION",
  "HEALTH",
  "EDUCATION",
  "ENTERTAINMENT",
  "OTHER",
] as const;
export type WishCategory = (typeof WISH_CATEGORIES)[number];
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export const WISH_CATEGORY_LABEL: Record<WishCategory, string> = {
  FOOD: "Ăn uống",
  TRAVEL: "Du lịch",
  HOUSEHOLD: "Đồ dùng",
  TECHNOLOGY: "Công nghệ",
  FASHION: "Thời trang",
  HEALTH: "Sức khoẻ",
  EDUCATION: "Học tập",
  ENTERTAINMENT: "Giải trí",
  OTHER: "Khác",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  HIGH: "Ưu tiên cao",
  MEDIUM: "Ưu tiên vừa",
  LOW: "Ưu tiên thấp",
};

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  description: string;
  category: Category;
  date: string;
}

export interface WishlistItem {
  id: string;
  name: string;
  cost: number;
  priority: Priority;
  category: WishCategory;
  notified: number[];
}

const moneySchema = z.coerce.number().int("Số tiền phải là số nguyên").positive("Số tiền phải lớn hơn 0").safe();

export const transactionSchema = z.object({
  amount: moneySchema,
  description: z.string().trim().min(1, "Mô tả không được để trống").max(120, "Tối đa 120 ký tự"),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.enum(CATEGORIES),
  date: z.iso.date("Ngày không hợp lệ"),
});

export const wishlistSchema = z.object({
  name: z.string().trim().min(1, "Nhập tên mục tiêu").max(80, "Tối đa 80 ký tự"),
  cost: moneySchema,
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  category: z.enum(WISH_CATEGORIES),
});

export const idSchema = z.uuid();

export function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function balanceOf(transactions: Transaction[]) {
  return transactions.reduce(
    (balance, transaction) => balance + (transaction.type === "INCOME" ? transaction.amount : -transaction.amount),
    0,
  );
}

export function progressPercent(balance: number, cost: number) {
  if (cost <= 0) return 0;
  return Math.min(100, Math.max(0, (balance / cost) * 100));
}

export function isInMonth(date: string, offset = 0, now = new Date()) {
  const parsed = new Date(`${date}T00:00:00`);
  const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return parsed.getFullYear() === target.getFullYear() && parsed.getMonth() === target.getMonth();
}

export function localDateInputValue(date = new Date()) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

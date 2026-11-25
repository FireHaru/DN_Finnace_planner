import { describe, expect, it } from "vitest";
import { availableBalanceOf, isInMonth, type Transaction } from "./finance";

describe("isInMonth", () => {
  it("matches the previous month across a year boundary", () => {
    expect(isInMonth("2025-12-31", -1, new Date(2026, 0, 10))).toBe(true);
  });

  describe("availableBalanceOf", () => {
    it("subtracts money allocated to goals from the transaction balance", () => {
      const transactions: Transaction[] = [
        { id: "income", type: "INCOME", amount: 100_000, description: "Lương", category: "SALARY", date: "2026-11-01" },
        { id: "expense", type: "EXPENSE", amount: 25_000, description: "Ăn trưa", category: "FOOD", date: "2026-11-02" },
      ];
      const wishlist = [
        { savedAmount: 15_000 },
        { savedAmount: 20_000 },
      ];

      expect(availableBalanceOf(transactions, wishlist)).toBe(40_000);
    });
  });
});

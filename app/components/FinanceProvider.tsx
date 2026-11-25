"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Transaction, WishlistItem } from "@/lib/finance";

interface FinanceContextValue {
  transactions: Transaction[];
  wishlist: WishlistItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  saveTransaction: (input: Omit<Transaction, "id">, id?: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  saveWish: (input: Omit<WishlistItem, "id" | "notified" | "savedAmount">, id?: string) => Promise<void>;
  contributeToWish: (id: string, amount: number) => Promise<void>;
  deleteWish: (id: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || "Yêu cầu không thành công. Vui lòng thử lại.");
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

async function loadFinance() {
  const [transactions, wishlist] = await Promise.all([
    request<Transaction[]>("/api/transactions"),
    request<WishlistItem[]>("/api/wishlist"),
  ]);
  return { transactions, wishlist };
}

function errorMessage(cause: unknown) {
  return cause instanceof Error ? cause.message : "Không thể tải dữ liệu.";
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await loadFinance();
      setTransactions(data.transactions);
      setWishlist(data.wishlist);
      setError(null);
    } catch (cause) {
      setError(errorMessage(cause));
      throw cause;
    }
  }, []);

  useEffect(() => {
    let active = true;
    loadFinance()
      .then((data) => {
        if (!active) return;
        setTransactions(data.transactions);
        setWishlist(data.wishlist);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (active) setError(errorMessage(cause));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const saveTransaction = useCallback(async (input: Omit<Transaction, "id">, id?: string) => {
    await request(id ? `/api/transactions/${id}` : "/api/transactions", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(input),
    });
    await refresh();
  }, [refresh]);

  const deleteTransaction = useCallback(async (id: string) => {
    await request(`/api/transactions/${id}`, { method: "DELETE" });
    await refresh();
  }, [refresh]);

  const saveWish = useCallback(async (input: Omit<WishlistItem, "id" | "notified" | "savedAmount">, id?: string) => {
    await request(id ? `/api/wishlist/${id}` : "/api/wishlist", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(input),
    });
    await refresh();
  }, [refresh]);

  const contributeToWish = useCallback(async (id: string, amount: number) => {
    await request(`/api/wishlist/${id}/contributions`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
    await refresh();
  }, [refresh]);

  const deleteWish = useCallback(async (id: string) => {
    await request(`/api/wishlist/${id}`, { method: "DELETE" });
    await refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ transactions, wishlist, loading, error, refresh, saveTransaction, deleteTransaction, saveWish, contributeToWish, deleteWish }),
    [transactions, wishlist, loading, error, refresh, saveTransaction, deleteTransaction, saveWish, contributeToWish, deleteWish],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance must be used within FinanceProvider.");
  return context;
}

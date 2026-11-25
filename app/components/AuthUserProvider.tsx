"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AuthUser } from "@/lib/auth";

const AuthUserContext = createContext<AuthUser | null>(null);

export function AuthUserProvider({ children, user }: { children: ReactNode; user: AuthUser }) {
  return <AuthUserContext.Provider value={user}>{children}</AuthUserContext.Provider>;
}

export function useAuthUser() {
  const user = useContext(AuthUserContext);
  if (!user) throw new Error("useAuthUser must be used within AuthUserProvider.");
  return user;
}

import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthUserProvider } from "@/components/AuthUserProvider";
import { FinanceProvider } from "@/components/FinanceProvider";
import { getAuthSession } from "@/lib/auth-session";

export const runtime = "nodejs";

export default async function FinanceLayout({ children }: { children: ReactNode }) {
  const session = await getAuthSession();
  if (!session) redirect("/login");

  return (
    <AuthUserProvider user={session.user}>
      <FinanceProvider>
        <AppShell user={session.user}>{children}</AppShell>
      </FinanceProvider>
    </AuthUserProvider>
  );
}

import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AppShell } from "@/components/AppShell";
import { FinanceProvider } from "@/components/FinanceProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Finance Planner",
    template: "%s · Finance Planner",
  },
  description: "Theo dõi thu chi và lên kế hoạch cho những mục tiêu tài chính của bạn.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <FinanceProvider>
          <AppShell>{children}</AppShell>
        </FinanceProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}

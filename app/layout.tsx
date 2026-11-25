import type { Metadata } from "next";
import { Toaster } from "sonner";
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
      <body suppressHydrationWarning>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}

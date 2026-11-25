"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    try {
      const result = await authClient.signOut();
      if (result.error) {
        toast.error(result.error.message ?? "Không thể đăng xuất.");
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Không thể kết nối máy chủ.");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      aria-label="Đăng xuất"
      className="icon-button sign-out-button"
      disabled={pending}
      onClick={handleSignOut}
      title="Đăng xuất"
      type="button"
    >
      <LogOut size={16} />
    </button>
  );
}

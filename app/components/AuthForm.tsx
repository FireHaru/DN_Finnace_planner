"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type AuthFormProps = { mode: "login" | "register" };

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isRegister && !name.trim()) {
      setError("Vui lòng nhập họ và tên.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      const result = isRegister
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password });

      if (result.error) {
        setError(result.error.message ?? "Không thể xác thực tài khoản.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể kết nối máy chủ.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <Link className="auth-brand" href="/">
          <span className="brand-mark"><Leaf size={19} strokeWidth={2.2} /></span>
          <span>Finnace planner<span className="brand-dot">.</span></span>
        </Link>
        <p className="auth-eyebrow">KHÔNG GIAN TÀI CHÍNH CỦA BẠN</p>
        <h1 id="auth-title">{isRegister ? "Tạo tài khoản" : "Chào mừng trở lại"}</h1>
        <p className="auth-description">
          {isRegister
            ? "Đăng ký để bắt đầu quản lý thu chi và mục tiêu của riêng bạn."
            : "Đăng nhập để tiếp tục kế hoạch tài chính cá nhân."}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <label className="auth-field">
              <span>Họ và tên</span>
              <input
                autoComplete="name"
                maxLength={100}
                onChange={(event) => setName(event.target.value)}
                required
                value={name}
              />
            </label>
          )}
          <label className="auth-field">
            <span>Email</span>
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="auth-field">
            <span>Mật khẩu</span>
            <input
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="button button-primary auth-submit" disabled={pending} type="submit">
            {pending && <LoaderCircle aria-hidden="true" className="auth-spinner" size={16} />}
            {isRegister ? "Tạo tài khoản" : "Đăng nhập"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
          <Link href={isRegister ? "/login" : "/register"}>
            {isRegister ? "Đăng nhập" : "Đăng ký"}
          </Link>
        </p>
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeftRight, ChartNoAxesCombined, Gift, LayoutDashboard, Leaf, Plus, Search } from "lucide-react";
import type { AuthUser } from "@/lib/auth";
import { SignOutButton } from "@/components/SignOutButton";

const NAV_ITEMS = [
  { href: "/", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/giao-dich", label: "Giao dịch", icon: ArrowLeftRight },
  { href: "/wishlist", label: "Mục tiêu", icon: Gift },
];

export function AppShell({ children, user }: { children: ReactNode; user: AuthUser }) {
  const pathname = usePathname();
  const currentPage = NAV_ITEMS.find((item) => item.href === pathname)?.label ?? "Tài chính";
  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0] ?? "")
    .join("")
    .toLocaleUpperCase("vi");

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark"><Leaf size={19} strokeWidth={2.2} /></span>
          <span>Finnace planner<span className="brand-dot">.</span></span>
        </Link>
        <div className="workspace-label">KHÔNG GIAN CỦA BẠN</div>
        <nav className="side-nav" aria-label="Điều hướng chính">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link className={`nav-link ${pathname === href ? "active" : ""}`} href={href} key={href}>
              <Icon size={18} strokeWidth={1.8} /> <span>{label}</span>
              {pathname === href && <span className="active-mark" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="side-tip">
          <span className="tip-icon"><ChartNoAxesCombined size={17} /></span>
          <p>Mỗi khoản nhỏ hôm nay sẽ tạo nên tự do ngày mai.</p>
        </div>
        <div className="profile-card">
          <div aria-hidden="true" className="avatar">{initials}</div>
          <div className="profile-copy"><strong>{user.name}</strong><span>{user.email}</span></div>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="mobile-brand">
            <Link className="brand" href="/">
              <span className="brand-mark"><Leaf size={18} /></span>
            </Link>
            <span className="mobile-page-label">{currentPage}</span>
          </div>
          <div className="breadcrumb"><span>Không gian của bạn</span><span className="breadcrumb-sl ash">/</span><strong>{currentPage}</strong></div>
          <div className="topbar-actions">
            <Link href="/giao-dich" className="top-search"><Search size={17} /><span>Tra cứu giao dịch</span></Link>
            <SignOutButton />
            <div aria-hidden="true" className="avatar top-avatar">{initials}</div>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>

      <nav className="mobile-nav" aria-label="Điều hướng trên điện thoại">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link className={`mobile-nav-link ${pathname === href ? "active" : ""}`} href={href} key={href}>
            <Icon size={20} strokeWidth={1.9} /><span>{label}</span>
          </Link>
        ))}
        <Link className="mobile-nav-add" href="/giao-dich?add=1" aria-label="Thêm giao dịch"><Plus size={21} /></Link>
      </nav>
    </div>
  );
}

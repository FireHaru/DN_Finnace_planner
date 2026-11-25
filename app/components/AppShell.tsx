"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeftRight, ChartNoAxesCombined, Gift, LayoutDashboard, Leaf, Plus, Search } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/giao-dich", label: "Giao dịch", icon: ArrowLeftRight },
  { href: "/wishlist", label: "Mục tiêu", icon: Gift },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const currentPage = NAV_ITEMS.find((item) => item.href === pathname)?.label ?? "Tài chính";

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark"><Leaf size={19} strokeWidth={2.2} /></span>
          <span>mầm<span className="brand-dot">.</span></span>
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
          <div className="avatar">MA</div>
          <div className="profile-copy"><strong>Minh Anh</strong><span>Kế hoạch cá nhân</span></div>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="mobile-brand">
            <Link className="brand" href="/">
              <span className="brand-mark"><Leaf size={18} /></span>
              <span>mầm<span className="brand-dot">.</span></span>
            </Link>
            <span className="mobile-page-label">{currentPage}</span>
          </div>
          <div className="breadcrumb"><span>Không gian của bạn</span><span className="breadcrumb-slash">/</span><strong>{currentPage}</strong></div>
          <div className="topbar-actions">
            <Link href="/giao-dich" className="top-search"><Search size={17} /><span>Tra cứu giao dịch</span></Link>
            <div className="avatar top-avatar">MA</div>
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

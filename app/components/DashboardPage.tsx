"use client";

import Link from "next/link";
import { ArrowDownLeft, ArrowRight, ArrowUpRight, CirclePlus, Clock3, Sparkles, Wallet } from "lucide-react";
import { DataIssue } from "@/components/DataIssue";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { useFinance } from "@/components/FinanceProvider";
import { balanceOf, CATEGORY_LABEL, formatVND, isInMonth, progressPercent } from "@/lib/finance";

const CHART_COLORS = ["#39705c", "#e7b66b", "#d68168", "#7896a4", "#93a77a", "#b5869c", "#8379a4", "#c5b9a2"];

export function DashboardPage() {
  const { transactions, wishlist, loading, error, refresh } = useFinance();
  const balance = balanceOf(transactions);
  const currentMonth = transactions.filter((transaction) => isInMonth(transaction.date));
  const income = currentMonth.filter((transaction) => transaction.type === "INCOME").reduce((sum, item) => sum + item.amount, 0);
  const expense = currentMonth.filter((transaction) => transaction.type === "EXPENSE").reduce((sum, item) => sum + item.amount, 0);
  const categories = Object.entries(
    currentMonth
      .filter((transaction) => transaction.type === "EXPENSE")
      .reduce<Partial<Record<(typeof transactions)[number]["category"], number>>>((totals, transaction) => {
        totals[transaction.category] = (totals[transaction.category] ?? 0) + transaction.amount;
        return totals;
      }, {}),
  ).sort(([, first], [, second]) => second - first);
  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const gradient = categories.reduce<{ stops: string[]; total: number }>(
    (result, [, amount], index) => {
      const end = result.total + (expense > 0 ? (amount / expense) * 100 : 0);
      result.stops.push(`${CHART_COLORS[index % CHART_COLORS.length]} ${result.total.toFixed(2)}% ${end.toFixed(2)}%`);
      return { stops: result.stops, total: end };
    },
    { stops: [], total: 0 },
  ).stops.join(", ");
  const dateLabel = new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  return (
    <>
      <PageHeader
        eyebrow={dateLabel}
        title="Chào Minh Anh 👋"
        subtitle="Một chút tổng kết để bạn luôn chủ động với tiền của mình."
        action={<Link className="button button-primary" href="/giao-dich"><CirclePlus size={17} /> Thêm giao dịch</Link>}
      />
      {error && <DataIssue message={error} onRetry={() => void refresh().catch(() => undefined)} />}
      {loading && transactions.length === 0 ? <LoadingState /> : (
        <>
          <section className="summary-grid" aria-label="Tổng quan tài chính">
            <article className="balance-card">
              <div className="balance-card-top"><span className="balance-label"><Wallet size={16} /> Tổng số dư</span><span className="balance-period">MỌI THỜI ĐIỂM</span></div>
              <p className="balance-value">{formatVND(balance)}</p>
              <div className="balance-bottom"><span>Thu nhập trừ đi chi tiêu</span><span className="balance-decoration">● ● ●</span></div>
              <span className="balance-orb balance-orb-one" /><span className="balance-orb balance-orb-two" />
            </article>
            <article className="stat-card">
              <div className="stat-heading"><span className="stat-icon income-icon"><ArrowDownLeft size={17} /></span><span>Thu nhập tháng này</span></div>
              <p className="stat-value">{formatVND(income)}</p>
              <p className="stat-foot"><span className="positive-dot" /> Tiền vào trong tháng</p>
            </article>
            <article className="stat-card">
              <div className="stat-heading"><span className="stat-icon expense-icon"><ArrowUpRight size={17} /></span><span>Chi tiêu tháng này</span></div>
              <p className="stat-value">{formatVND(expense)}</p>
              <p className="stat-foot"><span className="neutral-dot" /> Tiền ra trong tháng</p>
            </article>
          </section>

          <section className="dashboard-grid">
            <article className="panel expense-panel">
              <div className="panel-heading">
                <div><h2>Tiền đi đâu rồi?</h2><p>Chi tiêu theo danh mục trong tháng</p></div>
                <span className="panel-period">THÁNG NÀY</span>
              </div>
              {categories.length === 0 ? (
                <div className="empty-chart"><span className="empty-chart-icon"><Sparkles size={20} /></span><strong>Chưa có khoản chi nào</strong><span>Giao dịch chi tiêu sẽ hiện ở đây.</span></div>
              ) : (
                <div className="expense-chart-layout">
                  <div className="donut-wrap">
                    <div className="donut-chart" style={{ background: `conic-gradient(${gradient})` }}>
                      <div className="donut-center"><span>TỔNG CHI</span><strong>{formatVND(expense)}</strong></div>
                    </div>
                  </div>
                  <div className="category-list">
                    {categories.map(([category, amount], index) => (
                      <div className="category-row" key={category}>
                        <span className="category-color" style={{ background: CHART_COLORS[index % CHART_COLORS.length] }} />
                        <span className="category-name">{CATEGORY_LABEL[category as keyof typeof CATEGORY_LABEL]}</span>
                        <span className="category-amount">{formatVND(amount)}</span>
                        <span className="category-percent">{expense ? Math.round((amount / expense) * 100) : 0}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>

            <article className="panel goals-panel">
              <div className="panel-heading">
                <div><h2>Điều bạn đang ấp ủ</h2><p>Mục tiêu tiết kiệm của bạn</p></div>
                <Link className="text-link" href="/wishlist">Tất cả <ArrowRight size={15} /></Link>
              </div>
              {wishlist.length === 0 ? (
                <div className="empty-goals"><span className="empty-goal-icon">✳</span><strong>Bắt đầu với một ước mơ</strong><span>Thêm mục tiêu để theo dõi hành trình tiết kiệm.</span><Link href="/wishlist">Tạo mục tiêu <ArrowRight size={14} /></Link></div>
              ) : (
                <div className="goal-list">
                  {wishlist.slice(0, 4).map((wish, index) => {
                    const progress = progressPercent(balance, wish.cost);
                    return (
                      <div className="goal-row" key={wish.id}>
                        <span className={`goal-symbol goal-symbol-${index % 4}`}>{wish.category === "TRAVEL" ? "↗" : wish.category === "TECHNOLOGY" ? "⌘" : wish.category === "HEALTH" ? "♡" : "✳"}</span>
                        <div className="goal-info"><div className="goal-title-row"><strong>{wish.name}</strong><span>{Math.round(progress)}%</span></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><p>{formatVND(wish.cost)} <span>mục tiêu</span></p></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          </section>

          <section className="panel recent-panel">
            <div className="panel-heading">
              <div><h2>Hoạt động gần đây</h2><p>Các khoản thu chi mới nhất của bạn</p></div>
              <Link className="text-link" href="/giao-dich">Xem giao dịch <ArrowRight size={15} /></Link>
            </div>
            {recent.length === 0 ? (
              <div className="empty-table">Chưa có giao dịch. Hãy thêm khoản thu hoặc chi đầu tiên của bạn.</div>
            ) : (
              <div className="recent-list">
                {recent.map((transaction) => (
                  <div className="recent-row" key={transaction.id}>
                    <span className={`transaction-symbol ${transaction.type === "INCOME" ? "transaction-symbol-income" : "transaction-symbol-expense"}`}>
                      {transaction.type === "INCOME" ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}
                    </span>
                    <div className="recent-description"><strong>{transaction.description}</strong><span>{CATEGORY_LABEL[transaction.category]} <i>·</i> {new Date(`${transaction.date}T00:00:00`).toLocaleDateString("vi-VN", { day: "numeric", month: "short" })}</span></div>
                    <strong className={`recent-amount ${transaction.type === "INCOME" ? "amount-income" : ""}`}>{transaction.type === "INCOME" ? "+" : "−"}{formatVND(transaction.amount)}</strong>
                  </div>
                ))}
              </div>
            )}
          </section>

          <footer className="dashboard-footer"><span><Clock3 size={14} /> Dành một phút mỗi tuần để xem lại chi tiêu nhé.</span><Link href="/giao-dich">Quản lý tài chính <ArrowRight size={14} /></Link></footer>
        </>
      )}
    </>
  );
}

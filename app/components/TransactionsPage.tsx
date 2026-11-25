"use client";

import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, CirclePlus, Pencil, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { DataIssue } from "@/components/DataIssue";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { useFinance } from "@/components/FinanceProvider";
import { CATEGORY_LABEL, CATEGORIES, formatVND, isInMonth, localDateInputValue, transactionSchema, type Category, type Transaction, type TxType } from "@/lib/finance";

type TransactionDraft = Omit<Transaction, "id">;

export function TransactionsPage({ initialAdd = false }: { initialAdd?: boolean }) {
  const { transactions, loading, error, refresh, deleteTransaction } = useFinance();
  const [period, setPeriod] = useState("this");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [adding, setAdding] = useState(initialAdd);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => transactions.filter((transaction) => {
    const matchesPeriod = period === "all" || isInMonth(transaction.date, period === "last" ? -1 : 0);
    const matchesType = type === "all" || transaction.type === type;
    const matchesCategory = category === "all" || transaction.category === category;
    return matchesPeriod && matchesType && matchesCategory && transaction.description.toLowerCase().includes(query.toLowerCase().trim());
  }).sort((a, b) => b.date.localeCompare(a.date)), [transactions, period, type, category, query]);

  const totals = filtered.reduce((sum, transaction) => ({
    income: sum.income + (transaction.type === "INCOME" ? transaction.amount : 0),
    expense: sum.expense + (transaction.type === "EXPENSE" ? transaction.amount : 0),
  }), { income: 0, expense: 0 });

  async function remove(transaction: Transaction) {
    if (!window.confirm(`Xoá giao dịch "${transaction.description}"?`)) return;
    setDeletingId(transaction.id);
    try {
      await deleteTransaction(transaction.id);
      toast.success("Đã xoá giao dịch");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Không thể xoá giao dịch.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="SỔ THU CHI"
        title="Giao dịch"
        subtitle="Theo dõi từng khoản thu, chi để hiểu rõ dòng tiền của bạn."
        action={<button className="button button-primary" onClick={() => setAdding(true)} type="button"><CirclePlus size={17} /> Thêm giao dịch</button>}
      />
      {error && <DataIssue message={error} onRetry={() => void refresh().catch(() => undefined)} />}
      <section className="transaction-overview">
        <div><span>Đang hiển thị</span><strong>{filtered.length} <small>giao dịch</small></strong></div>
        <div><span>Tổng thu trong danh sách</span><strong className="amount-income">{formatVND(totals.income)}</strong></div>
        <div><span>Tổng chi trong danh sách</span><strong className="amount-expense">{formatVND(totals.expense)}</strong></div>
      </section>
      <section className="panel transaction-panel">
        <div className="filter-toolbar">
          <label className="search-field"><Search size={16} /><input aria-label="Tìm mô tả giao dịch" placeholder="Tìm giao dịch..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <select aria-label="Lọc theo thời gian" value={period} onChange={(event) => setPeriod(event.target.value)}>
            <option value="this">Tháng này</option><option value="last">Tháng trước</option><option value="all">Tất cả thời gian</option>
          </select>
          <select aria-label="Lọc theo loại" value={type} onChange={(event) => setType(event.target.value)}>
            <option value="all">Thu & chi</option><option value="INCOME">Thu nhập</option><option value="EXPENSE">Chi tiêu</option>
          </select>
          <select aria-label="Lọc theo danh mục" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">Mọi danh mục</option>{CATEGORIES.map((item) => <option value={item} key={item}>{CATEGORY_LABEL[item]}</option>)}
          </select>
        </div>
        {loading && transactions.length === 0 ? <LoadingState /> : filtered.length === 0 ? (
          <div className="empty-table">{transactions.length === 0 ? "Sổ giao dịch đang trống. Thêm khoản thu hoặc chi đầu tiên để bắt đầu." : "Không có giao dịch nào khớp với bộ lọc."}</div>
        ) : (
          <>
            <div className="transaction-table-wrap">
              <table className="transaction-table">
                <thead><tr><th>Giao dịch</th><th>Danh mục</th><th>Ngày</th><th className="align-right">Số tiền</th><th><span className="sr-only">Thao tác</span></th></tr></thead>
                <tbody>{filtered.map((transaction) => (
                  <tr key={transaction.id}>
                    <td><div className="transaction-name"><span className={`transaction-symbol ${transaction.type === "INCOME" ? "transaction-symbol-income" : "transaction-symbol-expense"}`}>{transaction.type === "INCOME" ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}</span><div><strong>{transaction.description}</strong><span>{transaction.type === "INCOME" ? "Thu nhập" : "Chi tiêu"}</span></div></div></td>
                    <td><span className="category-pill">{CATEGORY_LABEL[transaction.category]}</span></td>
                    <td className="date-cell">{new Date(`${transaction.date}T00:00:00`).toLocaleDateString("vi-VN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td className={`align-right transaction-amount ${transaction.type === "INCOME" ? "amount-income" : "amount-expense"}`}>{transaction.type === "INCOME" ? "+" : "−"}{formatVND(transaction.amount)}</td>
                    <td><div className="row-actions"><button type="button" className="icon-button" aria-label={`Sửa ${transaction.description}`} onClick={() => setEditing(transaction)}><Pencil size={15} /></button><button type="button" className="icon-button delete-action" aria-label={`Xoá ${transaction.description}`} disabled={deletingId === transaction.id} onClick={() => void remove(transaction)}><Trash2 size={15} /></button></div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <div className="transaction-cards">{filtered.map((transaction) => (
              <article className="transaction-card" key={transaction.id}>
                <span className={`transaction-symbol ${transaction.type === "INCOME" ? "transaction-symbol-income" : "transaction-symbol-expense"}`}>{transaction.type === "INCOME" ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</span>
                <div className="transaction-card-main"><strong>{transaction.description}</strong><span>{CATEGORY_LABEL[transaction.category]} · {new Date(`${transaction.date}T00:00:00`).toLocaleDateString("vi-VN")}</span></div>
                <div className="transaction-card-side"><strong className={transaction.type === "INCOME" ? "amount-income" : "amount-expense"}>{transaction.type === "INCOME" ? "+" : "−"}{formatVND(transaction.amount)}</strong><span className="row-actions"><button type="button" className="icon-button" aria-label={`Sửa ${transaction.description}`} onClick={() => setEditing(transaction)}><Pencil size={14} /></button><button type="button" className="icon-button delete-action" aria-label={`Xoá ${transaction.description}`} onClick={() => void remove(transaction)}><Trash2 size={14} /></button></span></div>
              </article>
            ))}</div>
          </>
        )}
      </section>
      {(adding || editing) && <TransactionDialog transaction={editing} onClose={() => { setAdding(false); setEditing(null); }} />}
    </>
  );
}

function TransactionDialog({ transaction, onClose }: { transaction: Transaction | null; onClose: () => void }) {
  const { saveTransaction } = useFinance();
  const [type, setType] = useState<TxType>(transaction?.type ?? "EXPENSE");
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : "");
  const [description, setDescription] = useState(transaction?.description ?? "");
  const [category, setCategory] = useState<Category>(transaction?.category ?? "FOOD");
  const [date, setDate] = useState(transaction?.date ?? localDateInputValue());
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = transactionSchema.safeParse({ type, amount, description, category, date });
    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? "Vui lòng kiểm tra lại thông tin.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await saveTransaction(result.data, transaction?.id);
      toast.success(transaction ? "Đã cập nhật giao dịch" : "Đã thêm giao dịch");
      onClose();
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "Không thể lưu giao dịch.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="transaction-dialog-title">
        <div className="modal-heading"><div><p className="eyebrow">SỔ THU CHI</p><h2 id="transaction-dialog-title">{transaction ? "Chỉnh sửa giao dịch" : "Thêm giao dịch"}</h2></div><button className="icon-button" type="button" aria-label="Đóng" onClick={onClose}><X size={19} /></button></div>
        <form className="modal-form" onSubmit={(event) => void submit(event)} noValidate>
          <div className="segmented-control"><button className={type === "EXPENSE" ? "selected" : ""} type="button" onClick={() => setType("EXPENSE")}><ArrowUpRight size={15} /> Chi tiêu</button><button className={type === "INCOME" ? "selected" : ""} type="button" onClick={() => setType("INCOME")}><ArrowDownLeft size={15} /> Thu nhập</button></div>
          <label className="form-field"><span>Số tiền <i>(VND)</i></span><input autoFocus inputMode="numeric" placeholder="Ví dụ: 250000" value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
          <label className="form-field"><span>Mô tả</span><input maxLength={120} placeholder="Ví dụ: Ăn trưa cùng đồng nghiệp" value={description} onChange={(event) => setDescription(event.target.value)} /></label>
          <div className="form-field-row"><label className="form-field"><span>Danh mục</span><select value={category} onChange={(event) => setCategory(event.target.value as Category)}>{CATEGORIES.map((item) => <option value={item} key={item}>{CATEGORY_LABEL[item]}</option>)}</select></label><label className="form-field"><span>Ngày</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label></div>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <div className="modal-actions"><button className="button button-outline" type="button" onClick={onClose}>Huỷ</button><button className="button button-primary" disabled={saving} type="submit">{saving ? "Đang lưu..." : transaction ? "Lưu thay đổi" : "Lưu giao dịch"}</button></div>
        </form>
      </section>
    </div>
  );
}

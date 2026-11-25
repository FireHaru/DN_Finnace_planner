"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, X } from "lucide-react";
import { toast } from "sonner";
import { useFinance } from "@/components/FinanceProvider";
import { CATEGORY_LABEL, CATEGORIES, localDateInputValue, transactionSchema, type Category, type Transaction, type TxType } from "@/lib/finance";

export function TransactionDialog({ transaction, onClose }: { transaction: Transaction | null; onClose: () => void }) {
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

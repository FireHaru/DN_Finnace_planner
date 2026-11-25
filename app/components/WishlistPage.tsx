"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CirclePlus, GraduationCap, Heart, House, Laptop, Pencil, Plane, Shirt, Sparkles, Trash2, Utensils, X } from "lucide-react";
import { toast } from "sonner";
import { DataIssue } from "@/components/DataIssue";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { useFinance } from "@/components/FinanceProvider";
import { balanceOf, formatVND, PRIORITY_LABEL, progressPercent, WISH_CATEGORIES, WISH_CATEGORY_LABEL, wishlistSchema, type Priority, type WishCategory, type WishlistItem } from "@/lib/finance";

const CATEGORY_ICONS = {
  FOOD: Utensils,
  TRAVEL: Plane,
  HOUSEHOLD: House,
  TECHNOLOGY: Laptop,
  FASHION: Shirt,
  HEALTH: Heart,
  EDUCATION: GraduationCap,
  ENTERTAINMENT: Sparkles,
  OTHER: Sparkles,
} satisfies Record<WishCategory, typeof Utensils>;

const FILTERS: Array<"all" | WishCategory> = ["all", ...WISH_CATEGORIES];

export function WishlistPage() {
  const { transactions, wishlist, loading, error, refresh, deleteWish } = useFinance();
  const [category, setCategory] = useState<"all" | WishCategory>("all");
  const [editing, setEditing] = useState<WishlistItem | null>(null);
  const [adding, setAdding] = useState(false);
  const balance = balanceOf(transactions);
  const filtered = useMemo(() => wishlist.filter((wish) => category === "all" || wish.category === category), [wishlist, category]);
  const totals = wishlist.reduce((sum, wish) => sum + wish.cost, 0);
  const savedGoals = wishlist.filter((wish) => progressPercent(balance, wish.cost) >= 100).length;

  async function remove(wish: WishlistItem) {
    if (!window.confirm(`Xoá "${wish.name}" khỏi danh sách mục tiêu?`)) return;
    try {
      await deleteWish(wish.id);
      toast.success("Đã xoá mục tiêu");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Không thể xoá mục tiêu.");
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="NHỮNG ĐIỀU ĐANG CHỜ BẠN"
        title="Mục tiêu của mình"
        subtitle="Đặt điều bạn mong muốn, rồi từng bước biến nó thành hiện thực."
        action={<button className="button button-primary" type="button" onClick={() => setAdding(true)}><CirclePlus size={17} /> Thêm mục tiêu</button>}
      />
      {error && <DataIssue message={error} onRetry={() => void refresh().catch(() => undefined)} />}
      <section className="wishlist-overview">
        <div className="wishlist-overview-mark"><Sparkles size={23} /></div>
        <div className="wishlist-overview-copy"><span>ĐÃ LÊN KẾ HOẠCH</span><strong>{wishlist.length} <small>mục tiêu</small></strong></div>
        <div className="wishlist-overview-divider" />
        <div className="wishlist-overview-copy"><span>TỔNG GIÁ TRỊ ƯỚC MƠ</span><strong>{formatVND(totals)}</strong></div>
        <div className="wishlist-overview-spacer" />
        <div className="wish-progress-summary"><span><Heart size={15} /> {savedGoals} mục tiêu đã đủ tiền</span><span>Số dư hiện tại: <strong>{formatVND(balance)}</strong></span></div>
      </section>
      <div className="wish-filters" role="group" aria-label="Lọc mục tiêu theo danh mục">
        {FILTERS.map((item) => {
          const count = item === "all" ? wishlist.length : wishlist.filter((wish) => wish.category === item).length;
          return <button className={`wish-filter ${category === item ? "selected" : ""}`} type="button" key={item} onClick={() => setCategory(item)} aria-pressed={category === item}>{item === "all" ? "Tất cả" : WISH_CATEGORY_LABEL[item]} <span>{count}</span></button>;
        })}
      </div>
      {loading && wishlist.length === 0 ? <LoadingState /> : filtered.length === 0 ? (
        <div className="wishlist-empty"><span className="wishlist-empty-star">✳</span><h2>{wishlist.length === 0 ? "Điều gì khiến bạn háo hức?" : "Chưa có mục tiêu trong danh mục này"}</h2><p>{wishlist.length === 0 ? "Thêm một điều bạn đang mong chờ. Hành trình bắt đầu từ đây." : "Thử một danh mục khác hoặc tạo mục tiêu mới."}</p>{wishlist.length === 0 && <button className="button button-primary" onClick={() => setAdding(true)} type="button"><CirclePlus size={16} /> Tạo mục tiêu đầu tiên</button>}</div>
      ) : (
        <section className="wishlist-grid">
          {filtered.map((wish, index) => {
            const progress = progressPercent(balance, wish.cost);
            const Icon = CATEGORY_ICONS[wish.category];
            return (
              <article className="wish-card" key={wish.id}>
                <div className={`wish-card-art wish-art-${index % 5}`}><span className="wish-card-icon"><Icon size={20} strokeWidth={1.8} /></span><span className={`priority-badge priority-${wish.priority.toLowerCase()}`}>{PRIORITY_LABEL[wish.priority]}</span><span className="art-sparkle">✳</span></div>
                <div className="wish-card-content">
                  <span className="wish-card-category">{WISH_CATEGORY_LABEL[wish.category]}</span>
                  <h2>{wish.name}</h2>
                  <strong className="wish-price">{formatVND(wish.cost)}</strong>
                  <div className="wish-progress-heading"><span>Hành trình tiết kiệm</span><strong>{Math.round(progress)}%</strong></div>
                  <div className="progress-track wish-progress-track"><span style={{ width: `${progress}%` }} /></div>
                  <div className="wish-card-footer"><span>{progress >= 100 ? "Bạn đã sẵn sàng rồi! 🎉" : `${formatVND(Math.max(wish.cost - Math.max(balance, 0), 0))} còn lại`}</span><div><button className="icon-button" type="button" aria-label={`Sửa ${wish.name}`} onClick={() => setEditing(wish)}><Pencil size={15} /></button><button className="icon-button delete-action" type="button" aria-label={`Xoá ${wish.name}`} onClick={() => void remove(wish)}><Trash2 size={15} /></button></div></div>
                </div>
              </article>
            );
          })}
          <button className="wish-add-card" type="button" onClick={() => setAdding(true)}><span><CirclePlus size={20} /></span><strong>Thêm một ước mơ</strong><small>Điều gì tiếp theo bạn muốn đạt được?</small><span className="wish-add-arrow"><ArrowRight size={17} /></span></button>
        </section>
      )}
      {(adding || editing) && <WishDialog wish={editing} onClose={() => { setAdding(false); setEditing(null); }} />}
    </>
  );
}

function WishDialog({ wish, onClose }: { wish: WishlistItem | null; onClose: () => void }) {
  const { saveWish } = useFinance();
  const [name, setName] = useState(wish?.name ?? "");
  const [cost, setCost] = useState(wish ? String(wish.cost) : "");
  const [category, setCategory] = useState<WishCategory>(wish?.category ?? "TRAVEL");
  const [priority, setPriority] = useState<Priority>(wish?.priority ?? "MEDIUM");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = wishlistSchema.safeParse({ name, cost, category, priority });
    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? "Vui lòng kiểm tra lại thông tin.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await saveWish(result.data, wish?.id);
      toast.success(wish ? "Đã cập nhật mục tiêu" : "Đã thêm mục tiêu");
      onClose();
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "Không thể lưu mục tiêu.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="wish-dialog-title">
        <div className="modal-heading"><div><p className="eyebrow">KẾ HOẠCH TƯƠNG LAI</p><h2 id="wish-dialog-title">{wish ? "Chỉnh sửa mục tiêu" : "Thêm mục tiêu mới"}</h2></div><button className="icon-button" type="button" aria-label="Đóng" onClick={onClose}><X size={19} /></button></div>
        <form className="modal-form" onSubmit={(event) => void submit(event)} noValidate>
          <label className="form-field"><span>Tên mục tiêu</span><input autoFocus maxLength={80} placeholder="Ví dụ: Chuyến đi Đà Lạt" value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label className="form-field"><span>Chi phí dự kiến <i>(VND)</i></span><input inputMode="numeric" placeholder="Ví dụ: 12000000" value={cost} onChange={(event) => setCost(event.target.value)} /></label>
          <div className="form-field-row"><label className="form-field"><span>Danh mục</span><select value={category} onChange={(event) => setCategory(event.target.value as WishCategory)}>{WISH_CATEGORIES.map((item) => <option value={item} key={item}>{WISH_CATEGORY_LABEL[item]}</option>)}</select></label><label className="form-field"><span>Mức ưu tiên</span><select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}><option value="HIGH">Ưu tiên cao</option><option value="MEDIUM">Ưu tiên vừa</option><option value="LOW">Ưu tiên thấp</option></select></label></div>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <div className="modal-actions"><button className="button button-outline" type="button" onClick={onClose}>Huỷ</button><button className="button button-primary" disabled={saving} type="submit">{saving ? "Đang lưu..." : wish ? "Lưu thay đổi" : "Lưu mục tiêu"}</button></div>
        </form>
      </section>
    </div>
  );
}

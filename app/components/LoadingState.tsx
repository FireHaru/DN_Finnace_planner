export function LoadingState({ label = "Đang tải dữ liệu..." }: { label?: string }) {
  return <div className="loading-state"><span className="spinner" />{label}</div>;
}

"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

export function DataIssue({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="data-issue" role="alert">
      <AlertCircle size={19} />
      <div><strong>Chưa thể kết nối dữ liệu</strong><p>{message}</p></div>
      <button type="button" className="button button-outline button-small" onClick={onRetry}><RefreshCw size={15} /> Thử lại</button>
    </div>
  );
}

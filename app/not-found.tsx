import Link from "next/link";
import { ArrowLeft, Leaf } from "lucide-react";

export default function NotFound() {
  return (
    <section className="not-found">
      <span className="not-found-mark"><Leaf size={27} /></span>
      <h1>Trang này đi lạc mất rồi</h1>
      <p>Đường dẫn bạn tìm không tồn tại. Mình đưa bạn trở lại trang tổng quan nhé.</p>
      <Link className="button button-primary" href="/"><ArrowLeft size={15} /> Về tổng quan</Link>
    </section>
  );
}

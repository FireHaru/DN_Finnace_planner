# Mầm Finance Planner

Ứng dụng theo dõi thu chi và mục tiêu tiết kiệm, xây dựng bằng Next.js App Router, React, TypeScript và Neon Postgres. Giao diện hỗ trợ desktop, tablet và điện thoại.

## Vercel-Managed Neon database

Database của ứng dụng được tạo qua Vercel-Managed Neon integration. Vercel quản lý kết nối và billing; database bên dưới là Neon Postgres, nên schema SQL và driver Neon hiện tại vẫn được dùng.

1. Tạo hoặc mở project trên Vercel, sau đó cài [Neon Postgres integration](https://vercel.com/marketplace/neon). Chọn **Create New Neon Account** nếu muốn Vercel quản lý tài nguyên Neon.
2. Kết nối database với project Vercel và chọn môi trường cần dùng (`Development`, `Preview`, `Production`). Integration sẽ thêm `DATABASE_URL` vào môi trường đã chọn.
3. Mở database trong Neon Console, chọn đúng branch, vào **SQL Editor**, dán toàn bộ [`db/schema.sql`](./db/schema.sql) rồi chạy. Schema này tạo bảng đăng nhập và liên kết dữ liệu tài chính; nếu đang có dữ liệu cũ, nó sẽ được giữ lại cho tài khoản đầu tiên đăng ký sau khi schema được cập nhật.
4. Khi chạy local, sao chép `.env.example` thành `.env` rồi thay placeholder `DATABASE_URL` bằng connection string Neon:

   ```powershell
   Copy-Item .env.example .env
   ```

   Thay placeholder trong `.env` bằng connection string Neon. Tạo secret bằng lệnh dưới đây, rồi đặt **chuỗi được in ra** làm giá trị `BETTER_AUTH_SECRET` trong `.env.local` (không nhập nguyên văn placeholder):

   ```sh
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```

   Thêm URL local vào `.env.local`:

   ```env
   BETTER_AUTH_URL=http://localhost:3000
   ```

   File `.env` đã được Git ignore; không đặt connection string hoặc secret thật trong `.env.example` hay biến `NEXT_PUBLIC_*`.

5. Cài dependencies và chạy:

   ```sh
   npm install
   npm run dev
   ```

Để deploy, import repository này vào Vercel, kết nối Neon integration với project và cấu hình `DATABASE_URL`, `BETTER_AUTH_SECRET` (secret ngẫu nhiên tối thiểu 32 ký tự) cùng `BETTER_AUTH_URL` (URL gốc của production) trong **Project Settings → Environment Variables**. Preview deployments tự dùng URL preview của Vercel. Sau khi thay đổi environment variables, deploy lại project.

## Lệnh hữu ích

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

## Dữ liệu và API

Ứng dụng hỗ trợ đăng ký, đăng nhập và đăng xuất bằng email/mật khẩu. Mỗi API kiểm tra phiên đăng nhập và chỉ đọc/ghi giao dịch, mục tiêu và khoản góp quỹ của đúng tài khoản đó. Giao dịch và mục tiêu được lưu trong Neon Postgres; tiền chuyển vào quỹ trừ khỏi số dư khả dụng nhưng không tính là chi tiêu.

**Lưu ý:** chạy `db/schema.sql` trước khi đăng ký tài khoản đầu tiên. Dữ liệu cũ chưa gán người dùng sẽ được gán tự động cho tài khoản đầu tiên; các tài khoản đăng ký sau chỉ thấy dữ liệu riêng. Chưa cấu hình email gửi đi, vì vậy xác minh email và đặt lại mật khẩu qua email hiện chưa được bật.

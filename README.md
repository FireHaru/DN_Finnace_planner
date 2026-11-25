# Mầm Finance Planner

Ứng dụng theo dõi thu chi và mục tiêu tiết kiệm, xây dựng bằng Next.js App Router, React, TypeScript và Neon Postgres. Giao diện hỗ trợ desktop, tablet và điện thoại.

## Vercel-Managed Neon database

Database của ứng dụng được tạo qua Vercel-Managed Neon integration. Vercel quản lý kết nối và billing; database bên dưới là Neon Postgres, nên schema SQL và driver Neon hiện tại vẫn được dùng.

1. Tạo hoặc mở project trên Vercel, sau đó cài [Neon Postgres integration](https://vercel.com/marketplace/neon). Chọn **Create New Neon Account** nếu muốn Vercel quản lý tài nguyên Neon.
2. Kết nối database với project Vercel và chọn môi trường cần dùng (`Development`, `Preview`, `Production`). Integration sẽ thêm `DATABASE_URL` vào môi trường đã chọn.
3. Mở database trong Neon Console, chọn đúng branch, vào **SQL Editor**, dán nội dung từ [`db/schema.sql`](./db/schema.sql) rồi chạy để tạo bảng.
4. Khi chạy local, sao chép `.env.example` thành `.env` rồi thay placeholder `DATABASE_URL` bằng connection string Neon:

   ```powershell
   Copy-Item .env.example .env
   ```

   Thay placeholder trong `.env` bằng connection string Neon. File `.env` đã được Git ignore; không đặt connection string thật trong `.env.example` hoặc biến `NEXT_PUBLIC_*`.

5. Cài dependencies và chạy:

   ```sh
   npm install
   npm run dev
   ```

Để deploy, import repository này vào Vercel, kết nối Neon integration với project và bảo đảm `DATABASE_URL` được gán cho môi trường Production. Sau khi thay đổi environment variables, deploy lại project.

## Lệnh hữu ích

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

## Dữ liệu và API

Giao dịch và mục tiêu được lưu trong Neon Postgres. Các API route `/api/transactions` và `/api/wishlist` hỗ trợ đọc, thêm, cập nhật và xoá dữ liệu bằng Neon serverless driver qua HTTP.

Ứng dụng hiện dành cho một người dùng trên một database riêng, chưa có đăng nhập hoặc phân quyền. Không dùng chung database công khai giữa nhiều người dùng.

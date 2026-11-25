# Mầm Finance Planner

Ứng dụng theo dõi thu chi và mục tiêu tiết kiệm, xây dựng bằng Next.js App Router, React, TypeScript và Neon Postgres. Giao diện hỗ trợ desktop, tablet và điện thoại.

## Neon Postgres trên Vercel

1. Kết nối database với Vercel bằng [Vercel-Managed Neon](https://neon.com/docs/guides/vercel-managed-integration) nếu tạo Neon qua Vercel, hoặc [Neon-Managed integration](https://neon.com/docs/guides/neon-managed-vercel-integration) nếu đã có tài khoản Neon. Chọn project và môi trường (`Development`, `Preview`, `Production`) cần dùng.
2. Trong Neon Console, chọn đúng database/branch, mở **SQL Editor**, dán nội dung từ [`db/schema.sql`](./db/schema.sql) rồi chạy để tạo bảng.
3. Integration thêm `DATABASE_URL` vào Vercel. Dùng connection string pooled do Neon cấp; giữ biến này ở server, không đổi thành `NEXT_PUBLIC_DATABASE_URL`.
4. Để chạy local, sao chép `.env.example` thành `.env` rồi thay `DATABASE_URL` bằng connection string trong Neon Console:

   ```powershell
   Copy-Item .env.example .env
   ```

   Thay placeholder trong `.env` bằng connection string Neon. File `.env` đã được Git ignore; không đặt connection string thật trong `.env.example` hoặc biến `NEXT_PUBLIC_*`.

5. Cài dependencies và chạy:

   ```sh
   npm install
   npm run dev
   ```

Để deploy, import repository vào Vercel, kết nối Neon và bảo đảm `DATABASE_URL` được gán cho môi trường deploy. Sau khi đổi environment variables, deploy lại project. Có thể dùng [kết nối thủ công](https://neon.com/docs/guides/vercel-manual) nếu không cài integration.

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

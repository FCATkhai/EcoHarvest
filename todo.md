# Project Todo

## hot-fix
- [ ] tên sản phẩm trong lô không get được khi quá 10 sản phẩm
- [ ] filter theo category và subcategory bị lỗi

## Chức năng chính

- [ ] regenerate schema
- [ ] cài đặt chức năng embedding
- [ ] cài đặt chức năng chatbot
- [ ] cài đặt chức năng thanh toán
- [ ] thêm tính năng review
- [ ] thêm chức năng báo cáo
- [ ] narrow các response trả về từ backend
- [ ] chỉnh sửa response trả về sao cho nhất quán
- [ ] sửa route backend lại cho hợp lý (order, payment)
- [ ] fix type trong schema frontend cho chính xác (field ?, null)

## backend

- [ ] chuyển sang dùng multer để upload ảnh, file
- [ ] update policy trong storages, tables
- [ ] mở rộng ownership guard, hiện tại chỉ hoạt động với những route có userId trong query hoặc params
- [ ] consider thêm isChecked vào cart item để chuyển route checkout mượt hơn, F5 không bị mất
- [ ] xoá item trong cart sau khi tạo order

## frontend

- [ ] fix navigate admin đăng nhập
- [ ] add guard handle: not found
- [ ] update cập nhật UI khi sửa đổi batch thì giá tiền của import receipt chưa được cập nhật trên frontend
- [ ] thêm slug url cho trang chi tiết sản phẩm

## chat

- [ ] thêm tool response vào metadata để có lịch sử dùng tool

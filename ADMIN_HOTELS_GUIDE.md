# Hướng dẫn sử dụng trang Quản lý Khách sạn

## 📍 Đường dẫn
`/admin/hotels`

## ✨ Tính năng chính

### 1. **Xem danh sách khách sạn**
- Hiển thị dạng bảng với đầy đủ thông tin
- Hỗ trợ phân trang
- Hiển thị hình ảnh đầu tiên của mỗi khách sạn
- Hiển thị số lượng ảnh

### 2. **Tìm kiếm khách sạn** 🔍
- Tìm theo tên khách sạn
- Tìm theo địa chỉ
- Tìm theo email
- Tìm theo số điện thoại
- Tìm kiếm real-time (không cần reload)

### 3. **Thêm khách sạn mới** ➕
Các trường thông tin:
- **Tên khách sạn** (bắt buộc)
- **Địa chỉ** (bắt buộc)
- **Mô tả** (tùy chọn, tối đa 1000 ký tự)
- **Số điện thoại** (tùy chọn, 10-11 số)
- **Email** (tùy chọn, phải đúng định dạng)
- **Hình ảnh** (tùy chọn, tối đa 10 ảnh, mỗi ảnh < 5MB)

### 4. **Sửa khách sạn** ✏️
- Click nút "Sửa" trên bảng
- Có thể giữ lại ảnh cũ
- Có thể thêm ảnh mới
- Có thể xóa ảnh cũ
- Cập nhật thông tin

### 5. **Xóa khách sạn** 🗑️
- Click nút "Xóa" trên bảng
- Hiển thị modal xác nhận
- Cảnh báo: Tất cả phòng và dịch vụ liên quan cũng sẽ bị xóa

## 🎯 Tối ưu hiệu suất

### Cache dữ liệu
- API chỉ được gọi **1 lần** khi vào trang
- Tìm kiếm và phân trang xử lý ở **client-side**
- Chỉ gọi API lại khi có thao tác **Thêm/Sửa/Xóa**

### Lợi ích:
- ⚡ Tìm kiếm và chuyển trang gần như tức thì
- 🔽 Giảm tải server
- 💰 Tiết kiệm bandwidth
- ✅ UX tốt hơn (không loading liên tục)

## 📸 Upload ảnh

### Quy định:
- Định dạng: JPG, PNG, GIF, WEBP
- Kích thước: < 5MB/ảnh
- Số lượng: Tối đa 10 ảnh
- Preview trực tiếp trước khi upload

### Khi edit:
- Ảnh cũ được giữ lại mặc định
- Có thể xóa ảnh cũ bằng cách click nút X
- Có thể thêm ảnh mới
- Backend tự động xóa ảnh không còn sử dụng trên S3

## 🔐 Phân quyền
- Chỉ **Admin** mới có quyền truy cập
- Người dùng thường sẽ bị chuyển đến trang `/access-denied`

## 🛠️ Technical Stack

### Frontend:
- React + Ant Design
- Upload component với preview
- Form validation
- Client-side search & pagination

### Backend:
- Node.js + Express
- Multer để xử lý file upload
- AWS S3 để lưu trữ hình ảnh
- Sequelize ORM

## 📝 Lưu ý

1. **Khi xóa khách sạn:**
   - Tất cả phòng thuộc khách sạn đó sẽ bị xóa
   - Tất cả dịch vụ liên quan sẽ bị xóa
   - Không thể hoàn tác

2. **Khi upload ảnh:**
   - Kiểm tra định dạng và kích thước
   - Ảnh sẽ được lưu trên AWS S3
   - URL ảnh được lưu dưới dạng JSON array trong database

3. **Tìm kiếm:**
   - Không phân biệt chữ hoa/thường
   - Tìm kiếm theo từng phần (substring)
   - Tự động reset về trang 1 khi search

## 🚀 Cải tiến trong tương lai

- [ ] Bulk upload khách sạn từ Excel
- [ ] Export danh sách ra Excel
- [ ] Drag & drop để sắp xếp ảnh
- [ ] Crop ảnh trực tiếp trên UI
- [ ] Thống kê số phòng theo khách sạn
- [ ] Filter theo địa phương/khu vực
- [ ] Map view để hiển thị vị trí khách sạn


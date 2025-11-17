# API Khách sạn (Hotel API)

Tài liệu này tổng hợp nhanh các endpoint liên quan đến quản lý khách sạn tại backend Node/Express. Tất cả endpoint đều được mount dưới prefix `https://<BASE_URL>/api`.

- **Base path** cho module khách sạn: `/hotels`
- **Định dạng trả về**: JSON
- **Xác thực**:
  - Các endpoint công khai (GET) không yêu cầu token.
  - Các endpoint quản trị (POST/PUT/DELETE) bắt buộc header `Authorization: Bearer <accessToken>` và tài khoản phải có vai trò `admin`.

---

## 1. Lấy danh sách khách sạn

- **Method/Path**: `GET /api/hotels`
- **Query params**:
  | Tên      | Kiểu | Mô tả |
  |----------|------|-------|
  | `page`   | number (default `1`) | Trang hiện tại. |
  | `limit`  | number (default `10`) | Số bản ghi mỗi trang. |
  | `search` | string | Tìm kiếm theo tên hoặc địa chỉ (LIKE). |
- **Trả về**:
  ```json
  {
    "hotels": [ { ...hotel } ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25
    }
  }
  ```
- **Ghi chú**: Các bản ghi được sắp xếp `created_at DESC`.

---

## 2. Lấy chi tiết khách sạn

- **Method/Path**: `GET /api/hotels/:id`
- **Path param**: `id` (số nguyên).
- **Trả về**:
  ```json
  {
    "hotel": {
      "hotel_id": 1,
      "name": "...",
      "address": "...",
      "description": "...",
      "images": ["https://..."],
      "phone": "...",
      "email": "...",
      "created_at": "...",
      "updated_at": "..."
    }
  }
  ```
- **Lỗi thường gặp**: `404` nếu không tìm thấy khách sạn.

---

## 3. Tạo khách sạn (Admin)

- **Method/Path**: `POST /api/hotels`
- **Yêu cầu**: Header `Authorization`, role `admin`.
- **Content-Type**: `multipart/form-data`
- **Body fields**:
  | Tên trường     | Bắt buộc | Mô tả |
  |----------------|----------|-------|
  | `name`         | ✔ | Tên khách sạn. |
  | `address`      | ✔ | Địa chỉ. |
  | `description`  | ✔ | Mô tả chi tiết. |
  | `phone`        | ✖ | SĐT liên hệ. |
  | `email`        | ✖ | Email liên hệ. |
  | `images`       | ✖ | Tối đa 10 file (≤5MB/file). Key form là `images`. |
- **Trả về**: `201 Created` cùng object `hotel` vừa tạo.
- **Ghi chú**: Ảnh được upload lên S3 thông qua `uploadImages` middleware.

---

## 4. Cập nhật khách sạn (Admin)

- **Method/Path**: `PUT /api/hotels/:id`
- **Yêu cầu**: Header `Authorization`, role `admin`.
- **Content-Type**: `multipart/form-data`
- **Body**: giống tạo mới, có thể gửi một phần. Nếu gửi `images`, toàn bộ ảnh cũ sẽ bị xóa trên S3 và thay bằng danh sách mới.
- **Trả về**: `200 OK` kèm `hotel` đã cập nhật.
- **Lỗi thường gặp**:
  - `404` nếu `id` không tồn tại.
  - `413` nếu file vượt quá 5MB (do cấu hình multer).

---

## 5. Xóa khách sạn (Admin)

- **Method/Path**: `DELETE /api/hotels/:id`
- **Yêu cầu**: Header `Authorization`, role `admin`.
- **Trả về**: `200 OK` với thông báo `"Xóa khách sạn thành công"`.
- **Ghi chú**: Controller cố gắng xóa ảnh chính khỏi S3 (nếu key lấy được từ URL). Các ảnh phụ nằm trong mảng `images` đã được thu dọn khi cập nhật.

---

## Tổng kết

| Endpoint | Mô tả | Bảo vệ |
|----------|-------|--------|
| `GET /api/hotels` | Danh sách + phân trang + search | Không |
| `GET /api/hotels/:id` | Chi tiết khách sạn | Không |
| `POST /api/hotels` | Tạo mới khách sạn + upload ảnh | `admin` |
| `PUT /api/hotels/:id` | Cập nhật thông tin + thay ảnh | `admin` |
| `DELETE /api/hotels/:id` | Xóa khách sạn | `admin` |

Sử dụng tài liệu này cho việc tích hợp FE hoặc Postman khi cần thao tác với dữ liệu khách sạn. Nếu cần thêm ví dụ request/response cụ thể hơn, xem trực tiếp `hotelController.js` trong backend để nắm rõ logic. 


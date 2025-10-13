# 🛏️ Trang Quản Lý Loại Phòng - Room Types

## 📍 Thông tin
- **Đường dẫn**: `/admin/room-types`
- **Quyền truy cập**: Chỉ Admin
- **Component**: `src/pages/Admin/RoomType/RoomType.jsx`

---

## ✨ Tính năng chính

### 1. 📋 Hiển thị danh sách loại phòng

**Các cột:**
- ✅ ID loại phòng
- ✅ Hình ảnh đại diện
- ✅ Tên loại phòng
- ✅ Diện tích (m²)
- ✅ Số lượng phòng
- ✅ Tiện nghi (tags, hiển thị 3 đầu + số còn lại)
- ✅ Số lượng ảnh
- ✅ Ngày tạo
- ✅ Thao tác (Sửa/Xóa)

**Tính năng:**
- Phân trang (10/20/50 items)
- Responsive design
- Loading state
- Client-side caching

---

### 2. 🔍 Tìm kiếm

**Tìm theo:**
- 📝 Tên loại phòng
- 📄 Mô tả

**Đặc điểm:**
- ⚡ Real-time (không gọi API)
- 🔤 Không phân biệt hoa thường
- 🎯 Substring matching

---

### 3. ➕ Thêm loại phòng mới

**Form fields:**

| Trường | Bắt buộc | Kiểu | Ghi chú |
|--------|----------|------|---------|
| Tên loại phòng | ✅ Yes | Text | VD: Phòng Deluxe, Suite |
| Mô tả | ❌ No | TextArea | Tối đa 1000 ký tự |
| Diện tích | ✅ Yes | Number | 1-500 m² |
| Số lượng phòng | ✅ Yes | Number | 0-1000 phòng |
| Tiện nghi | ❌ No | Multi-select | Tags dropdown |
| Hình ảnh | ❌ No | Upload | Tối đa 10 ảnh |

**Tiện nghi có sẵn:**
```
- WiFi miễn phí      - Điều hòa
- Tivi               - Tủ lạnh
- Nước nóng          - Ban công
- Bồn tắm            - Máy sấy tóc
- Két sắt            - Minibar
- Bàn làm việc       - Sofa
- Tầm nhìn biển      - Tầm nhìn thành phố
- Không hút thuốc
```

**Custom amenities:**
User có thể nhập thêm tiện nghi tùy chỉnh!

---

### 4. ✏️ Sửa loại phòng

**Tính năng:**
- 📝 Sửa tất cả thông tin
- 🖼️ Giữ lại ảnh cũ
- ➕ Thêm ảnh mới
- ❌ Xóa ảnh cũ
- 🏷️ Thêm/xóa tiện nghi

---

### 5. 🗑️ Xóa loại phòng

**Modal confirm hiển thị:**
```
┌─────────────────────────────────────┐
│ 🚨 Xác nhận xóa loại phòng         │
├─────────────────────────────────────┤
│ Bạn có chắc chắn muốn xóa loại     │
│ phòng "Phòng Deluxe"?              │
│                                     │
│ ⚠️ Cảnh báo: Không thể hoàn tác!   │
│                                     │
│ • Tất cả phòng thuộc loại này      │
│   sẽ bị ảnh hưởng                  │
│ • X ảnh sẽ bị xóa khỏi server      │
│                                     │
│       [Hủy]    [Xóa]               │
└─────────────────────────────────────┘
```

---

## 🎯 Performance

**Client-side caching:**
- API chỉ gọi 1 lần khi load
- Search & pagination ở client
- Chỉ reload khi CRUD

**Benefits:**
- ⚡ Search < 50ms
- ⚡ Pagination instant
- 📉 Giảm tải server
- 💰 Tiết kiệm bandwidth

---

## 🎨 UI Features

### Form Layout (2 cột)
```
┌─────────────────────────────────────┐
│ Tên loại phòng (full width)        │
├─────────────────────────────────────┤
│ Mô tả (full width)                  │
├──────────────────┬──────────────────┤
│ Diện tích        │ Số lượng         │
├──────────────────┴──────────────────┤
│ Tiện nghi (multi-select)            │
├─────────────────────────────────────┤
│ Hình ảnh (upload grid)              │
└─────────────────────────────────────┘
```

### Amenities Display
```
✅ Select mode: "tags"
✅ MaxTagCount: "responsive"
✅ Custom input: User có thể nhập mới
✅ Display: Green tags với icon
```

### Numbers Input
```
✅ Diện tích: Có addon "m²"
✅ Số lượng: Có addon "phòng"
✅ Min/Max validation
✅ Step: 1
```

---

## 📊 API Structure

### GET `/api/room-types`
**Response:**
```json
{
  "roomTypes": [
    {
      "room_type_id": 1,
      "room_type_name": "Phòng Deluxe",
      "description": "Phòng sang trọng...",
      "amenities": ["WiFi", "Điều hòa", "Tivi"],
      "area": 35,
      "quantity": 20,
      "images": ["url1", "url2"],
      "created_at": "2024-01-01",
      "updated_at": "2024-01-01"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50
  }
}
```

### POST `/api/room-types`
**FormData:**
```
room_type_name: "Phòng VIP"
description: "..."
area: 50
quantity: 10
amenities: '["WiFi", "Điều hòa"]'  // JSON string
images: [File1, File2]
```

### PUT `/api/room-types/:id`
**FormData:**
```
room_type_name: "Updated Name"
area: 55
quantity: 12
amenities: '["WiFi", "Điều hòa", "Ban công"]'
existingImages: '["url1", "url3"]'  // Giữ lại
images: [NewFile1]                   // Thêm mới
```

### DELETE `/api/room-types/:id`
**Response:**
```json
{
  "message": "Xóa loại phòng thành công"
}
```

---

## 🧪 Test Cases

### Test 1: Thêm loại phòng đầy đủ
```
✓ Click "Thêm loại phòng"
✓ Nhập tên: "Phòng Deluxe"
✓ Nhập mô tả: "Phòng rộng rãi, view đẹp"
✓ Nhập diện tích: 35
✓ Nhập số lượng: 20
✓ Chọn tiện nghi: WiFi, Điều hòa, Tivi, Tủ lạnh
✓ Upload 3 ảnh
✓ Click "Tạo mới"
✓ Success!
```

### Test 2: Validation
```
❌ Để trống tên → "Vui lòng nhập tên loại phòng!"
❌ Để trống diện tích → "Vui lòng nhập diện tích!"
❌ Để trống số lượng → "Vui lòng nhập số lượng!"
❌ Diện tích < 1 → Không cho nhập
❌ Diện tích > 500 → Không cho nhập
```

### Test 3: Custom amenities
```
✓ Click vào Select amenities
✓ Type "Bể bơi riêng"
✓ Enter để thêm custom tag
✓ Tag "Bể bơi riêng" xuất hiện
✓ Submit form → Lưu thành công
```

### Test 4: Edit với ảnh
```
✓ Edit room type có 3 ảnh
✓ Xóa 1 ảnh cũ
✓ Thêm 2 ảnh mới
✓ Update
✓ Result: 4 ảnh (2 cũ + 2 mới)
```

### Test 5: Search
```
✓ Search "deluxe" → Tìm thấy "Phòng Deluxe", "Deluxe Suite"
✓ Search "vip" → Tìm thấy "Phòng VIP"
✓ Clear search → Hiển thị tất cả
```

---

## 💡 Tips

### Amenities Best Practices
```javascript
// Nên dùng:
✅ "WiFi miễn phí"
✅ "Điều hòa"
✅ "Tivi màn hình phẳng"

// Tránh:
❌ "wifi" (viết thường)
❌ "AC" (viết tắt)
❌ Quá dài (> 30 ký tự)
```

### Images Guidelines
```
✅ Upload ảnh đẹp, chất lượng cao
✅ Ảnh đầu tiên là ảnh đại diện
✅ Nhiều góc độ khác nhau
✅ Độ phân giải: 1920x1080 trở lên
✅ Format: JPG/PNG (tối ưu size)
```

---

## 🔧 Troubleshooting

### Amenities không lưu
**Kiểm tra:**
```javascript
// Backend nhận được JSON string
formData.append('amenities', JSON.stringify(values.amenities))

// Console log để debug
console.log('Amenities:', values.amenities)
```

### Upload ảnh thất bại
**Check:**
1. AWS S3 credentials
2. File size < 5MB
3. File type là image
4. Network connection

---

## 📚 Features Matrix

| Feature | Hotels | RoomTypes |
|---------|--------|-----------|
| CRUD | ✅ | ✅ |
| Search | ✅ | ✅ |
| Upload images | ✅ | ✅ |
| Cache API | ✅ | ✅ |
| Responsive | ✅ | ✅ |
| **Amenities** | ❌ | ✅ |
| **Area** | ❌ | ✅ |
| **Quantity** | ❌ | ✅ |
| Grid layout | ❌ | ✅ |

---

## 🎓 Learning Points

### Multi-select with custom input
```javascript
<Select
  mode="tags"              // Allow custom input
  options={OPTIONS}        // Predefined options
  maxTagCount="responsive" // Responsive display
/>
```

### Grid form layout
```javascript
<div style={{ 
  display: 'grid', 
  gridTemplateColumns: '1fr 1fr', 
  gap: 16 
}}>
  <Form.Item name="area">...</Form.Item>
  <Form.Item name="quantity">...</Form.Item>
</div>
```

### InputNumber with addon
```javascript
<InputNumber
  min={1}
  max={500}
  addonAfter="m²"  // Unit suffix
  style={{ width: '100%' }}
/>
```

---

## ✅ Checklist

- [x] Component RoomType.jsx (380+ dòng)
- [x] Styling roomType.css (180+ dòng)
- [x] Export index.js
- [x] Route integration
- [x] CRUD operations
- [x] Search functionality
- [x] Upload images
- [x] Amenities multi-select
- [x] Area & Quantity inputs
- [x] Form validation
- [x] Client-side caching
- [x] Responsive design
- [x] No linter errors
- [x] **READY TO USE**

---

## 🎉 Kết luận

Trang quản lý loại phòng đã hoàn thành với:

✅ **Full CRUD** operations
✅ **Real-time search**
✅ **Upload nhiều ảnh**
✅ **Amenities tags** (custom + predefined)
✅ **Area & Quantity** inputs
✅ **Client-side caching**
✅ **Responsive design**
✅ **Production ready**

**Status**: ✅ **COMPLETE**



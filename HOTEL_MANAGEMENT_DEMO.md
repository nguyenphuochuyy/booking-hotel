# 🏨 Demo Trang Quản Lý Khách Sạn

## 🚀 Quick Start

### 1. Chạy Backend
```bash
cd booking-hotel-be
npm run dev
# Server chạy tại: http://localhost:5000
```

### 2. Chạy Frontend
```bash
cd hotel-booking-fe
npm start
# App chạy tại: http://localhost:3000
```

### 3. Đăng nhập Admin
```
URL: http://localhost:3000/login
Email: admin@example.com (hoặc email admin của bạn)
Password: [mật khẩu admin]
```

### 4. Truy cập trang quản lý
```
URL: http://localhost:3000/admin/hotels
```

---

## ✅ Checklist Demo

### ✨ Feature 1: Xem danh sách khách sạn
```
✅ 1. Vào /admin/hotels
✅ 2. Kiểm tra bảng hiển thị đầy đủ cột
✅ 3. Kiểm tra hình ảnh hiển thị
✅ 4. Kiểm tra pagination hoạt động
✅ 5. Thử thay đổi page size (10/20/50)
```

**Expected Result:**
- Bảng hiển thị đầy đủ thông tin
- Hình ảnh load nhanh
- Pagination mượt mà (không loading)

---

### 🔍 Feature 2: Tìm kiếm
```
✅ 1. Nhập tên khách sạn vào ô search
✅ 2. Kết quả hiển thị ngay lập tức
✅ 3. Thử tìm theo địa chỉ
✅ 4. Thử tìm theo email
✅ 5. Clear search → hiển thị tất cả
```

**Test Cases:**
```javascript
// Case 1: Tìm theo tên
"Grand" → Kết quả: "Grand Hotel", "Grand Plaza"

// Case 2: Không phân biệt hoa thường
"HOTEL" → Match: "hotel", "Hotel", "HOTEL"

// Case 3: Tìm theo địa chỉ
"Hanoi" → Kết quả: Các hotel ở Hà Nội

// Case 4: Empty result
"xyzabc" → Hiển thị: "No data"
```

---

### ➕ Feature 3: Thêm khách sạn mới

#### Test Case 1: Thêm khách sạn không có ảnh
```
✅ 1. Click "Thêm khách sạn"
✅ 2. Nhập tên: "Demo Hotel 1"
✅ 3. Nhập địa chỉ: "123 Demo Street"
✅ 4. Nhập mô tả: "This is a demo hotel"
✅ 5. Nhập phone: "0123456789"
✅ 6. Nhập email: "demo@hotel.com"
✅ 7. Click "Tạo mới"
✅ 8. Kiểm tra thông báo success
✅ 9. Kiểm tra khách sạn mới trong danh sách
```

**Expected Result:**
- Modal đóng
- Hiển thị toast "Tạo khách sạn thành công"
- Danh sách tự động reload
- Khách sạn mới xuất hiện ở đầu bảng

#### Test Case 2: Thêm khách sạn có ảnh
```
✅ 1. Click "Thêm khách sạn"
✅ 2. Nhập thông tin như trên
✅ 3. Upload 3 ảnh (< 5MB mỗi ảnh)
✅ 4. Kiểm tra preview ảnh
✅ 5. Click "Tạo mới"
✅ 6. Kiểm tra khách sạn có ảnh
```

**Ảnh test:** Dùng ảnh từ [Lorem Picsum](https://picsum.photos/800/600)

#### Test Case 3: Validation Errors
```
❌ Test 1: Để trống tên
   Expected: "Vui lòng nhập tên khách sạn!"

❌ Test 2: Để trống địa chỉ
   Expected: "Vui lòng nhập địa chỉ!"

❌ Test 3: Email sai format
   Input: "notanemail"
   Expected: "Email không hợp lệ!"

❌ Test 4: Phone sai format
   Input: "123"
   Expected: "Số điện thoại không hợp lệ!"

❌ Test 5: Upload file không phải ảnh
   Input: document.pdf
   Expected: "Chỉ được upload file ảnh!"

❌ Test 6: Upload file > 5MB
   Expected: "Kích thước ảnh phải nhỏ hơn 5MB!"

❌ Test 7: Upload > 10 ảnh
   Expected: Nút upload bị ẩn
```

---

### ✏️ Feature 4: Sửa khách sạn

#### Test Case 1: Sửa text only
```
✅ 1. Click "Sửa" trên hotel vừa tạo
✅ 2. Đổi tên: "Demo Hotel 1 Updated"
✅ 3. Đổi địa chỉ: "456 New Street"
✅ 4. Click "Cập nhật"
✅ 5. Kiểm tra thông báo success
✅ 6. Kiểm tra thông tin đã update
```

#### Test Case 2: Thêm ảnh vào hotel có sẵn
```
✅ 1. Click "Sửa" hotel không có ảnh
✅ 2. Upload 2 ảnh mới
✅ 3. Click "Cập nhật"
✅ 4. Reload trang
✅ 5. Kiểm tra 2 ảnh hiển thị
```

#### Test Case 3: Xóa ảnh cũ
```
✅ 1. Click "Sửa" hotel có 3 ảnh
✅ 2. Click X để xóa ảnh thứ 2
✅ 3. Click "Cập nhật"
✅ 4. Reload trang
✅ 5. Kiểm tra chỉ còn 2 ảnh
```

**Backend check:**
```bash
# Kiểm tra ảnh đã bị xóa khỏi S3
# Vào AWS S3 Console → Bucket → Check files
```

#### Test Case 4: Xóa ảnh cũ + Thêm ảnh mới
```
✅ 1. Click "Sửa" hotel có 2 ảnh
✅ 2. Xóa 1 ảnh cũ
✅ 3. Upload 3 ảnh mới
✅ 4. Click "Cập nhật"
✅ 5. Kiểm tra tổng 4 ảnh (1 cũ + 3 mới)
```

---

### 🗑️ Feature 5: Xóa khách sạn

#### Test Case 1: Xóa với confirm
```
✅ 1. Click "Xóa" trên hotel demo
✅ 2. Kiểm tra modal confirm hiển thị
✅ 3. Đọc message cảnh báo
✅ 4. Click "Xóa"
✅ 5. Kiểm tra thông báo success
✅ 6. Kiểm tra hotel biến mất khỏi danh sách
```

#### Test Case 2: Cancel delete
```
✅ 1. Click "Xóa"
✅ 2. Click "Hủy"
✅ 3. Kiểm tra modal đóng
✅ 4. Kiểm tra hotel vẫn còn
```

---

## 🎯 Performance Testing

### Test 1: Client-side search performance
```javascript
// 1. Tạo 50 hotels trong DB
// 2. Vào trang /admin/hotels
// 3. Mở DevTools → Network tab
// 4. Type vào search box

✅ Expected: 
- Không có API call nào
- Kết quả hiển thị ngay lập tức
- Smooth animation
```

### Test 2: Pagination performance
```javascript
// 1. Có 50 hotels trong DB
// 2. Chuyển qua trang 2, 3, 4, 5
// 3. Check Network tab

✅ Expected:
- Không có API call nào
- Chuyển trang không có delay
- Loading state không hiển thị
```

### Test 3: Initial load performance
```javascript
// 1. Clear cache
// 2. Hard reload trang
// 3. Check Network tab

✅ Expected:
- 1 API call duy nhất: GET /api/hotels
- Loading state hiển thị
- Sau đó hiển thị data
```

---

## 🐛 Error Handling Tests

### Test 1: Backend offline
```
✅ 1. Stop backend server
✅ 2. Reload trang
✅ 3. Kiểm tra error message hiển thị
✅ 4. Start backend lại
✅ 5. Reload → hoạt động bình thường
```

### Test 2: Invalid token
```
✅ 1. Xóa token trong localStorage
✅ 2. Reload trang
✅ 3. Kiểm tra redirect về /login
```

### Test 3: Network error khi upload
```
✅ 1. Disconnect internet
✅ 2. Thử thêm hotel với ảnh
✅ 3. Kiểm tra error message
✅ 4. Reconnect internet
✅ 5. Thử lại → Success
```

---

## 📊 Test Data

### Sample Hotels
```javascript
// Hotel 1
{
  name: "Grand Plaza Hotel",
  address: "123 Nguyen Hue, District 1, Ho Chi Minh City",
  description: "Luxury 5-star hotel in the heart of the city",
  phone: "0283123456",
  email: "info@grandplaza.com",
  images: 5 ảnh
}

// Hotel 2
{
  name: "Hanoi Boutique Hotel",
  address: "456 Hoan Kiem, Hanoi",
  description: "Cozy boutique hotel near Old Quarter",
  phone: "0243456789",
  email: "contact@hanoiboutique.com",
  images: 3 ảnh
}

// Hotel 3
{
  name: "Da Nang Beach Resort",
  address: "789 Vo Nguyen Giap, Da Nang",
  description: "Beachfront resort with ocean views",
  phone: "0236789012",
  email: "booking@danangresort.com",
  images: 10 ảnh (max)
}

// Hotel 4
{
  name: "Budget Inn Saigon",
  address: "321 Pham Ngu Lao, District 1",
  description: "Affordable accommodation for backpackers",
  phone: "0283987654",
  email: "budgetinn@example.com",
  images: 0 ảnh
}
```

---

## 📸 Screenshot Checklist

```
📷 1. Danh sách đầy đủ
📷 2. Modal thêm mới
📷 3. Modal sửa với ảnh
📷 4. Modal xác nhận xóa
📷 5. Search có kết quả
📷 6. Empty state (no data)
📷 7. Loading state
📷 8. Error state
📷 9. Success notification
📷 10. Mobile responsive view
```

---

## 🎥 Video Demo Script

```
0:00 - Intro
0:10 - Login admin
0:20 - Vào trang hotels
0:30 - Xem danh sách
0:45 - Tìm kiếm
1:00 - Thêm khách sạn mới (có ảnh)
1:45 - Xem khách sạn vừa tạo
2:00 - Sửa thông tin
2:30 - Thêm ảnh mới
2:45 - Xóa ảnh cũ
3:00 - Update thành công
3:15 - Xóa khách sạn
3:30 - Confirm delete
3:40 - Success
3:50 - Outro
```

---

## 🔧 Debug Tips

### Check API Response
```javascript
// Trong DevTools Console
const fetchHotels = async () => {
  const response = await fetch('http://localhost:5000/api/hotels', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
  const data = await response.json()
  console.log('Hotels:', data)
}
fetchHotels()
```

### Check State
```javascript
// Thêm vào component
useEffect(() => {
  console.log('All Hotels:', allHotels)
  console.log('Filtered:', filteredHotels)
  console.log('Search:', searchText)
}, [allHotels, filteredHotels, searchText])
```

### Check Upload
```javascript
// Trong handleModalOk
console.log('FormData entries:')
for (let [key, value] of formData.entries()) {
  console.log(key, value)
}
```

---

## ✅ Final Checklist

```
✅ Backend running
✅ Frontend running
✅ Database connected
✅ AWS S3 configured
✅ Admin user created
✅ Can login as admin
✅ Can access /admin/hotels
✅ Can view list
✅ Can search
✅ Can add hotel
✅ Can upload images
✅ Can edit hotel
✅ Can delete images
✅ Can add new images
✅ Can delete hotel
✅ Performance is good
✅ Error handling works
✅ Responsive design works
```

---

## 🎉 Success Criteria

Trang quản lý khách sạn được coi là **hoàn thành** khi:

1. ✅ Tất cả CRUD operations hoạt động
2. ✅ Upload/Delete images hoạt động trên S3
3. ✅ Search real-time không gọi API
4. ✅ Pagination mượt mà
5. ✅ Error handling đầy đủ
6. ✅ Responsive trên mobile
7. ✅ Loading states hiển thị đúng
8. ✅ Validation hoạt động
9. ✅ Thông báo rõ ràng
10. ✅ Performance tốt (< 2s load)

---

**Chúc bạn demo thành công!** 🚀


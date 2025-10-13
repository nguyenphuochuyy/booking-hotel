# 🏨 Trang Quản Lý Khách Sạn - Admin

## 📍 Thông tin
- **Đường dẫn**: `/admin/hotels`
- **Quyền truy cập**: Chỉ Admin
- **Component**: `src/pages/Admin/Hotel/Hotel.jsx`

---

## ✨ Tính năng chính

### 1. 📋 Hiển thị danh sách khách sạn

**Các cột hiển thị:**
- ✅ ID khách sạn
- ✅ Hình ảnh đại diện (ảnh đầu tiên)
- ✅ Tên khách sạn
- ✅ Địa chỉ
- ✅ Số điện thoại
- ✅ Email
- ✅ Số lượng ảnh
- ✅ Ngày tạo
- ✅ Thao tác (Sửa/Xóa)

**Tính năng bảng:**
- Phân trang (10/20/50 items per page)
- Responsive design
- Loading state
- Empty state khi chưa có dữ liệu

---

### 2. 🔍 Tìm kiếm khách sạn

**Tìm kiếm theo:**
- 📝 Tên khách sạn
- 📍 Địa chỉ
- 📧 Email
- 📞 Số điện thoại

**Đặc điểm:**
- ⚡ Real-time search (không cần reload)
- 🔤 Không phân biệt chữ hoa/thường
- 🎯 Tìm theo từng phần (substring)
- 🔄 Tự động reset về trang 1

**Ví dụ:**
```javascript
// Tìm "hanoi" sẽ match:
✅ "Khách sạn Hà Nội"
✅ "hanoi hotel"
✅ "HANOI Plaza"
```

---

### 3. ➕ Thêm khách sạn mới

**Click nút "Thêm khách sạn"** → Mở modal

**Form nhập liệu:**

| Trường | Bắt buộc | Kiểu | Ghi chú |
|--------|----------|------|---------|
| Tên khách sạn | ✅ Yes | Text | Tên đầy đủ |
| Địa chỉ | ✅ Yes | Text | Địa chỉ chi tiết |
| Mô tả | ❌ No | TextArea | Tối đa 1000 ký tự |
| Số điện thoại | ❌ No | Text | 10-11 số |
| Email | ❌ No | Email | Định dạng email hợp lệ |
| Hình ảnh | ❌ No | Upload | Tối đa 10 ảnh |

**Validation:**
```javascript
✅ Tên khách sạn: Không được để trống
✅ Địa chỉ: Không được để trống
✅ Email: Phải đúng định dạng (nếu nhập)
✅ Số điện thoại: Phải 10-11 số (nếu nhập)
✅ Mô tả: Tối đa 1000 ký tự
```

**Quy định upload ảnh:**
- 📸 Định dạng: JPG, PNG, GIF, WEBP
- 📦 Kích thước: < 5MB/ảnh
- 🔢 Số lượng: Tối đa 10 ảnh
- 👁️ Preview trực tiếp

**Flow:**
```mermaid
1. Nhập thông tin → 2. Upload ảnh (optional) → 3. Click "Tạo mới"
   ↓
4. Validate form → 5. Gọi API createHotel → 6. Upload lên S3
   ↓
7. Lưu vào DB → 8. Hiển thị thông báo → 9. Reload danh sách
```

---

### 4. ✏️ Sửa khách sạn

**Click nút "Sửa"** trên bảng → Mở modal với dữ liệu có sẵn

**Tính năng đặc biệt:**
- 🖼️ **Giữ lại ảnh cũ**: Ảnh hiện tại được hiển thị
- ➕ **Thêm ảnh mới**: Upload thêm ảnh mới
- ❌ **Xóa ảnh cũ**: Click nút X để xóa
- 💾 **Backend tự động**: Xóa ảnh không dùng trên S3

**Workflow Update Images:**
```javascript
// Ảnh ban đầu: [img1.jpg, img2.jpg, img3.jpg]

// User actions:
- Giữ: img1.jpg, img3.jpg
- Xóa: img2.jpg
- Thêm mới: img4.jpg, img5.jpg

// Kết quả cuối: [img1.jpg, img3.jpg, img4.jpg, img5.jpg]
// Backend tự động xóa img2.jpg khỏi S3
```

**Code logic:**
```javascript
// Frontend gửi:
FormData {
  name: "Hotel ABC",
  address: "123 Street",
  existingImages: JSON.stringify(["url1", "url3"]), // Ảnh giữ lại
  images: [File1, File2] // Ảnh mới
}

// Backend xử lý:
1. Parse existingImages
2. Xóa ảnh không còn trong existingImages
3. Upload ảnh mới
4. Merge: [...existingImages, ...newImages]
```

---

### 5. 🗑️ Xóa khách sạn

**Click nút "Xóa"** → Hiển thị modal xác nhận

**Cảnh báo:**
```
⚠️ Bạn có chắc chắn muốn xóa khách sạn "Tên khách sạn"?
⚠️ Tất cả phòng và dịch vụ liên quan cũng sẽ bị xóa.
```

**Hành động:**
- ❌ **Xóa**: Xóa vĩnh viễn (không thể hoàn tác)
- 🔙 **Hủy**: Đóng modal, không làm gì

**Backend cascade delete:**
```javascript
DELETE Hotel
  ↓
  ├─ DELETE Rooms (thuộc hotel)
  ├─ DELETE Services (thuộc hotel)
  └─ DELETE Images (từ S3)
```

---

## 🎯 Tối ưu hiệu suất

### Client-Side Caching

```javascript
const [allHotels, setAllHotels] = useState([])       // Cache toàn bộ
const [filteredHotels, setFilteredHotels] = useState([]) // Sau khi filter
```

**Lợi ích:**
- ⚡ **Search tức thì**: Không chờ API
- ⚡ **Pagination mượt mà**: Chuyển trang không loading
- 📉 **Giảm tải server**: Ít request hơn
- 💰 **Tiết kiệm bandwidth**: Chỉ load 1 lần

**Khi nào gọi API:**
1. ✅ Component mount (lần đầu)
2. ✅ Thêm khách sạn mới
3. ✅ Sửa khách sạn
4. ✅ Xóa khách sạn

**Khi nào KHÔNG gọi API:**
- ❌ Search
- ❌ Thay đổi page
- ❌ Thay đổi page size

---

## 🛠️ Cấu trúc Code

### State Management
```javascript
const [loading, setLoading] = useState(false)
const [allHotels, setAllHotels] = useState([])
const [filteredHotels, setFilteredHotels] = useState([])
const [searchText, setSearchText] = useState('')
const [isModalVisible, setIsModalVisible] = useState(false)
const [editingHotel, setEditingHotel] = useState(null)
const [fileList, setFileList] = useState([])
const [pagination, setPagination] = useState({
  current: 1,
  pageSize: 10,
  total: 0,
})
const [form] = Form.useForm()
```

### Key Functions
```javascript
fetchHotels()           // Lấy danh sách từ API
handleSearch(value)     // Xử lý tìm kiếm
handleAddNew()          // Mở modal thêm mới
handleEdit(record)      // Mở modal sửa với data
handleDelete(record)    // Hiển thị confirm delete
handleModalOk()         // Submit form (create/update)
handleModalCancel()     // Đóng modal
handleTableChange()     // Xử lý pagination
```

---

## 🔧 API Endpoints

### GET `/api/hotels`
**Query params:**
- `page`: Số trang (default: 1)
- `limit`: Số items/trang (default: 10)
- `search`: Từ khóa tìm kiếm (optional)

**Response:**
```json
{
  "hotels": [
    {
      "hotel_id": 1,
      "name": "Grand Hotel",
      "address": "123 Main St",
      "description": "...",
      "images": ["url1", "url2"],
      "phone": "0123456789",
      "email": "hotel@example.com",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50
  }
}
```

### POST `/api/hotels`
**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body (FormData):**
```
name: "Hotel ABC"
address: "123 Street"
description: "Beautiful hotel"
phone: "0123456789"
email: "hotel@example.com"
images: [File1, File2, File3]
```

**Response:**
```json
{
  "message": "Tạo khách sạn thành công",
  "hotel": { ... }
}
```

### PUT `/api/hotels/:id`
**Body (FormData):**
```
name: "Updated Name"
address: "Updated Address"
existingImages: '["url1", "url3"]'  // JSON string
images: [NewFile1, NewFile2]        // New files
```

### DELETE `/api/hotels/:id`
**Response:**
```json
{
  "message": "Xóa khách sạn thành công"
}
```

---

## 📸 Upload Images Flow

### Frontend
```javascript
// 1. User selects files
<Upload
  beforeUpload={(file) => {
    // Validate
    if (!file.type.startsWith('image/')) {
      message.error('Chỉ được upload file ảnh!')
      return false
    }
    if (file.size > 5 * 1024 * 1024) {
      message.error('Kích thước ảnh phải nhỏ hơn 5MB!')
      return false
    }
    
    // Add to fileList
    setFileList([...fileList, file])
    return false // Prevent auto upload
  }}
/>

// 2. On submit, create FormData
const formData = new FormData()
formData.append('name', values.name)
// ... other fields

// Add new files
fileList.filter(f => f.originFileObj).forEach(file => {
  formData.append('images', file.originFileObj)
})

// Add existing images list
if (editingHotel) {
  const existingUrls = fileList
    .filter(f => !f.originFileObj && f.url)
    .map(f => f.url)
  formData.append('existingImages', JSON.stringify(existingUrls))
}

// 3. Call API
await updateHotel(hotelId, formData)
```

### Backend
```javascript
// hotelController.js

exports.updateHotel = async (req, res) => {
  // 1. Parse existingImages
  let existingImagesList = []
  if (req.body.existingImages) {
    existingImagesList = JSON.parse(req.body.existingImages)
  }

  // 2. Delete removed images from S3
  for (const oldUrl of hotel.images) {
    if (!existingImagesList.includes(oldUrl)) {
      const key = extractKeyFromUrl(oldUrl)
      await deleteFromS3(key)
    }
  }

  // 3. Upload new images to S3
  const newUrls = []
  for (const file of req.files) {
    const key = generateKey('hotels', file.originalname)
    const uploaded = await uploadBufferToS3(file.buffer, key, file.mimetype)
    newUrls.push(uploaded.url)
  }

  // 4. Merge: existing + new
  hotel.images = [...existingImagesList, ...newUrls]
  await hotel.save()
}
```

---

## 🎨 Styling

### CSS File: `hotel.css`

**Highlights:**
- 🎨 Modern gradient design
- 📱 Fully responsive
- ✨ Smooth transitions
- 🖼️ Image hover effects
- 🎯 Ant Design theme customization

**Key styles:**
```css
/* Gradient header */
.hotels-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Responsive table */
@media (max-width: 768px) {
  .ant-table { overflow-x: auto; }
}

/* Image hover effect */
.ant-image:hover img {
  transform: scale(1.05);
  transition: transform 0.3s;
}
```

---

## 🧪 Testing Checklist

### Thêm mới
- [ ] Form validation hoạt động
- [ ] Upload 1 ảnh thành công
- [ ] Upload nhiều ảnh (< 10) thành công
- [ ] Upload > 10 ảnh bị chặn
- [ ] File > 5MB bị reject
- [ ] File không phải ảnh bị reject
- [ ] Thông báo success hiển thị
- [ ] Danh sách tự động reload
- [ ] Modal đóng sau khi thành công

### Sửa
- [ ] Ảnh cũ hiển thị đúng
- [ ] Xóa ảnh cũ hoạt động
- [ ] Thêm ảnh mới hoạt động
- [ ] Giữ ảnh cũ + thêm mới hoạt động
- [ ] Update thông tin text hoạt động
- [ ] Backend xóa ảnh không dùng trên S3

### Xóa
- [ ] Modal confirm hiển thị
- [ ] Xóa thành công
- [ ] Ảnh trên S3 bị xóa
- [ ] Danh sách tự động reload
- [ ] Thông báo success hiển thị

### Search
- [ ] Tìm theo tên hoạt động
- [ ] Tìm theo địa chỉ hoạt động
- [ ] Tìm theo email hoạt động
- [ ] Tìm theo phone hoạt động
- [ ] Clear search reset về tất cả
- [ ] Tìm không phân biệt hoa/thường

### Pagination
- [ ] Chuyển trang không gọi API
- [ ] Page size thay đổi hoạt động
- [ ] Total count hiển thị đúng
- [ ] Disabled khi 1 trang

---

## 🐛 Troubleshooting

### Lỗi: "Không thể tải danh sách khách sạn"
**Nguyên nhân:**
- API server không chạy
- Không có quyền admin
- Token hết hạn

**Giải pháp:**
```bash
# 1. Check backend running
npm run dev  # trong booking-hotel-be

# 2. Check token in localStorage
console.log(localStorage.getItem('token'))

# 3. Check user role
console.log(user.role) // phải là 'admin'
```

### Lỗi: "Upload ảnh thất bại"
**Nguyên nhân:**
- AWS S3 credentials sai
- File quá lớn
- Định dạng không hợp lệ

**Giải pháp:**
```bash
# 1. Check .env backend
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=your-bucket
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx

# 2. Check file size
console.log(file.size / 1024 / 1024, 'MB')

# 3. Check file type
console.log(file.type)  // phải là 'image/*'
```

### Lỗi: "Xóa ảnh cũ không hoạt động"
**Kiểm tra:**
```javascript
// Frontend - existingImages phải được stringify
formData.append('existingImages', JSON.stringify(existingUrls))

// Backend - phải parse
const list = JSON.parse(req.body.existingImages)
```

---

## 🚀 Performance Tips

### 1. Lazy Load Images
```javascript
<Image 
  src={url}
  loading="lazy"  // Lazy load
  placeholder={<Spin />}
/>
```

### 2. Debounce Search
```javascript
import { debounce } from 'lodash'

const debouncedSearch = debounce((value) => {
  setSearchText(value)
}, 300)
```

### 3. Virtual Scroll (nếu > 1000 items)
```javascript
import { List } from 'react-virtualized'
```

---

## 📚 Resources

- [Ant Design Table](https://ant.design/components/table)
- [Ant Design Upload](https://ant.design/components/upload)
- [Ant Design Form](https://ant.design/components/form)
- [AWS S3 Upload](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-example-creating-buckets.html)

---

## 🎓 Best Practices

✅ **DO:**
- Validate input ở cả client và server
- Show loading states
- Handle errors gracefully
- Provide user feedback (messages)
- Cache data khi có thể
- Clean up unused images on S3

❌ **DON'T:**
- Upload trực tiếp file quá lớn
- Skip validation
- Ignore error cases
- Spam API calls
- Store images in database (dùng S3)

---

Chúc bạn code vui vẻ! 🎉


# API Lấy Danh Sách Phòng Trống

Tài liệu này hướng dẫn cách sử dụng các API để lấy danh sách phòng trống trong hệ thống đặt phòng khách sạn.

**Base URL**: `https://<BASE_URL>/api`

---

## 1. Tìm Phòng Trống Theo Khoảng Thời Gian (Public API)

API này cho phép tìm kiếm phòng trống dựa trên khoảng thời gian check-in/check-out và các tiêu chí lọc khác.

### Endpoint

```
GET /api/rooms/availability/search
```

### Xác thực

- **Không yêu cầu** xác thực (Public API)
- Bất kỳ ai cũng có thể gọi API này

### Query Parameters

| Tham số | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|---------|------|----------|-------|-------|
| `check_in` | string (YYYY-MM-DD) | ✅ | Ngày nhận phòng | `2024-12-25` |
| `check_out` | string (YYYY-MM-DD) | ✅ | Ngày trả phòng | `2024-12-27` |
| `guests` | number | ❌ | Số lượng khách (lọc theo sức chứa phòng) | `2` |
| `hotel_id` | number | ❌ | ID khách sạn (lọc theo khách sạn) | `1` |
| `room_type_id` | number | ❌ | ID loại phòng (lọc theo loại phòng) | `3` |
| `min_price` | number | ❌ | Giá tối thiểu mỗi đêm (VND) | `500000` |
| `max_price` | number | ❌ | Giá tối đa mỗi đêm (VND) | `5000000` |
| `sort` | string | ❌ | Sắp xếp: `price_asc` hoặc `price_desc` (mặc định: `price_asc`) | `price_asc` |
| `page` | number | ❌ | Số trang (mặc định: `1`) | `1` |
| `limit` | number | ❌ | Số bản ghi mỗi trang (không có = trả về tất cả) | `10` |
| `num_rooms` | number | ❌ | Số lượng phòng cần tìm (mặc định: `1`) | `2` |

### Ví dụ Request

```bash
# Tìm phòng trống từ 25/12/2024 đến 27/12/2024 cho 2 khách, 1 phòng
GET /api/rooms/availability/search?check_in=2024-12-25&check_out=2024-12-27&guests=2&num_rooms=1

# Tìm phòng trống với lọc giá từ 500k đến 2 triệu
GET /api/rooms/availability/search?check_in=2024-12-25&check_out=2024-12-27&min_price=500000&max_price=2000000

# Tìm phòng trống cho loại phòng cụ thể
GET /api/rooms/availability/search?check_in=2024-12-25&check_out=2024-12-27&room_type_id=3&num_rooms=2
```

### Response Structure

#### Success Response (200 OK)

```json
{
  "total": 15,
  "rooms": [
    {
      "room_id": 1,
      "room_num": "101",
      "status": "available",
      "hotel": {
        "hotel_id": 1,
        "name": "Bean Hotel Luxury Resort",
        "address": "123 Đường ABC, Quận XYZ",
        "phone": "0123456789",
        "email": "info@beanhotel.com",
        "images": ["https://..."]
      },
      "room_type": {
        "room_type_id": 3,
        "room_type_name": "Phòng Deluxe",
        "description": "Phòng sang trọng với view đẹp",
        "capacity": 2,
        "images": ["https://..."],
        "amenities": ["WiFi", "TV", "Điều hòa"],
        "area": 35,
        "prices": [
          {
            "price_id": 10,
            "start_date": "2024-12-01",
            "end_date": "2024-12-31",
            "price_per_night": 1500000
          }
        ]
      }
    }
    // ... more rooms
  ],
  "summary_by_room_type": [
    {
      "room_type_id": 3,
      "room_type_name": "Phòng Deluxe",
      "description": "Phòng sang trọng với view đẹp",
      "capacity": 2,
      "amenities": ["WiFi", "TV", "Điều hòa"],
      "area": 35,
      "images": ["https://..."],
      "total_rooms": 10,
      "booked_rooms": 3,
      "available_rooms": 7,
      "sold_out": false,
      "availability_text": "Còn 7 phòng",
      "prices": [
        {
          "price_id": 10,
          "start_date": "2024-12-01",
          "end_date": "2024-12-31",
          "price_per_night": 1500000
        }
      ]
    }
    // ... more room types
  ],
  "requested_num_rooms": 1
}
```

#### Error Response (400 Bad Request)

```json
{
  "message": "Thiếu check_in hoặc check_out"
}
```

```json
{
  "message": "Số lượng phòng phải lớn hơn 0"
}
```

### Giải thích Response

- **`total`**: Tổng số phòng trống tìm được
- **`rooms`**: Danh sách chi tiết các phòng trống (bao gồm thông tin hotel, room_type, giá)
- **`summary_by_room_type`**: Tóm tắt theo từng loại phòng:
  - `total_rooms`: Tổng số phòng của loại này
  - `booked_rooms`: Số phòng đã được đặt
  - `available_rooms`: Số phòng còn trống
  - `sold_out`: `true` nếu hết phòng, `false` nếu còn phòng
  - `availability_text`: Text hiển thị ("Còn X phòng" hoặc "Hết phòng")
  - `prices`: Danh sách giá áp dụng cho khoảng thời gian này
- **`requested_num_rooms`**: Số lượng phòng đã yêu cầu trong query

### Lưu ý

1. **Thời gian**: API sử dụng timezone `Asia/Ho_Chi_Minh` để xử lý ngày tháng
2. **Phòng đang được giữ**: API tự động trừ các phòng đang được giữ tạm thời trong Redis (temp bookings)
3. **Lọc theo `num_rooms`**: Chỉ trả về các loại phòng có số phòng trống >= `num_rooms` yêu cầu
4. **Giá**: API lấy giá áp dụng cho ngày `check_in` (giá có `start_date <= check_in <= end_date`)

---

## 2. Lấy Phòng Trống Cho Loại Phòng Cụ Thể (Admin API)

API này cho phép admin lấy danh sách chi tiết các phòng trống của một loại phòng cụ thể trong khoảng thời gian nhất định.

### Endpoint

```
GET /api/bookings/available-rooms
```

### Xác thực

- **Yêu cầu** xác thực
- Header: `Authorization: Bearer <accessToken>`
- Role: `admin` (chỉ admin mới được truy cập)

### Query Parameters

| Tham số | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|---------|------|----------|-------|-------|
| `room_type_id` | number | ✅ | ID loại phòng | `3` |
| `check_in_date` | string (YYYY-MM-DD) | ✅ | Ngày nhận phòng | `2024-12-25` |
| `check_out_date` | string (YYYY-MM-DD) | ✅ | Ngày trả phòng | `2024-12-27` |

### Ví dụ Request

```bash
# Lấy danh sách phòng trống của loại phòng ID=3 từ 25/12 đến 27/12
GET /api/bookings/available-rooms?room_type_id=3&check_in_date=2024-12-25&check_out_date=2024-12-27

# Với Authorization header
curl -X GET \
  'https://api.example.com/api/bookings/available-rooms?room_type_id=3&check_in_date=2024-12-25&check_out_date=2024-12-27' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

### Response Structure

#### Success Response (200 OK)

```json
{
  "message": "Danh sách phòng trống",
  "room_type_id": 3,
  "room_type_name": "Phòng Deluxe",
  "max_quantity": 10,
  "check_in_date": "2024-12-25",
  "check_out_date": "2024-12-27",
  "total_rooms": 10,
  "available_rooms": 7,
  "rooms": [
    {
      "room_id": 1,
      "room_num": "101",
      "status": "available"
    },
    {
      "room_id": 2,
      "room_num": "102",
      "status": "available"
    }
    // ... more rooms
  ]
}
```

#### Error Response (400 Bad Request)

```json
{
  "message": "Vui lòng nhập đầy đủ thông tin loại phòng và ngày"
}
```

#### Error Response (404 Not Found)

```json
{
  "message": "Không tìm thấy loại phòng"
}
```

### Giải thích Response

- **`room_type_id`**: ID loại phòng đã truy vấn
- **`room_type_name`**: Tên loại phòng
- **`max_quantity`**: Số lượng phòng tối đa của loại này (từ RoomType.quantity)
- **`check_in_date`**: Ngày nhận phòng đã truy vấn
- **`check_out_date`**: Ngày trả phòng đã truy vấn
- **`total_rooms`**: Tổng số phòng thực tế của loại này trong hệ thống
- **`available_rooms`**: Số phòng trống trong khoảng thời gian này
- **`rooms`**: Danh sách chi tiết các phòng trống (chỉ có `room_id`, `room_num`, `status`)

### Lưu ý

1. **Chỉ tính booking chưa kết thúc**: API chỉ tính các booking có `check_out_date >= hôm nay` và status là `confirmed` hoặc `checked_in`
2. **Trừ phòng đang được giữ**: API tự động trừ các phòng đang được giữ tạm thời trong Redis
3. **Status phòng**: Chỉ lấy các phòng có status: `available`, `checked_out`, `cleaning`, hoặc `booked` (nhưng không có booking active)

---

## 3. Sử dụng trong Frontend

### Ví dụ với Axios/Fetch

```javascript
// Tìm phòng trống (Public API)
const searchAvailableRooms = async (params) => {
  try {
    const queryParams = new URLSearchParams({
      check_in: params.checkIn, // '2024-12-25'
      check_out: params.checkOut, // '2024-12-27'
      guests: params.guests || 2,
      num_rooms: params.numRooms || 1,
      sort: 'price_asc'
    })
    
    if (params.roomTypeId) {
      queryParams.append('room_type_id', params.roomTypeId)
    }
    if (params.minPrice) {
      queryParams.append('min_price', params.minPrice)
    }
    if (params.maxPrice) {
      queryParams.append('max_price', params.maxPrice)
    }

    const response = await fetch(
      `${API_BASE_URL}/api/rooms/availability/search?${queryParams.toString()}`
    )
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error searching rooms:', error)
    throw error
  }
}

// Sử dụng
const rooms = await searchAvailableRooms({
  checkIn: '2024-12-25',
  checkOut: '2024-12-27',
  guests: 2,
  numRooms: 1
})

console.log('Tổng số phòng:', rooms.total)
console.log('Danh sách phòng:', rooms.rooms)
console.log('Tóm tắt theo loại:', rooms.summary_by_room_type)
```

### Ví dụ với Service File

Tạo file `src/services/room.service.js`:

```javascript
import httpClient from './httpClient'

/**
 * Tìm phòng trống theo khoảng thời gian
 * @param {Object} params - Tham số tìm kiếm
 * @param {string} params.check_in - Ngày check-in (YYYY-MM-DD)
 * @param {string} params.check_out - Ngày check-out (YYYY-MM-DD)
 * @param {number} [params.guests] - Số lượng khách
 * @param {number} [params.num_rooms] - Số lượng phòng cần tìm (mặc định: 1)
 * @param {number} [params.room_type_id] - ID loại phòng
 * @param {number} [params.min_price] - Giá tối thiểu
 * @param {number} [params.max_price] - Giá tối đa
 * @param {string} [params.sort] - Sắp xếp: 'price_asc' hoặc 'price_desc'
 * @param {number} [params.page] - Số trang
 * @param {number} [params.limit] - Số bản ghi mỗi trang
 * @returns {Promise} Response từ API
 */
export const searchAvailableRooms = async (params) => {
  try {
    const response = await httpClient.get('/rooms/availability/search', { params })
    return response
  } catch (error) {
    console.error('Error searching available rooms:', error)
    throw error
  }
}

/**
 * Lấy phòng trống cho loại phòng cụ thể (Admin only)
 * @param {Object} params - Tham số
 * @param {number} params.room_type_id - ID loại phòng
 * @param {string} params.check_in_date - Ngày check-in (YYYY-MM-DD)
 * @param {string} params.check_out_date - Ngày check-out (YYYY-MM-DD)
 * @returns {Promise} Response từ API
 */
export const getAvailableRoomsForType = async (params) => {
  try {
    const response = await httpClient.get('/bookings/available-rooms', { params })
    return response
  } catch (error) {
    console.error('Error getting available rooms for type:', error)
    throw error
  }
}
```

---

## 4. So sánh 2 API

| Tiêu chí | `/api/rooms/availability/search` | `/api/bookings/available-rooms` |
|----------|----------------------------------|--------------------------------|
| **Xác thực** | Không cần (Public) | Cần (Admin only) |
| **Mục đích** | Tìm kiếm phòng cho khách hàng | Quản lý phòng cho admin |
| **Dữ liệu trả về** | Chi tiết đầy đủ (hotel, room_type, prices) | Đơn giản (chỉ room_id, room_num, status) |
| **Lọc** | Nhiều tiêu chí (giá, loại phòng, khách sạn) | Chỉ theo loại phòng và ngày |
| **Summary** | Có `summary_by_room_type` | Không có |
| **Số lượng phòng** | Hỗ trợ `num_rooms` | Không hỗ trợ |

---

## 5. Best Practices

1. **Luôn validate ngày tháng** trước khi gọi API
2. **Xử lý lỗi** khi API trả về 400/404/500
3. **Cache kết quả** nếu có thể để giảm số lần gọi API
4. **Sử dụng `summary_by_room_type`** để hiển thị tổng quan trước khi hiển thị chi tiết từng phòng
5. **Kiểm tra `sold_out`** để hiển thị trạng thái "Hết phòng" cho người dùng

---

## 6. Troubleshooting

### Vấn đề: API trả về 0 phòng nhưng thực tế có phòng trống

**Nguyên nhân có thể:**
- Ngày check-in/check-out không hợp lệ
- Tất cả phòng đã được đặt trong khoảng thời gian này
- Phòng đang được giữ tạm thời (Redis temp bookings)
- Lọc `num_rooms` quá lớn so với số phòng trống

**Giải pháp:**
- Kiểm tra lại ngày tháng (format YYYY-MM-DD)
- Thử với khoảng thời gian khác
- Giảm `num_rooms` xuống 1 để kiểm tra

### Vấn đề: Giá không hiển thị

**Nguyên nhân:**
- Không có bảng giá (RoomPrice) cho khoảng thời gian này
- Giá chưa được thiết lập cho loại phòng

**Giải pháp:**
- Kiểm tra bảng giá trong database
- Đảm bảo có giá với `start_date <= check_in <= end_date`

---

## 7. Changelog

- **2024-12-XX**: Thêm tham số `num_rooms` vào API `/api/rooms/availability/search`
- **2024-12-XX**: Cải thiện logic lọc phòng đang được giữ tạm thời (Redis)

---

**Tài liệu này được cập nhật lần cuối:** 2024-12-XX


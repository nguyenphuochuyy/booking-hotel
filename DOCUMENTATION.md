# Tài Liệu Tổng Quan Dự Án Frontend - Bean Hotel Booking System

## 📋 Mục Lục

1. [Tổng Quan Dự Án](#tổng-quan-dự-án)
2. [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
3. [Cấu Trúc Thư Mục](#cấu-trúc-thư-mục)
4. [Luồng Hoạt Động Chính](#luồng-hoạt-động-chính)
5. [Các Component Chính](#các-component-chính)
6. [Service Layer & API Integration](#service-layer--api-integration)
7. [State Management](#state-management)
8. [Routing & Navigation](#routing--navigation)
9. [Authentication Flow](#authentication-flow)
10. [Booking Flow](#booking-flow)
11. [Admin Dashboard](#admin-dashboard)
12. [Utilities & Helpers](#utilities--helpers)
13. [Styling & UI](#styling--ui)
14. [Build & Deployment](#build--deployment)

---

## 📖 Tổng Quan Dự Án

**Bean Hotel Booking System** là một ứng dụng web đặt phòng khách sạn được xây dựng bằng React 18 và Vite. Hệ thống cung cấp:

- **Giao diện người dùng**: Tìm kiếm phòng, đặt phòng, xem tin tức, liên hệ, chatbot hỗ trợ
- **Trang quản trị**: Quản lý đặt phòng, phòng, giá, báo cáo, dịch vụ, người dùng

### Công Nghệ Sử Dụng

- **Frontend Framework**: React 18.3.1
- **Build Tool**: Vite 7.1.2
- **Routing**: React Router DOM 7.8.2
- **UI Framework**: Ant Design 5.27.2
- **State Management**: React Context API
- **HTTP Client**: Fetch API (custom wrapper)
- **Animations**: Framer Motion 12.23.24
- **Date Handling**: Dayjs 1.11.18
- **Charts**: Recharts 3.4.1, @ant-design/plots 2.6.6
- **Rich Text**: React Quill 2.0.0
- **Markdown**: React Markdown 10.1.0
- **OAuth**: @react-oauth/google 0.12.2

---

## 🏗️ Kiến Trúc Hệ Thống

### Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────┐
│              Browser (Client)                    │
├─────────────────────────────────────────────────┤
│  React App (SPA)                                │
│  ├── User Interface (UserLayout)                │
│  │   ├── Navigation                             │
│  │   ├── Pages (Home, Hotels, Services...)      │
│  │   └── Footer                                 │
│  │                                               │
│  └── Admin Interface (AdminLayout)              │
│      ├── Sidebar Navigation                      │
│      ├── Admin Pages                            │
│      └── Dashboard                              │
├─────────────────────────────────────────────────┤
│  State Management                               │
│  ├── AuthContext (Authentication)                │
│  └── Local Storage (Token, User Info)          │
├─────────────────────────────────────────────────┤
│  Service Layer                                  │
│  ├── httpClient.js (HTTP Wrapper)              │
│  └── *.service.js (API Services)                │
├─────────────────────────────────────────────────┤
│  Backend API (RESTful)                          │
│  └── Express.js Server                          │
└─────────────────────────────────────────────────┘
```

### Luồng Dữ Liệu

1. **User Action** → Component
2. Component → **Service Function**
3. Service → **httpClient**
4. httpClient → **Backend API**
5. Response → **Service** → **Component** → **UI Update**

---

## 📁 Cấu Trúc Thư Mục

```
booking-hotel/
├── public/                          # Static files
│   ├── logo.png
│   └── vite.svg
│
├── src/
│   ├── main.jsx                    # Entry point - Setup providers
│   ├── App.jsx                     # Root component với Router
│   ├── App.css                     # Global app styles
│   ├── index.css                   # Base CSS reset
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx           # Định nghĩa tất cả routes
│   │
│   ├── layouts/                    # Layout components
│   │   ├── UserLayout.jsx         # Layout cho user (Nav + Footer)
│   │   └── AdminLayout.jsx        # Layout cho admin (Sidebar + Header)
│   │
│   ├── context/                    # React Context providers
│   │   └── AuthContext.jsx        # Authentication context
│   │
│   ├── components/                 # Reusable components
│   │   ├── Navigation/            # Header navigation
│   │   ├── Footer/                # Footer component
│   │   ├── BookingWidget/         # Booking search widget
│   │   ├── BookingModal/          # Booking modal
│   │   ├── ChatBot/               # AI Chatbot
│   │   ├── RoomList/              # Room listing
│   │   ├── CheckInOut/            # Check-in/out component
│   │   ├── Loading/                # Loading spinner
│   │   ├── ScrollToTop/           # Scroll to top button
│   │   └── ... (các components khác)
│   │
│   ├── pages/                      # Page components
│   │   ├── Home/                  # Trang chủ
│   │   ├── Hotels/                # Danh sách khách sạn
│   │   ├── RoomDetail/            # Chi tiết phòng
│   │   ├── BookingConfirmation/   # Xác nhận đặt phòng
│   │   ├── Payment/                # Thanh toán
│   │   ├── PaymentSuccess/         # Thanh toán thành công
│   │   ├── Authentication/        # Login/Register
│   │   ├── ProfileUser/            # Profile người dùng
│   │   ├── UserBookingHistory/    # Lịch sử đặt phòng
│   │   └── Admin/                  # Admin pages
│   │       ├── Dashboard.jsx
│   │       ├── Users.jsx
│   │       ├── Hotel/
│   │       ├── RoomType/
│   │       ├── Room/
│   │       ├── RoomPrice/
│   │       ├── Booking/
│   │       ├── Promotion/
│   │       ├── Service/
│   │       ├── Posts/
│   │       ├── Review/
│   │       └── Reports/
│   │
│   ├── services/                   # API service layer
│   │   ├── httpClient.js          # HTTP client wrapper
│   │   ├── index.js               # Export all services
│   │   ├── authentication.service.js
│   │   ├── user.service.js
│   │   ├── hotel.service.js
│   │   ├── roomtype.service.js
│   │   ├── roomprice.service.js
│   │   ├── booking.service.js
│   │   ├── service.service.js
│   │   ├── post.service.js
│   │   ├── category.service.js
│   │   ├── review.service.js
│   │   ├── chatbot.service.js
│   │   ├── dashboard.service.js
│   │   └── admin.service.js
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── hotels.js
│   │   ├── posts.js
│   │   ├── roomtype.js
│   │   └── service.js
│   │
│   ├── constants/                  # Constants & configs
│   │   ├── apiEndpoints.js        # API endpoints
│   │   ├── adminApi.js
│   │   ├── amenities.js
│   │   └── roomCategories.js
│   │
│   ├── utils/                      # Utility functions
│   │   ├── formatPrice.js          # Format giá tiền
│   │   ├── formatDateTime.js      # Format ngày giờ
│   │   └── pendingPayment.util.js # Quản lý pending payment
│   │
│   ├── data/                       # Mock data (nếu có)
│   │   ├── mockNews.js
│   │   └── mockPosts.js
│   │
│   └── assets/                     # Static assets
│       └── images/                 # Hình ảnh
│
├── package.json                    # Dependencies
├── vite.config.js                 # Vite configuration
├── index.html                     # HTML template
└── README.md                       # Project README
```

---

## 🔄 Luồng Hoạt Động Chính

### 1. Khởi Động Ứng Dụng

```
1. Browser load index.html
2. main.jsx được execute
   ├── Tạo root DOM element
   ├── Wrap App với AuthProvider
   ├── Wrap App với GoogleOAuthProvider
   └── Render App component
3. App.jsx render
   ├── Setup BrowserRouter
   ├── Render ScrollToTop component
   ├── Render AppRoutes
   └── Render PopupAdvertisement
4. AppRoutes.jsx
   ├── Check authentication state từ AuthContext
   ├── Determine user role (admin/user)
   └── Render appropriate layout (UserLayout/AdminLayout)
```

### 2. Authentication Flow

```
User Login:
1. User nhập credentials → Authentication page
2. Submit form → authenticationService.login()
3. Service gọi API → httpClient.post('/auth/login')
4. Backend validate → Trả về accessToken + user info
5. AuthContext.login() lưu token vào localStorage
6. Fetch user profile từ API
7. Update AuthContext state
8. Navigate to appropriate page (Home/Admin)
```

### 3. Booking Flow

```
1. User search phòng:
   ├── BookingWidget component
   ├── User chọn check-in, check-out, số khách, số phòng
   └── Navigate to /hotels với query params

2. Hotels page:
   ├── Parse query params từ URL
   ├── Call API search available rooms
   └── Display room list với filters

3. User chọn phòng:
   ├── Click vào room card
   └── Navigate to /rooms/:id (RoomDetail)

4. RoomDetail page:
   ├── Fetch room details từ API
   ├── User chọn thêm dịch vụ (optional)
   └── Click "Đặt phòng" → Navigate to /booking-confirmation

5. BookingConfirmation page:
   ├── Validate booking data
   ├── Create temp booking → API
   ├── Add services to temp booking (nếu có)
   └── Navigate to /payment với booking data

6. Payment page:
   ├── Display booking summary
   ├── Create payment link → PayOS API
   ├── Display QR code hoặc payment link
   ├── Poll payment status
   └── On success → Navigate to /payment/success

7. PaymentSuccess page:
   ├── Verify payment
   ├── Convert temp booking → confirmed booking
   └── Display success message + booking code
```

### 4. Admin Flow

```
1. Admin login → Navigate to /admin
2. AdminLayout render:
   ├── Sidebar với menu items
   ├── Header với user info
   └── Content area với Outlet

3. Admin chọn menu item:
   ├── Navigate to route (e.g., /admin/bookings)
   ├── AdminRoute component check:
   │   ├── Check token exists
   │   ├── Check user role === 'admin'
   │   └── Render page hoặc redirect
   └── Page component fetch data và render
```

---

## 🧩 Các Component Chính

### 1. Navigation Component

**File**: `src/components/Navigation/Navigation.jsx`

**Chức năng**:
- Hiển thị header navigation với logo, menu items
- Responsive với mobile drawer
- Hiển thị user menu khi đã đăng nhập
- Link đến các trang chính: Home, About, Services, News, Gallery, Contact

**State**:
- `drawerOpen`: Trạng thái mobile drawer
- `isScrolled`: Trạng thái scroll để thay đổi style

**Props**: Không có (sử dụng hooks từ context)

### 2. BookingWidget Component

**File**: `src/components/BookingWidget/BookingWidget.jsx`

**Chức năng**:
- Widget tìm kiếm phòng trên homepage
- Date range picker cho check-in/check-out
- Guest và room selector
- Navigate đến /hotels với search params

**State**:
- `adults`: Số người lớn
- `rooms`: Số phòng
- `guestVisible`: Trạng thái popover guest selector
- `loading`: Trạng thái loading khi search

**Props**:
- `checkIn`, `checkOut`, `adults`, `rooms`: Props từ parent (optional)

### 3. ChatBot Component

**File**: `src/components/ChatBot/ChatBot.jsx`

**Chức năng**:
- AI chatbot hỗ trợ khách hàng
- Tích hợp với backend chatbot API
- Hiển thị lịch sử chat
- Parse và hiển thị room cards, booking cards từ AI response
- Quick actions cho các tác vụ phổ biến

**State**:
- `open`: Trạng thái mở/đóng chat panel
- `messages`: Danh sách messages hiện tại
- `allMessages`: Tất cả messages (cho pagination)
- `loading`: Trạng thái đang gửi message
- `sessionId`: Session ID của chat
- `tools`: Danh sách tools từ backend

**Features**:
- Infinite scroll với load more messages
- Markdown rendering cho AI responses
- Parse JSON từ AI response để hiển thị structured data
- Auto-scroll to bottom
- Unread message badge

### 4. RoomList Component

**File**: `src/components/RoomList/RoomList.jsx`

**Chức năng**:
- Hiển thị danh sách phòng
- Sử dụng hook `useRoomTypes()` để fetch data
- Hover preview modal
- Click để xem chi tiết

**State**: Quản lý bởi `useRoomTypes` hook

### 5. UserLayout Component

**File**: `src/layouts/UserLayout.jsx`

**Chức năng**:
- Layout wrapper cho user pages
- Bao gồm Navigation, Footer
- ChatBot component
- Scroll to top button
- Auto redirect admin users đến admin page

**Structure**:
```jsx
<UserLayout>
  <Navigation />
  <ChatBot />
  <main>
    <Outlet /> {/* User pages render here */}
  </main>
  <Footer />
  <FloatButton.BackTop />
</UserLayout>
```

### 6. AdminLayout Component

**File**: `src/layouts/AdminLayout.jsx`

**Chức năng**:
- Layout wrapper cho admin pages
- Sidebar navigation với menu items
- Header với user info và logout
- Collapsible sidebar
- Responsive design

**Menu Items**:
- Dashboard
- Quản lý người dùng
- Quản lý khách sạn
- Quản lý đặt phòng
- Quản lý loại phòng
- Quản lý phòng
- Quản lý giá phòng
- Quản lý khuyến mãi
- Quản lý đánh giá
- Quản lý bài viết
- Quản lý dịch vụ
- Báo cáo thống kê

---

## 🌐 Service Layer & API Integration

### HTTP Client (`services/httpClient.js`)

**Chức năng**:
- Wrapper cho Fetch API
- Tự động attach Bearer token từ localStorage
- Base URL từ environment variable `VITE_API_BASE_URL`
- Fallback URL: Production `https://api.beanhotelvn.id.vn/api`, Development `http://localhost:5000/api`
- Request timeout (default 15s)
- Error handling
- Hỗ trợ JSON và FormData

**API**:
```javascript
const http = createHttpClient({
  baseURL: getBaseUrl(),
  getToken: getAccessToken,
  onUnauthorized: () => {
    localStorage.removeItem('accessToken')
  }
})

// Methods:
http.get(path, options)
http.post(path, data, options)
http.put(path, data, options)
http.patch(path, data, options)
http.delete(path, options)
```

### Service Pattern

Mỗi domain có service riêng:

**Example**: `services/booking.service.js`

```javascript
// Tạo temp booking
export const createTempBooking = async (bookingData) => {
  return httpClient.post('/bookings/temp-booking', bookingData)
}

// Tạo payment link
export const createPaymentLink = async (paymentData) => {
  return httpClient.post('/bookings/create-payment-link', paymentData)
}

// Get user bookings
export const getUserBookings = async (params = {}) => {
  return httpClient.get('/bookings/my-bookings', { params })
}
```

### API Endpoints Constants

**File**: `constants/apiEndpoints.js`

Tất cả endpoints được định nghĩa tập trung:

```javascript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    // ...
  },
  BOOKINGS: {
    CREATE: '/bookings',
    LIST: '/bookings',
    // ...
  },
  // ...
}
```

---

## 🔐 State Management

### AuthContext (`context/AuthContext.jsx`)

**Provider**: `AuthProvider`

**State**:
- `user`: Thông tin user hiện tại (object)
- `accessToken`: JWT token (string)
- `loading`: Trạng thái đang check auth (boolean)

**Computed Values**:
- `isAuthenticated`: Boolean(accessToken)

**Methods**:
- `login(credentials)`: Đăng nhập, lưu token, fetch user profile
- `logout()`: Xóa token, user info, temp bookings, clear localStorage

**Initialization**:
- Khi app khởi động, check token trong localStorage
- Nếu có token, fetch user profile từ API
- Nếu token invalid, clear tất cả data

### Local Storage Usage

**Keys**:
- `accessToken`: JWT token
- `user`: User info (JSON string)
- `pendingPayment`: Pending payment data (deprecated)
- `pendingPaymentExpiry`: Expiry timestamp (deprecated)
- `temp_bookings_{userId}`: Danh sách temp bookings theo user
- `chatbot_session_id`: Chatbot session ID

### Custom Hooks

**useRoomTypes** (`hooks/roomtype.js`):
- Fetch danh sách room types với pagination
- Search và filter
- CRUD operations cho admin
- Auto-fetch current price cho mỗi room type

**useRoomTypeDetail** (`hooks/roomtype.js`):
- Fetch chi tiết room type theo ID
- Auto-fetch current price

---

## 🧭 Routing & Navigation

### Route Structure (`routes/AppRoutes.jsx`)

**User Routes** (UserLayout):
- `/` - Home
- `/hotels` - Danh sách khách sạn
- `/rooms/:id` - Chi tiết phòng
- `/booking-confirmation` - Xác nhận đặt phòng
- `/payment` - Thanh toán
- `/payment/success` - Thanh toán thành công
- `/about` - Giới thiệu
- `/news` - Tin tức
- `/news/:slug` - Chi tiết tin tức
- `/contact` - Liên hệ
- `/services` - Dịch vụ
- `/services/:slug` - Chi tiết dịch vụ
- `/gallery` - Thư viện ảnh
- `/faq` - FAQ
- `/login` - Đăng nhập (AuthGuard)
- `/register` - Đăng ký (AuthGuard)
- `/user/profile` - Profile người dùng
- `/user/bookings` - Lịch sử đặt phòng
- `/terms-of-service` - Điều khoản dịch vụ
- `/privacy-policy` - Chính sách bảo mật
- `/cookie-policy` - Chính sách cookie
- `/cancellation-policy` - Chính sách hủy
- `/room-change-policy` - Chính sách đổi phòng
- `/hoa-don-vat` - Hóa đơn VAT
- `/review/:code` - Đánh giá booking
- `/thanh-toan` - Payment refund
- `*` - 404 Not Found

**Admin Routes** (AdminLayout):
- `/admin` - Dashboard (AdminRoute)
- `/admin/users` - Quản lý người dùng (AdminRoute)
- `/admin/hotels` - Quản lý khách sạn (AdminRoute)
- `/admin/room-types` - Quản lý loại phòng (AdminRoute)
- `/admin/rooms` - Quản lý phòng (AdminRoute)
- `/admin/room-prices` - Quản lý giá phòng (AdminRoute)
- `/admin/bookings` - Quản lý đặt phòng (AdminRoute)
- `/admin/promotions` - Quản lý khuyến mãi (AdminRoute)
- `/admin/posts` - Quản lý bài viết (AdminRoute)
- `/admin/services` - Quản lý dịch vụ (AdminRoute)
- `/admin/reviews` - Quản lý đánh giá (AdminRoute)
- `/admin/reports` - Báo cáo thống kê (AdminRoute)
- `/admin/profile` - Profile admin (AdminRoute)

**Common Routes**:
- `/access-denied` - 403 Access Denied

### Route Protection

**AuthGuard** (`components/AuthGuard/AuthGuard.jsx`):
- Redirect đã đăng nhập về home
- Cho phép chưa đăng nhập truy cập

**AdminRoute** (trong AppRoutes.jsx):
- Check token exists
- Check user role === 'admin'
- Redirect đến `/login` nếu chưa đăng nhập
- Redirect đến `/access-denied` nếu không phải admin

### Lazy Loading

Tất cả pages được lazy load để tối ưu performance:

```javascript
const Home = lazy(() => import('../pages/Home'))
const Hotels = lazy(() => import('../pages/Hotels'))
// ...
```

Sử dụng `Suspense` với `Loading` component để hiển thị loading state.

---

## 🔑 Authentication Flow

### 1. Login Flow

```
1. User vào /login
2. AuthGuard check: nếu đã đăng nhập → redirect home
3. User nhập email/username + password
4. Submit → authenticationService.login(credentials)
5. httpClient.post('/auth/login', credentials)
6. Backend validate → Trả về { accessToken, user? }
7. AuthContext.login():
   ├── Lưu token vào localStorage
   ├── Set accessToken state
   ├── Fetch user profile từ API
   └── Set user state
8. Navigate to:
   ├── Nếu admin → /admin
   └── Nếu user → / (home)
```

### 2. Register Flow

```
1. User vào /register
2. User nhập: full_name, email, password
3. Submit → authenticationService.register(data)
4. Backend tạo user → Trả về success
5. Navigate to /register/success
6. User check email để verify
7. Click link verify → /verify-email?token=...
8. Backend verify token → Activate account
9. User có thể login
```

### 3. Google OAuth Flow

```
1. User click "Đăng nhập với Google"
2. Redirect đến backend endpoint: /auth/google
3. Backend redirect đến Google OAuth
4. User authorize → Google redirect về backend callback
5. Backend tạo/login user → Redirect về frontend với token
6. Frontend lưu token → Login thành công
```

### 4. Logout Flow

```
1. User click logout
2. AuthContext.logout():
   ├── Lấy userId từ localStorage
   ├── Xóa accessToken
   ├── Xóa user info
   ├── Xóa temp bookings của user
   ├── Xóa chatbot session
   └── Clear state
3. Navigate to /login
```

### 5. Token Refresh & Validation

```
App khởi động:
1. AuthContext init:
   ├── Check token trong localStorage
   ├── Nếu có token → Fetch user profile
   ├── Nếu API trả về 401 → Token invalid
   └── Clear tất cả data
```

---

## 📅 Booking Flow

### 1. Search Rooms

```
1. User sử dụng BookingWidget:
   ├── Chọn check-in date
   ├── Chọn check-out date
   ├── Chọn số khách và phòng
   └── Click "GIỮ CHỖ NGAY"

2. Navigate to /hotels với query params:
   ├── checkIn=YYYY-MM-DD
   ├── checkOut=YYYY-MM-DD
   ├── adults=number
   ├── children=number
   └── rooms=number

3. Hotels page:
   ├── Parse query params từ URL
   ├── Call API: searchAvailableRooms(params)
   └── Display filtered room list
```

### 2. View Room Detail

```
1. User click vào room card
2. Navigate to /rooms/:id
3. RoomDetail page:
   ├── Fetch room details: getRoomTypeById(id)
   ├── Fetch current price: getCurrentRoomPrice(id)
   ├── Display room info, images, amenities
   └── User có thể chọn thêm dịch vụ
```

### 3. Create Booking

```
1. User click "Đặt phòng" trên RoomDetail
2. Navigate to /booking-confirmation với state:
   ├── roomType data
   ├── checkIn, checkOut
   ├── guests info
   └── selected services (nếu có)

3. BookingConfirmation page:
   ├── Validate booking data
   ├── Calculate total price:
   │   ├── Room price × nights
   │   ├── + Prepaid services
   │   └── - Promotion discount (nếu có)
   ├── User nhập thông tin:
   │   ├── Full name
   │   ├── Email
   │   ├── Phone
   │   └── Special requests (optional)
   ├── User có thể nhập promotion code
   └── Click "Thanh toán" → Create temp booking

4. Create temp booking:
   ├── Call API: createTempBooking({
   │     room_type_id,
   │     check_in,
   │     check_out,
   │     guests,
   │     user_info
   │   })
   ├── Backend tạo temp booking → Trả về tempBookingKey
   ├── Add services (nếu có):
   │   └── Loop: addServiceToTempBooking() cho mỗi service
   └── Save to localStorage: savePendingPayment(userId, bookingData)

5. Navigate to /payment với state:
   ├── tempBookingKey
   ├── bookingData
   └── orderCode (nếu có)
```

### 4. Payment Process

```
1. Payment page:
   ├── Load booking data từ localStorage hoặc state
   ├── Display booking summary
   ├── Display countdown timer (30 phút)
   └── Create payment link

2. Create payment link:
   ├── Call API: createPaymentLink({
   │     temp_booking_key,
   │     return_url,
   │     cancel_url
   │   })
   ├── Backend tạo PayOS payment link
   └── Trả về: { payment_link, qr_code, order_code }

3. Display payment options:
   ├── QR Code (cho mobile)
   ├── Payment link (cho desktop)
   └── Copy link button

4. Poll payment status:
   ├── Set interval: checkPaymentStatus() mỗi 3 giây
   ├── Check orderCode với PayOS API
   └── On success → Navigate to /payment/success

5. Payment success:
   ├── Verify payment với backend
   ├── Backend convert temp booking → confirmed booking
   ├── Display success message
   ├── Display booking code
   └── Remove temp booking từ localStorage
```

### 5. Temp Booking Management

**File**: `utils/pendingPayment.util.js`

**Functions**:
- `savePendingPayment(userId, paymentData, expiryMinutes)`: Lưu temp booking
- `getPendingPayment(userId)`: Lấy temp booking hiện tại
- `getAllPendingPayments(userId)`: Lấy tất cả temp bookings
- `getPendingPaymentByIdentifier(userId, identifier)`: Tìm theo tempBookingKey/bookingCode
- `removePendingPayment(userId, identifier)`: Xóa một temp booking
- `clearPendingPayment(userId)`: Xóa tất cả temp bookings của user
- `clearAllTempBookings()`: Xóa tất cả temp bookings (dùng khi logout)

**Storage Structure**:
```
localStorage:
  temp_bookings_{userId}: [
    {
      tempBookingKey: "...",
      bookingCode: "...",
      orderCode: ...,
      bookingInfo: {...},
      userId: ...,
      createdAt: "...",
      expiresAt: timestamp
    },
    ...
  ]
```

---

## 👨‍💼 Admin Dashboard

### Admin Layout Structure

```
AdminLayout
├── Sider (Sidebar)
│   ├── Logo
│   └── Menu Items
├── Layout
│   ├── Header
│   │   ├── Collapse button
│   │   └── User dropdown
│   └── Content
│       └── <Outlet /> (Admin pages render here)
```

### Admin Pages

**1. Dashboard** (`pages/Admin/Dashboard.jsx`):
- Tổng quan thống kê
- Charts: Doanh thu, bookings, users
- Recent activities

**2. Booking Management** (`pages/Admin/Booking/BookingManagement.jsx`):
- Danh sách tất cả bookings
- Filters: status, date range, search
- Actions:
  - Check-in
  - Check-out
  - Cancel booking (với refund)
  - Add services to booking
  - View details
  - Print invoice

**3. Room Management**:
- CRUD operations cho rooms
- Room status management
- Room availability calendar

**4. Room Price Management**:
- Set giá theo khung thời gian
- Bulk update prices
- Price history

**5. Reports** (`pages/Admin/Reports/Reports.jsx`):
- Revenue reports
- Booking statistics
- Export Excel/PDF

### Admin Route Protection

```javascript
const AdminRoute = ({ children }) => {
  if (loading) return <Loading />
  
  const token = localStorage.getItem('accessToken')
  if (!token || !currentUser) {
    return <Navigate to="/login" replace />
  }
  
  if (!isAdmin) {
    return <Navigate to="/access-denied" replace />
  }
  
  return children
}
```

---

## 🛠️ Utilities & Helpers

### Format Price (`utils/formatPrice.js`)

```javascript
formatPrice(price) // "1.000.000 VNĐ"
```

### Format DateTime (`utils/formatDateTime.js`)

```javascript
formatDateTime(dateTime) // "01/01/2024, 10:30"
```

### Pending Payment Utils (`utils/pendingPayment.util.js`)

Quản lý temp bookings trong localStorage với expiry time.

### Booking Service Utils (`services/booking.service.js`)

**Functions**:
- `calculateNights(checkIn, checkOut)`: Tính số đêm
- `validateBookingDates(checkIn, checkOut)`: Validate dates
- `calculateTotalPrice(roomPrice, nights, services, promotion)`: Tính tổng giá
- `getBookingStatusColor(status)`: Màu sắc theo status
- `getBookingStatusText(status)`: Text theo status
- `formatDate(date)`: Format date
- `formatDateTime(dateTime)`: Format datetime

---

## 🎨 Styling & UI

### CSS Organization

**Nguyên tắc**:
- Mỗi component/page có file CSS riêng
- Import CSS trong component: `import './Component.css'`
- Global styles: `index.css`, `App.css`

### CSS Structure

```css
/* ComponentName.css */

/* Component container */
.component-name {
  /* Styles */
}

/* Sub-elements */
.component-name__header {
  /* Styles */
}

/* Modifiers */
.component-name--active {
  /* Styles */
}

/* Responsive */
@media (max-width: 768px) {
  .component-name {
    /* Mobile styles */
  }
}
```

### Ant Design Integration

- Sử dụng Ant Design components cho UI
- Custom theme với primary color: `#c08a19` (Gold)
- Responsive với Ant Design Grid system

### Responsive Breakpoints

- **xs**: < 576px (Mobile)
- **sm**: ≥ 576px (Tablet)
- **md**: ≥ 768px (Small desktop)
- **lg**: ≥ 992px (Desktop)
- **xl**: ≥ 1200px (Large desktop)
- **xxl**: ≥ 1600px (Extra large)

### Animations

Sử dụng **Framer Motion** cho animations:
- Page transitions
- Scroll animations
- Hover effects

---

## 🚀 Build & Deployment

### Development

```bash
npm install
npm run dev
# Server chạy tại http://localhost:3000
```

### Build Production

```bash
npm run build
# Output: dist/
```

### Preview Production Build

```bash
npm run preview
```

### Environment Variables

Tạo file `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

**Lưu ý**: Vite yêu cầu prefix `VITE_` cho environment variables.

### Deployment

Build output trong `dist/` có thể deploy lên:
- **Vercel**: Tự động detect Vite project
- **Netlify**: Deploy `dist/` folder
- **Nginx**: Serve static files từ `dist/`
- **AWS S3 + CloudFront**: Static hosting

### Vite Configuration

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
})
```

---

## 📝 Best Practices

### 1. Component Organization
- Mỗi component trong folder riêng
- File CSS cùng tên với component
- Export qua `index.js` để import gọn

### 2. Naming Conventions
- Components: PascalCase (`Navigation.jsx`)
- CSS files: PascalCase (`Navigation.css`)
- CSS classes: kebab-case (`.nav-container`)
- Functions: camelCase (`getUserProfile`)
- Constants: UPPER_SNAKE_CASE (`API_ENDPOINTS`)

### 3. Error Handling
- Sử dụng try-catch cho async operations
- Hiển thị error messages cho user (Ant Design message)
- Log errors để debug

### 4. Loading States
- Hiển thị loading spinner khi fetch data
- Disable buttons khi đang submit
- Skeleton screens cho better UX

### 5. Code Splitting
- Lazy load tất cả pages
- Code splitting tự động với Vite

### 6. Performance Optimization
- Memoization với `useMemo`, `useCallback`
- AbortController để cancel requests
- Image lazy loading
- Pagination cho large lists

---

## 🔍 Key Features Summary

### User Features
- ✅ Tìm kiếm và lọc phòng
- ✅ Xem chi tiết phòng với hover preview
- ✅ Đặt phòng với dịch vụ kèm theo
- ✅ Thanh toán qua PayOS (QR code + payment link)
- ✅ Xem lịch sử đặt phòng
- ✅ Đánh giá booking
- ✅ Profile management
- ✅ Chatbot hỗ trợ AI
- ✅ Tin tức và dịch vụ

### Admin Features
- ✅ Dashboard với thống kê
- ✅ Quản lý bookings (check-in/out, cancel, refund)
- ✅ Quản lý rooms và room types
- ✅ Quản lý giá phòng theo khung thời gian
- ✅ Quản lý dịch vụ và khuyến mãi
- ✅ Quản lý bài viết và categories
- ✅ Quản lý đánh giá
- ✅ Báo cáo và export
- ✅ Quản lý người dùng
- ✅ In hóa đơn VAT

### Technical Features
- ✅ Responsive design
- ✅ Lazy loading
- ✅ Code splitting
- ✅ Error handling
- ✅ Loading states
- ✅ Token-based authentication
- ✅ Route protection
- ✅ Local storage management
- ✅ API integration
- ✅ Real-time payment status polling

---

## 📚 Tài Liệu Tham Khảo

- [React Documentation](https://react.dev/)
- [React Router v7](https://reactrouter.com/)
- [Ant Design](https://ant.design/)
- [Vite](https://vitejs.dev/)
- [Framer Motion](https://www.framer.com/motion/)
- [Dayjs](https://day.js.org/)
- [PayOS Documentation](https://payos.vn/docs/)

---

**Tài liệu này được tạo tự động dựa trên source code frontend của dự án Bean Hotel Booking System.**

*Cập nhật lần cuối: 2024*


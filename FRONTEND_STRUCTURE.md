# Tài Liệu Cấu Trúc Frontend - Booking Hotel

## 📋 Tổng Quan

Frontend được xây dựng bằng **React 18** với **Vite** build tool, sử dụng **React Router v7** cho routing và **Ant Design** cho UI components. Hệ thống được tổ chức theo cấu trúc component-based với CSS modules riêng biệt cho mỗi component/page.

---

## 🏗️ Cấu Trúc Thư Mục

```
booking-hotel/
├── src/
│   ├── main.jsx                 # Entry point, setup providers
│   ├── App.jsx                  # Root component với Router
│   ├── App.css                  # Global app styles
│   ├── index.css                # Base CSS reset & global styles
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx        # Định nghĩa tất cả routes
│   │
│   ├── layouts/                 # Layout components
│   │   ├── UserLayout.jsx       # Layout cho user pages (Navigation + Footer)
│   │   └── AdminLayout.jsx      # Layout cho admin pages (Sidebar + Header)
│   │
│   ├── context/                 # React Context providers
│   │   └── AuthContext.jsx      # Authentication context
│   │
│   ├── components/              # Reusable components
│   │   ├── Navigation/          # Header navigation
│   │   │   ├── Navigation.jsx
│   │   │   ├── Navigation.css
│   │   │   └── index.js
│   │   ├── Footer/              # Footer component
│   │   ├── BookingWidget/       # Booking search widget
│   │   ├── BookingModal/        # Booking modal
│   │   ├── ChatBot/             # AI Chatbot component
│   │   ├── RoomList/            # Room listing component
│   │   ├── HomeNews/            # News section for home
│   │   ├── WhyChooseUs/         # Why choose us section
│   │   ├── Testimonials/        # Testimonials section
│   │   ├── Moments/             # Moments gallery
│   │   ├── ServiceSelector/     # Service selection component
│   │   ├── CheckInOut/          # Check-in/out component
│   │   ├── Loading/             # Loading spinner
│   │   ├── MessageNotification/ # Notification component
│   │   ├── PopupAdvertisement/  # Popup ads
│   │   ├── ScrollToTop/         # Scroll to top button
│   │   ├── AuthGuard/           # Route protection
│   │   └── CategoryManager/     # Category management
│   │
│   ├── pages/                   # Page components
│   │   ├── Home/                # Trang chủ
│   │   │   ├── Home.jsx
│   │   │   ├── Home.css
│   │   │   └── index.js
│   │   ├── Hotels/              # Danh sách khách sạn
│   │   ├── RoomDetail/          # Chi tiết phòng
│   │   ├── About/               # Giới thiệu
│   │   ├── Services/            # Danh sách dịch vụ
│   │   ├── ServiceDetail/       # Chi tiết dịch vụ
│   │   ├── News/                # Danh sách tin tức
│   │   ├── NewsDetail/          # Chi tiết tin tức
│   │   ├── Contact/             # Liên hệ
│   │   ├── Gallery/             # Thư viện ảnh
│   │   ├── Authentication/      # Login/Register
│   │   ├── ProfileUser/         # Profile người dùng
│   │   ├── UserBookingHistory/  # Lịch sử đặt phòng
│   │   ├── BookingConfirmation/ # Xác nhận đặt phòng
│   │   ├── Payment/             # Thanh toán
│   │   ├── PaymentSuccess/      # Thanh toán thành công
│   │   ├── BookingSuccess/      # Đặt phòng thành công
│   │   ├── VerifyEmail/         # Xác minh email
│   │   ├── ResetPassword/       # Đặt lại mật khẩu
│   │   ├── RegistrationSuccess/ # Đăng ký thành công
│   │   ├── TermsOfService/      # Điều khoản dịch vụ
│   │   ├── PrivacyPolicy/       # Chính sách bảo mật
│   │   ├── CookiePolicy/        # Chính sách cookie
│   │   ├── NotFound/            # 404 page
│   │   ├── AccessDenied/        # 403 page
│   │   └── Admin/               # Admin pages
│   │       ├── Dashboard.jsx
│   │       ├── Users.jsx
│   │       ├── Hotel/           # Quản lý khách sạn
│   │       ├── RoomType/        # Quản lý loại phòng
│   │       ├── Room/            # Quản lý phòng
│   │       ├── RoomPrice/       # Quản lý giá phòng
│   │       ├── Booking/         # Quản lý đặt phòng
│   │       ├── Promotion/       # Quản lý khuyến mãi
│   │       ├── Service/         # Quản lý dịch vụ
│   │       ├── Posts/           # Quản lý bài viết
│   │       ├── Review/          # Quản lý đánh giá
│   │       └── Reports/         # Báo cáo thống kê
│   │
│   ├── services/                # API service layer
│   │   ├── httpClient.js        # HTTP client (fetch wrapper)
│   │   ├── index.js             # Export all services
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
│   ├── hooks/                   # Custom React hooks
│   │   ├── hotels.js
│   │   ├── posts.js
│   │   ├── roomtype.js
│   │   └── service.js
│   │
│   ├── constants/               # Constants & configs
│   │   ├── apiEndpoints.js      # API endpoints constants
│   │   ├── adminApi.js
│   │   ├── amenities.js
│   │   └── roomCategories.js
│   │
│   ├── utils/                   # Utility functions
│   │   ├── formatPrice.js       # Format giá tiền
│   │   └── pendingPayment.util.js
│   │
│   ├── data/                    # Mock data (nếu có)
│   │   ├── mockNews.js
│   │   └── mockPosts.js
│   │
│   └── assets/                  # Static assets
│       ├── images/              # Hình ảnh
│       └── react.svg
│
├── public/                      # Public static files
├── package.json
├── vite.config.js              # Vite configuration
└── CSS_STRUCTURE.md            # Tài liệu về cấu trúc CSS
```

---

## 🎨 Cách Tổ Chức Style (CSS)

### Nguyên Tắc Tổ Chức

1. **Mỗi component/page có file CSS riêng**
   - Component: `ComponentName.css` trong folder `ComponentName/`
   - Page: `PageName.css` trong folder `PageName/`

2. **Import CSS trong component tương ứng**
   ```jsx
   import './ComponentName.css'
   ```

3. **Global styles**
   - `index.css`: Base reset, global styles
   - `App.css`: App-level layout styles

### Cấu Trúc CSS File

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

.component-name__content {
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

### Ví Dụ Cấu Trúc Component

```
components/
└── Navigation/
    ├── Navigation.jsx          # Component logic
    ├── Navigation.css          # Component styles
    └── index.js                # Export component
```

**Navigation.jsx:**
```jsx
import React from 'react'
import './Navigation.css'
// ... component code
```

**Navigation.css:**
```css
.navigation {
  /* Navigation styles */
}

.nav-container {
  /* Container styles */
}

/* Responsive */
@media (max-width: 768px) {
  .navigation {
    /* Mobile styles */
  }
}
```

---

## 🔄 Routing Structure

### User Routes (UserLayout)
- `/` - Trang chủ
- `/hotels` - Danh sách khách sạn
- `/rooms/:id` - Chi tiết phòng
- `/about` - Giới thiệu
- `/services` - Dịch vụ
- `/services/:slug` - Chi tiết dịch vụ
- `/news` - Tin tức
- `/news/:slug` - Chi tiết tin tức
- `/gallery` - Thư viện ảnh
- `/contact` - Liên hệ
- `/login` - Đăng nhập
- `/register` - Đăng ký
- `/user/profile` - Profile
- `/user/bookings` - Lịch sử đặt phòng
- `/booking-confirmation` - Xác nhận đặt phòng
- `/payment` - Thanh toán
- `/payment/success` - Thanh toán thành công
- `/booking-success` - Đặt phòng thành công

### Admin Routes (AdminLayout)
- `/admin` - Dashboard
- `/admin/users` - Quản lý người dùng
- `/admin/hotels` - Quản lý khách sạn
- `/admin/room-types` - Quản lý loại phòng
- `/admin/rooms` - Quản lý phòng
- `/admin/room-prices` - Quản lý giá phòng
- `/admin/bookings` - Quản lý đặt phòng
- `/admin/promotions` - Quản lý khuyến mãi
- `/admin/services` - Quản lý dịch vụ
- `/admin/posts` - Quản lý bài viết
- `/admin/reviews` - Quản lý đánh giá
- `/admin/reports` - Báo cáo thống kê

### Route Protection
- **AuthGuard**: Bảo vệ routes cần đăng nhập
- **AdminRoute**: Bảo vệ admin routes (chỉ admin mới truy cập được)

---

## 🔐 Authentication & State Management

### AuthContext
- **Provider**: `AuthProvider` trong `main.jsx`
- **Hook**: `useAuth()` để truy cập auth state
- **State**:
  - `user`: Thông tin user hiện tại
  - `accessToken`: JWT token
  - `isAuthenticated`: Boolean
  - `loading`: Loading state
- **Methods**:
  - `login(credentials)`: Đăng nhập
  - `logout()`: Đăng xuất

### Token Storage
- Token được lưu trong `localStorage` với key `accessToken`
- User info được lưu trong `localStorage` với key `user`

---

## 🌐 API Integration

### HTTP Client (`services/httpClient.js`)

**Features:**
- Base URL từ environment variable `VITE_API_BASE_URL`
- Tự động attach Bearer token từ localStorage
- Hỗ trợ JSON và FormData
- Request timeout (default 15s)
- Error handling

**Usage:**
```jsx
import http from './services/httpClient'

// GET request
const data = await http.get('/users/profile')

// POST request
const result = await http.post('/auth/login', { email, password })

// PUT request
await http.put('/users/profile', { full_name: 'John' })

// DELETE request
await http.delete('/users/123')
```

### Service Layer Pattern

Mỗi domain có service riêng:
- `authentication.service.js` - Auth APIs
- `user.service.js` - User APIs
- `hotel.service.js` - Hotel APIs
- `booking.service.js` - Booking APIs
- etc.

**Example:**
```jsx
// services/authentication.service.js
import http from './httpClient'
import { AUTH } from '../constants/apiEndpoints'

export async function login(payload) {
  return http.post(AUTH.LOGIN, payload)
}

export async function register(payload) {
  return http.post(AUTH.REGISTER, payload)
}
```

### API Endpoints Constants

Tất cả endpoints được định nghĩa trong `constants/apiEndpoints.js`:

```jsx
export const AUTH = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  // ...
}
```

---

## 🎯 Component Patterns

### 1. Functional Components với Hooks
```jsx
import React, { useState, useEffect } from 'react'
import './Component.css'

function Component() {
  const [state, setState] = useState(null)
  
  useEffect(() => {
    // Side effects
  }, [])
  
  return <div className="component">Content</div>
}

export default Component
```

### 2. Component với Index Export
```jsx
// ComponentName/index.js
export { default } from './ComponentName'
```

### 3. Custom Hooks
```jsx
// hooks/roomtype.js
import { useState, useEffect } from 'react'
import { getRoomTypes } from '../services/roomtype.service'

export function useRoomTypes() {
  const [roomTypes, setRoomTypes] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Fetch data
  }, [])
  
  return { roomTypes, loading }
}
```

---

## 📦 Dependencies

### Core
- **react** (^18.3.1): React library
- **react-dom** (^18.3.1): React DOM
- **react-router-dom** (^7.8.2): Routing

### UI Framework
- **antd** (5.27.2): Ant Design component library
- **@ant-design/icons** (6.0.1): Ant Design icons

### Utilities
- **dayjs** (^1.11.18): Date manipulation
- **framer-motion** (^12.23.24): Animations
- **react-quill** (^2.0.0): Rich text editor
- **qrcode.react** (^4.2.0): QR code generation

### Authentication
- **@react-oauth/google** (^0.12.2): Google OAuth

### Build Tool
- **vite** (^7.1.2): Build tool & dev server
- **@vitejs/plugin-react** (^5.0.0): Vite React plugin

---

## 🎨 Styling Approach

### 1. CSS Modules Pattern
- Mỗi component có CSS file riêng
- Class names theo BEM-like convention
- Scoped styles (không global)

### 2. Global Styles
- `index.css`: Base reset, typography
- `App.css`: App-level layout

### 3. Responsive Design
- Mobile-first approach
- Media queries trong mỗi CSS file
- Ant Design Grid system cho layout

### 4. Color Scheme
- Primary: `#c08a19` (Gold)
- Text: `#1f2937` (Dark gray)
- Background: `#ffffff` (White)
- Hover: `#f3f4f6` (Light gray)

---

## 🔧 Build & Development

### Development
```bash
npm run dev
# Server chạy tại http://localhost:3000
```

### Build
```bash
npm run build
# Output: dist/
```

### Preview Production Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

---

## 📱 Responsive Breakpoints

Sử dụng Ant Design Grid breakpoints:
- **xs**: < 576px (Mobile)
- **sm**: ≥ 576px (Tablet)
- **md**: ≥ 768px (Small desktop)
- **lg**: ≥ 992px (Desktop)
- **xl**: ≥ 1200px (Large desktop)
- **xxl**: ≥ 1600px (Extra large)

**Usage:**
```jsx
import { Grid } from 'antd'
const { useBreakpoint } = Grid

function Component() {
  const screens = useBreakpoint()
  const isMobile = screens.xs
  
  return <div>{isMobile ? 'Mobile' : 'Desktop'}</div>
}
```

---

## 🚀 Environment Variables

Tạo file `.env` trong root:

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:5000/api

# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

**Lưu ý**: Vite yêu cầu prefix `VITE_` cho environment variables.

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

### 3. File Structure
```
ComponentName/
├── ComponentName.jsx    # Component logic
├── ComponentName.css    # Component styles
└── index.js             # Export
```

### 4. Import Order
```jsx
// 1. React & libraries
import React from 'react'
import { useState } from 'react'

// 2. Third-party components
import { Button } from 'antd'

// 3. Internal components
import Navigation from '../components/Navigation'

// 4. Services & utils
import { getUserProfile } from '../services/user.service'

// 5. Styles
import './Component.css'
```

### 5. Error Handling
- Sử dụng try-catch cho async operations
- Hiển thị error messages cho user
- Log errors để debug

### 6. Loading States
- Hiển thị loading spinner khi fetch data
- Disable buttons khi đang submit
- Skeleton screens cho better UX

---

## 🎯 Key Features

### 1. Authentication Flow
- Login/Register với email/password
- Google OAuth login
- Email verification
- Password reset
- Protected routes

### 2. Booking Flow
- Search rooms với filters
- Booking widget trên homepage
- Booking confirmation
- Payment integration (PayOS)
- Booking success page

### 3. Admin Dashboard
- Sidebar navigation
- CRUD operations cho tất cả entities
- Reports & statistics
- User management

### 4. User Features
- Profile management
- Booking history
- Reviews & ratings
- Service booking

### 5. UI/UX Features
- Responsive design
- Animations (Framer Motion)
- Loading states
- Error handling
- Toast notifications (Ant Design)
- Chatbot AI integration

---

## 🔍 Code Examples

### Custom Hook Example
```jsx
// hooks/roomtype.js
import { useState, useEffect } from 'react'
import { getRoomTypes } from '../services/roomtype.service'

export function useRoomTypes() {
  const [roomTypes, setRoomTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    async function fetchRoomTypes() {
      try {
        setLoading(true)
        const data = await getRoomTypes()
        setRoomTypes(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchRoomTypes()
  }, [])
  
  return { roomTypes, loading, error }
}
```

### Service Example
```jsx
// services/booking.service.js
import http from './httpClient'
import { BOOKINGS } from '../constants/apiEndpoints'

export async function createBooking(payload) {
  return http.post(BOOKINGS.CREATE, payload)
}

export async function getMyBookings() {
  return http.get(BOOKINGS.LIST)
}

export async function getBookingById(id) {
  return http.get(BOOKINGS.DETAIL.replace(':id', id))
}
```

### Component với API Call
```jsx
import React, { useState, useEffect } from 'react'
import { getMyBookings } from '../services/booking.service'
import './Bookings.css'

function Bookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchBookings() {
      try {
        const data = await getMyBookings()
        setBookings(data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchBookings()
  }, [])
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div className="bookings">
      {bookings.map(booking => (
        <div key={booking.id}>{booking.code}</div>
      ))}
    </div>
  )
}

export default Bookings
```

---

## 📚 Tài Liệu Tham Khảo

- [React Documentation](https://react.dev/)
- [React Router v7](https://reactrouter.com/)
- [Ant Design](https://ant.design/)
- [Vite](https://vitejs.dev/)
- [Framer Motion](https://www.framer.com/motion/)

---

**Tài liệu này được tạo tự động dựa trên source code frontend.**



# Cấu trúc CSS trong dự án Hotel Booking

## 📁 Tổ chức file CSS

### 1. **App.css** - Layout chính
- Reset CSS và base styles
- Layout chung cho toàn bộ ứng dụng
- Main content container

### 2. **components/common.css** - Component chung
- Button styles (btn, btn-primary, btn-success, btn-danger)
- Card styles
- Form styles
- Loading spinner
- Utility classes (margin, padding, text-align)

### 3. **components/Navigation.css** - Navigation component
- Navigation bar styling
- Menu items
- Logo và buttons
- Responsive design

### 4. **pages/Home.css** - Trang chủ
- Home page layout
- Features grid
- Typography cho trang chủ

### 5. **pages/Hotels.css** - Trang khách sạn
- Hotels page layout
- Search section
- Hotel cards grid
- Booking buttons

### 6. **pages/About.css** - Trang giới thiệu
- About page layout
- About sections
- Contact information

### 7. **pages/NotFound.css** - Trang 404
- Error page styling
- Back to home button

## 🎯 Cách sử dụng

### Import CSS trong component:
```jsx
import React from 'react'
import './ComponentName.css'  // CSS riêng cho component
import '../components/common.css'  // CSS chung (nếu cần)
```

### Import CSS trong page:
```jsx
import React from 'react'
import './PageName.css'  // CSS riêng cho page
```

## 🔧 Quy tắc đặt tên

- **Component CSS**: `ComponentName.css`
- **Page CSS**: `PageName.css`
- **Common CSS**: `common.css`
- **Layout CSS**: `App.css`

## 📱 Responsive Design

Mỗi file CSS đều có media queries riêng cho mobile:
```css
@media (max-width: 768px) {
  /* Mobile styles */
}
```

## 🎨 Color Scheme

- **Primary**: #667eea (Blue)
- **Success**: #27ae60 (Green)
- **Danger**: #e74c3c (Red)
- **Text**: #2c3e50 (Dark)
- **Text Light**: #7f8c8d (Gray)
- **Background**: #f5f7fa (Light Gray)

## 🚀 Lợi ích của cấu trúc này

1. **Dễ bảo trì**: Mỗi component/page có CSS riêng
2. **Tái sử dụng**: Common CSS cho các component chung
3. **Performance**: Chỉ load CSS cần thiết
4. **Teamwork**: Dễ dàng phân chia công việc
5. **Scalability**: Dễ dàng mở rộng khi thêm component/page mới

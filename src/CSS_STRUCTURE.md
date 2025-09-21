# Cấu trúc CSS trong dự án Hotel Booking

## 📁 Tổ chức file CSS theo folder

### 1. **App.css** - Layout chính
- Reset CSS và base styles
- Layout chung cho toàn bộ ứng dụng
- Main content container

### 2. **components/Navigation/** - Navigation component
```
Navigation/
├── Navigation.jsx      # Component logic
├── Navigation.css      # Component styles
└── index.js           # Export component
```

### 3. **pages/Home/** - Trang chủ
```
Home/
├── Home.jsx           # Page component
├── Home.css           # Page styles
└── index.js           # Export component
```

### 4. **pages/Hotels/** - Trang khách sạn
```
Hotels/
├── Hotels.jsx         # Page component
├── Hotels.css         # Page styles
└── index.js           # Export component
```

### 5. **pages/About/** - Trang giới thiệu
```
About/
├── About.jsx          # Page component
├── About.css          # Page styles
└── index.js           # Export component
```

### 6. **pages/NotFound/** - Trang 404
```
NotFound/
├── NotFound.jsx       # Page component
├── NotFound.css       # Page styles
└── index.js           # Export component
```

## 🎯 Cách sử dụng

### Import component/page:
```jsx
// Sử dụng index.js (khuyến nghị)
import Home from '../pages/Home'
import Navigation from '../components/Navigation'

// Hoặc import trực tiếp
import Home from '../pages/Home/Home'
import Navigation from '../components/Navigation/Navigation'
```

### Import CSS:
```jsx
// CSS được import trong component/page tương ứng
import './ComponentName.css'
```

## 🔧 Quy tắc đặt tên

- **Folder**: `ComponentName/` hoặc `PageName/`
- **Component**: `ComponentName.jsx`
- **CSS**: `ComponentName.css`
- **Export**: `index.js`

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

## 🚀 Lợi ích của cấu trúc folder

1. **Tổ chức rõ ràng**: Mỗi component/page có folder riêng
2. **Dễ bảo trì**: Tất cả file liên quan ở cùng một nơi
3. **Tái sử dụng**: Dễ dàng copy/paste component
4. **Teamwork**: Mỗi developer có thể làm việc trên folder riêng
5. **Scalability**: Dễ dàng mở rộng khi thêm component/page mới
6. **Clean imports**: Sử dụng index.js để import gọn gàng

## 📋 Cấu trúc tổng thể

```
src/
├── components/
│   └── Navigation/
│       ├── Navigation.jsx
│       ├── Navigation.css
│       └── index.js
├── pages/
│   ├── Home/
│   │   ├── Home.jsx
│   │   ├── Home.css
│   │   └── index.js
│   ├── Hotels/
│   │   ├── Hotels.jsx
│   │   ├── Hotels.css
│   │   └── index.js
│   ├── About/
│   │   ├── About.jsx
│   │   ├── About.css
│   │   └── index.js
│   └── NotFound/
│       ├── NotFound.jsx
│       ├── NotFound.css
│       └── index.js
├── routes/
│   └── AppRoutes.jsx
├── App.jsx
├── App.css
└── index.css
```

# Booking Hotel FE
Giao diện đặt phòng khách sạn với trải nghiệm người dùng đầy đủ (tìm phòng, xem chi tiết, đặt phòng, tin tức, liên hệ, chatbot) và trang quản trị (quản lý đặt phòng, phòng, giá, báo cáo, dịch vụ).

## Tính năng chính
- **Khách hàng**: tìm kiếm & lọc phòng, xem chi tiết phòng (modal hover/click), đặt phòng, xem tin tức & chi tiết tin, thư viện ảnh, liên hệ, chatbot hỗ trợ.
- **Quản trị**: quản lý đặt phòng (check-in/out, hủy kèm hoàn tiền), quản lý phòng & giá theo khung thời gian, báo cáo doanh thu, thêm dịch vụ vào booking, in hóa đơn.
- **UI/UX**: Ant Design 5, responsive layout, hover preview, breadcrumb thống nhất, trạng thái tải/empty rõ ràng.

## Công nghệ
- React 18, Vite
- Ant Design 5, Recharts / @ant-design/plots
- React Router v7
- Dayjs (plugins isSameOrAfter/isSameOrBefore)

## Cấu trúc thư mục (chính)
- `src/pages`: các trang người dùng (Home, Hotels, Services, News, NewsDetail, Gallery, Contact, ...)  
- `src/pages/Admin`: trang quản trị (Booking, Room, Reports, ...)  
- `src/components`: thành phần dùng lại (ChatBot, RoomList, CheckInOut, ...)  
- `src/services`: hàm gọi API (axios/httpClient)  
- `src/utils`: tiện ích (format giá, ngày, ...)  
- `src/assets`: hình ảnh, icon tĩnh

## Cài đặt & chạy
```bash
npm install
npm run dev       # chạy chế độ dev (mặc định mở trình duyệt)
npm run build     # build production
npm run preview   # xem thử bản build
npm run lint      # kiểm tra lint
```

## Cấu hình môi trường
Tạo file `.env` (hoặc `.env.local`) nếu cần cấu hình endpoint API/khóa tích hợp. Ví dụ:
```
VITE_API_BASE_URL=https://api.example.com
```

## Ghi chú triển khai
- Build ra thư mục `dist/`, sẵn sàng deploy tĩnh (Nginx, Vercel, Netlify...).
- Đảm bảo cấu hình `VITE_API_BASE_URL` phù hợp môi trường.

## Liên hệ / góp ý
- Mở issue hoặc tạo pull request nếu bạn muốn đóng góp thêm tính năng / sửa lỗi.***

import React, { useMemo, Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Loading from '../components/Loading'
import { useAuth } from '../context/AuthContext'
import UserLayout from '../layouts/UserLayout'
import AdminLayout from '../layouts/AdminLayout'
import AuthGuard from '../components/AuthGuard'

// Lazy load tất cả các pages
const Home = lazy(() => import('../pages/Home'))
const Hotels = lazy(() => import('../pages/Hotels'))
const About = lazy(() => import('../pages/About'))
const News = lazy(() => import('../pages/News'))
const NewsDetail = lazy(() => import('../pages/NewsDetail'))
const Contact = lazy(() => import('../pages/Contact'))
const Services = lazy(() => import('../pages/Services'))
const ServiceDetail = lazy(() => import('../pages/ServiceDetail'))
const Authentication = lazy(() => import('../pages/Authentication'))
const ProfileUser = lazy(() => import('../pages/ProfileUser'))
const UserBookingHistory = lazy(() => import('../pages/UserBookingHistory'))
const TermsOfService = lazy(() => import('../pages/TermsOfService'))
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'))
const CookiePolicy = lazy(() => import('../pages/CookiePolicy'))
const CancellationPolicy = lazy(() => import('../pages/CancellationPolicy'))
const NotFound = lazy(() => import('../pages/NotFound'))
const AccessDenied = lazy(() => import('../pages/AccessDenied'))
const Dashboard = lazy(() => import('../pages/Admin/Dashboard'))
const Users = lazy(() => import('../pages/Admin/Users'))
const AdminHotels = lazy(() => import('../pages/Admin/Hotel'))
const AdminRoomTypes = lazy(() => import('../pages/Admin/RoomType'))
const AdminRooms = lazy(() => import('../pages/Admin/Room'))
const AdminRoomPrices = lazy(() => import('../pages/Admin/RoomPrice'))
const AdminPosts = lazy(() => import('../pages/Admin/Posts'))
const RegistrationSuccess = lazy(() => import('../pages/RegistrationSuccess'))
const VerifyEmail = lazy(() => import('../pages/VerifyEmail'))
const RoomDetail = lazy(() => import('../pages/RoomDetail'))
const PromotionManagement = lazy(() => import('../pages/Admin/Promotion'))
const ServiceManagement = lazy(() => import('../pages/Admin/Service'))
const ReviewManagement = lazy(() => import('../pages/Admin/Review'))
const BookingConfirmation = lazy(() => import('../pages/BookingConfirmation'))
const Payment = lazy(() => import('../pages/Payment'))
const PaymentSuccess = lazy(() => import('../pages/PaymentSuccess/PaymentSuccess'))
const BookingManagement = lazy(() => import('../pages/Admin/Booking'))
const GalleryPage = lazy(() => import('../pages/Gallery'))
const FAQ = lazy(() => import('../pages/FAQ/FAQ'))
const RoomChangePolicy = lazy(() => import('../pages/RoomChangePolicy/RoomChangePolicy'))
const VATInvoice = lazy(() => import('../pages/VATInvoice/VATInvoice'))
const ReviewPage = lazy(() => import('../pages/Review/Review'))
const Reports = lazy(() => import('../pages/Admin/Reports/Reports'))
const AdminProfile = lazy(() => import('../pages/Admin/Profile/AdminProfile'))
const PaymentRefund = lazy(() => import('../pages/PaymentRefund/PaymentRefund'))
const ResetPassword = lazy(() => import('../pages/ResetPassword/ResetPassword'))

function AppRoutes() {
  const { user, loading } = useAuth()
  
  // Sử dụng user từ context hoặc localStorage (tránh race condition khi login)
  const currentUser = useMemo(() => {
    if (user) return user
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        return JSON.parse(storedUser)
      }
    } catch (e) {
      return null
    }
    return null
  }, [user])
  
  const isAdmin = currentUser?.role === 'admin'

  const AdminRoute = ({ children }) => {
    // Nếu đang loading, hiển thị loading indicator
    if (loading) {
      return <Loading message="Đang xác thực quyền truy cập..." />
    }

    // Kiểm tra token trong localStorage
    const token = localStorage.getItem('accessToken')
    
    // Nếu không có token hoặc user, chuyển về trang đăng nhập
    if (!token || !currentUser) {
      return <Navigate to="/login" replace />
    }
    
    // Nếu không phải admin, chặn truy cập
    if (!isAdmin) {
      return <Navigate to="/access-denied" replace />
    }
    return children
  }

  return (
    <Routes>
      {/* User layout */}
      <Route element={<UserLayout />}>
        <Route path="/" element={
          <Suspense fallback={<Loading message="Đang tải trang chủ..." />}>
            <Home />
          </Suspense>
        } />
        <Route path="/hotels" element={
          <Suspense fallback={<Loading message="Đang tải danh sách khách sạn..." />}>
            <Hotels />
          </Suspense>
        } />
        <Route path="/rooms/:id" element={
          <Suspense fallback={<Loading message="Đang tải thông tin phòng..." />}>
            <RoomDetail />
          </Suspense>
        } />
        <Route path="/booking-confirmation" element={
          <Suspense fallback={<Loading message="Đang tải xác nhận đặt phòng..." />}>
            <BookingConfirmation />
          </Suspense>
        } />
        <Route path="/payment" element={
          <Suspense fallback={<Loading message="Đang tải trang thanh toán..." />}>
            <Payment />
          </Suspense>
        } />
        <Route path="/payment/success" element={
          <Suspense fallback={<Loading message="Đang tải..." />}>
            <PaymentSuccess />
          </Suspense>
        } />
        <Route path="/about" element={
          <Suspense fallback={<Loading message="Đang tải giới thiệu..." />}>
            <About />
          </Suspense>
        } />
        <Route path="/news" element={
          <Suspense fallback={<Loading message="Đang tải tin tức..." />}>
            <News />
          </Suspense>
        } />
        <Route path="/news/:slug" element={
          <Suspense fallback={<Loading message="Đang tải bài viết..." />}>
            <NewsDetail />
          </Suspense>
        } />
        <Route path="/contact" element={
          <Suspense fallback={<Loading message="Đang tải liên hệ..." />}>
            <Contact />
          </Suspense>
        } />
        <Route path="/services" element={
          <Suspense fallback={<Loading message="Đang tải dịch vụ..." />}>
            <Services />
          </Suspense>
        } />
        <Route path="/services/:slug" element={
          <Suspense fallback={<Loading message="Đang tải chi tiết dịch vụ..." />}>
            <ServiceDetail />
          </Suspense>
        } />
        <Route path="/gallery" element={
          <Suspense fallback={<Loading message="Đang tải thư viện ảnh..." />}>
            <GalleryPage />
          </Suspense>
        } />
        <Route path="/faq" element={
          <Suspense fallback={<Loading message="Đang tải câu hỏi thường gặp..." />}>
            <FAQ />
          </Suspense>
        } />
        <Route path="/room-change-policy" element={
          <Suspense fallback={<Loading message="Đang tải..." />}>
            <RoomChangePolicy />
          </Suspense>
        } />
        <Route path="/hoa-don-vat" element={
          <Suspense fallback={<Loading message="Đang tải thông tin hóa đơn VAT..." />}>
            <VATInvoice />
          </Suspense>
        } />
        <Route path="/review/:code" element={
          <Suspense fallback={<Loading message="Đang tải trang đánh giá..." />}>
            <ReviewPage />
          </Suspense>
        } />
        <Route path="/login" element={
          <Suspense fallback={<Loading message="Đang tải..." />}>
            <AuthGuard><Authentication /></AuthGuard>
          </Suspense>
        } />
        <Route path="/register" element={
          <Suspense fallback={<Loading message="Đang tải..." />}>
            <AuthGuard><Authentication /></AuthGuard>
          </Suspense>
        } />
        <Route path="/register/success" element={
          <Suspense fallback={<Loading message="Đang tải..." />}>
            <RegistrationSuccess />
          </Suspense>
        } />
        <Route path="/verify-email" element={
          <Suspense fallback={<Loading message="Đang tải..." />}>
            <VerifyEmail />
          </Suspense>
        } />
        <Route path="/reset-password" element={
          <Suspense fallback={<Loading message="Đang tải..." />}>
            <ResetPassword />
          </Suspense>
        } />
        <Route path="/user/profile" element={
          <Suspense fallback={<Loading message="Đang tải thông tin cá nhân..." />}>
            <ProfileUser />
          </Suspense>
        } />
        <Route path="/user/bookings" element={
          <Suspense fallback={<Loading message="Đang tải lịch sử đặt phòng..." />}>
            <UserBookingHistory />
          </Suspense>
        } />
        <Route path="/terms-of-service" element={
          <Suspense fallback={<Loading message="Đang tải..." />}>
            <TermsOfService />
          </Suspense>
        } />
        <Route path="/privacy-policy" element={
          <Suspense fallback={<Loading message="Đang tải..." />}>
            <PrivacyPolicy />
          </Suspense>
        } />
        <Route path="/cookie-policy" element={
          <Suspense fallback={<Loading message="Đang tải..." />}>
            <CookiePolicy />
          </Suspense>
        } />
        <Route path="/cancellation-policy" element={
          <Suspense fallback={<Loading message="Đang tải..." />}>
            <CancellationPolicy />
          </Suspense>
        } />
        <Route path="/thanh-toan" element={
          <Suspense fallback={<Loading message="Đang tải..." />}>
            <PaymentRefund />
          </Suspense>
        } />
        <Route path="*" element={
          <Suspense fallback={<Loading message="Đang tải..." />}>
            <NotFound />
          </Suspense>
        } />
      </Route>

      {/* Admin layout - hoàn toàn tách biệt */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={
          <AdminRoute>
            <Suspense fallback={<Loading message="Đang tải trang quản trị..." />}>
              <Dashboard />
            </Suspense>
          </AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute>
            <Suspense fallback={<Loading message="Đang tải quản lý người dùng..." />}>
              <Users />
            </Suspense>
          </AdminRoute>
        } />
        <Route path="/admin/hotels" element={
          <AdminRoute>
            <Suspense fallback={<Loading message="Đang tải quản lý khách sạn..." />}>
              <AdminHotels />
            </Suspense>
          </AdminRoute>
        } />
        <Route path="/admin/room-types" element={
          <AdminRoute>
            <Suspense fallback={<Loading message="Đang tải quản lý loại phòng..." />}>
              <AdminRoomTypes />
            </Suspense>
          </AdminRoute>
        } />
        <Route path="/admin/rooms" element={
          <AdminRoute>
            <Suspense fallback={<Loading message="Đang tải quản lý phòng..." />}>
              <AdminRooms />
            </Suspense>
          </AdminRoute>
        } />
        <Route path="/admin/room-prices" element={
          <AdminRoute>
            <Suspense fallback={<Loading message="Đang tải quản lý giá phòng..." />}>
              <AdminRoomPrices />
            </Suspense>
          </AdminRoute>
        } />
        <Route path="/admin/bookings" element={
          <AdminRoute>
            <Suspense fallback={<Loading message="Đang tải quản lý đặt phòng..." />}>
              <BookingManagement />
            </Suspense>
          </AdminRoute>
        } />
        <Route path="/admin/promotions" element={
          <AdminRoute>
            <Suspense fallback={<Loading message="Đang tải quản lý khuyến mãi..." />}>
              <PromotionManagement />
            </Suspense>
          </AdminRoute>
        } />
        <Route path="/admin/posts" element={
          <AdminRoute>
            <Suspense fallback={<Loading message="Đang tải quản lý bài viết..." />}>
              <AdminPosts />
            </Suspense>
          </AdminRoute>
        } />
        <Route path="/admin/services" element={
          <AdminRoute>
            <Suspense fallback={<Loading message="Đang tải quản lý dịch vụ..." />}>
              <ServiceManagement />
            </Suspense>
          </AdminRoute>
        } />
        <Route path="/admin/reviews" element={
          <AdminRoute>
            <Suspense fallback={<Loading message="Đang tải quản lý đánh giá..." />}>
              <ReviewManagement />
            </Suspense>
          </AdminRoute>
        } />
        <Route path="/admin/reports" element={
          <AdminRoute>
            <Suspense fallback={<Loading message="Đang tải báo cáo..." />}>
              <Reports />
            </Suspense>
          </AdminRoute>
        } />
        <Route path="/admin/profile" element={
          <AdminRoute>
            <Suspense fallback={<Loading message="Đang tải thông tin cá nhân..." />}>
              <AdminProfile />
            </Suspense>
          </AdminRoute>
        } />
      </Route>

      {/* Common */}
      <Route path="/access-denied" element={
        <Suspense fallback={<Loading message="Đang tải..." />}>
          <AccessDenied />
        </Suspense>
      } />
    </Routes>
  )
}

export default AppRoutes

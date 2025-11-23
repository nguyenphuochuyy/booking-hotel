import React, { useMemo } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Loading from '../components/Loading'
import Home from '../pages/Home'
import Hotels from '../pages/Hotels'
import About from '../pages/About'
import News from '../pages/News'
import NewsDetail from '../pages/NewsDetail'
import Contact from '../pages/Contact'
import Services from '../pages/Services'
import ServiceDetail from '../pages/ServiceDetail'
import Authentication from '../pages/Authentication'
import ProfileUser from '../pages/ProfileUser'
import UserBookingHistory from '../pages/UserBookingHistory'
import TermsOfService from '../pages/TermsOfService'
import PrivacyPolicy from '../pages/PrivacyPolicy'
import CookiePolicy from '../pages/CookiePolicy'
import CancellationPolicy from '../pages/CancellationPolicy'
import NotFound from '../pages/NotFound'
import AccessDenied from '../pages/AccessDenied'
import Dashboard from '../pages/Admin/Dashboard'
import Users from '../pages/Admin/Users'
import AdminHotels from '../pages/Admin/Hotel'
import AdminRoomTypes from '../pages/Admin/RoomType'
import AdminRooms from '../pages/Admin/Room'
import AdminRoomPrices from '../pages/Admin/RoomPrice'
import AdminPosts from '../pages/Admin/Posts'
import { useAuth } from '../context/AuthContext'
import UserLayout from '../layouts/UserLayout'
import AdminLayout from '../layouts/AdminLayout'
import RegistrationSuccess from '../pages/RegistrationSuccess'
import VerifyEmail from '../pages/VerifyEmail'
import RoomDetail from '../pages/RoomDetail'
import AuthGuard from '../components/AuthGuard'
import PromotionManagement from '../pages/Admin/Promotion'
import ServiceManagement from '../pages/Admin/Service'
import ReviewManagement from '../pages/Admin/Review'
import BookingConfirmation from '../pages/BookingConfirmation'
import Payment from '../pages/Payment'
import PaymentSuccess from '../pages/PaymentSuccess/PaymentSuccess'
import BookingManagement from '../pages/Admin/Booking'
import GalleryPage from '../pages/Gallery'
import Reports from '../pages/Admin/Reports/Reports'

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
        <Route path="/" element={<Home />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />
        <Route path="/booking-confirmation" element={<BookingConfirmation />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/about" element={<About />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:slug" element={<NewsDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<ServiceDetail />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/login" element={
          <AuthGuard><Authentication /></AuthGuard>
        } />
        <Route path="/register" element={
          <AuthGuard><Authentication /></AuthGuard>
        } />
        <Route path="/register/success" element={<RegistrationSuccess />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/user/profile" element={<ProfileUser />} />
        <Route path="/user/bookings" element={<UserBookingHistory />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/cancellation-policy" element={<CancellationPolicy />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin layout - hoàn toàn tách biệt */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute>
            <Users />
          </AdminRoute>
        } />
        <Route path="/admin/hotels" element={
          <AdminRoute>
            <AdminHotels />
          </AdminRoute>
        } />
        <Route path="/admin/room-types" element={
          <AdminRoute>
            <AdminRoomTypes />
          </AdminRoute>
        } />
        <Route path="/admin/rooms" element={
          <AdminRoute>
            <AdminRooms />
          </AdminRoute>
        } />
        <Route path="/admin/room-prices" element={
          <AdminRoute>
            <AdminRoomPrices />
          </AdminRoute>
        } />
        <Route path="/admin/bookings" element={
          <AdminRoute>
            <BookingManagement />
          </AdminRoute>
        } />
        <Route path="/admin/promotions" element={
          <AdminRoute>
            <PromotionManagement/>
          </AdminRoute>
        } />
        <Route path="/admin/posts" element={
          <AdminRoute>
            <AdminPosts />
          </AdminRoute>
        } />
        <Route path="/admin/services" element={
          <AdminRoute>
            <ServiceManagement />
          </AdminRoute>
        } />
        <Route path="/admin/reviews" element={
          <AdminRoute>
            <ReviewManagement />
          </AdminRoute>
        } />
        <Route path="/admin/reports" element={
          <AdminRoute>
            <Reports />
          </AdminRoute>
        } />
        <Route path="/admin/profile" element={
          <AdminRoute>
            <div>Thông tin cá nhân</div>
          </AdminRoute>
        } />
        <Route path="/admin/settings" element={
          <AdminRoute>
            <div>Cài đặt</div>
          </AdminRoute>
        } />
      </Route>

      {/* Common */}
      <Route path="/access-denied" element={<AccessDenied />} />
    </Routes>
  )
}

export default AppRoutes

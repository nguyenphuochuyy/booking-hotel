import React, { useMemo, lazy, Suspense } from 'react'
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
        <Route path="/faq" element={<FAQ />} />
        <Route path="/room-change-policy" element={<RoomChangePolicy />} />
        <Route path="/hoa-don-vat" element={<VATInvoice />} />
        <Route path="/review/:code" element={<ReviewPage />} />
        <Route path="/login" element={
          <AuthGuard><Authentication /></AuthGuard>
        } />
        <Route path="/register" element={
          <AuthGuard><Authentication /></AuthGuard>
        } />
        <Route path="/register/success" element={<RegistrationSuccess />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/user/profile" element={<ProfileUser />} />
        <Route path="/user/bookings" element={<UserBookingHistory />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/cancellation-policy" element={<CancellationPolicy />} />
        <Route path="/thanh-toan" element={<PaymentRefund />} />
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
            <AdminProfile />
          </AdminRoute>
        } />
      </Route>

      {/* Common - không có layout */}
      <Route path="/access-denied" element={
        <Suspense fallback={<Loading message="Đang tải..." />}>
          <AccessDenied />
        </Suspense>
      } />
    </Routes>
  )
}

export default AppRoutes

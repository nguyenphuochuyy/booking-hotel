import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from '../pages/Home'
import Hotels from '../pages/Hotels'
import About from '../pages/About'
import Booking from '../pages/Booking'
import News from '../pages/News'
import Contact from '../pages/Contact'
import Services from '../pages/Services'
import ServiceDetail from '../pages/ServiceDetail'
import Authentication from '../pages/Authentication'
import ProfileUser from '../pages/ProfileUser'
import UserBookingHistory from '../pages/UserBookingHistory'
import TermsOfService from '../pages/TermsOfService'
import PrivacyPolicy from '../pages/PrivacyPolicy'
import CookiePolicy from '../pages/CookiePolicy'
import NotFound from '../pages/NotFound'
import AccessDenied from '../pages/AccessDenied'
import Admin from '../pages/Admin'
import { useAuth } from '../context/AuthContext'
import UserLayout from '../layouts/UserLayout'
import AdminLayout from '../layouts/AdminLayout'
import RegistrationSuccess from '../pages/RegistrationSuccess'
import VerifyEmail from '../pages/VerifyEmail'
import RoomDetail from '../pages/RoomDetail'
import AuthGuard from '../components/AuthGuard'

function AppRoutes() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const AdminRoute = ({ children }) => {
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
        <Route path="/about" element={<About />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/news" element={<News />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<ServiceDetail />} />
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
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin layout - hoàn toàn tách biệt */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={
          <AdminRoute><Admin /></AdminRoute>
        } />
      </Route>

      {/* Common */}
      <Route path="/access-denied" element={<AccessDenied />} />
    </Routes>
  )
}

export default AppRoutes

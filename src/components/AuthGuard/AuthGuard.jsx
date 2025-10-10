import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * AuthGuard - Chặn user đã đăng nhập truy cập vào trang login/register
 * Nếu user đã đăng nhập, điều hướng về trang chủ
 */
function AuthGuard({ children }) {
  const { user, isAuthenticated } = useAuth()

  // Nếu đã đăng nhập, chuyển về trang chủ
  if (isAuthenticated && user) {
    return <Navigate to="/" replace />
  }

  // Nếu chưa đăng nhập, cho phép truy cập
  return children
}

export default AuthGuard


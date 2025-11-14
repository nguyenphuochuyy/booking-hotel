import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import authenticationService from '../services/authentication.service'
import { getUserProfile } from '../services/user.service'
import { useNavigate } from 'react-router-dom'
import { clearAllTempBookings } from '../utils/pendingPayment.util'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (token) {
          setAccessToken(token)
          // Khi có token, cố gắng tải hồ sơ user
          try {
            const data = await getUserProfile()
            if (data?.user) {
              setUser(data.user)
            }
          } catch (error) {
            // Token không hợp lệ hoặc hết hạn, xóa tất cả dữ liệu liên quan
            localStorage.removeItem('accessToken')
            localStorage.removeItem('user')
            clearAllTempBookings()
            setAccessToken(null)
            setUser(null)
          }
        } else {
          // Không có token, xóa user và temp bookings nếu còn sót lại
          const hasUser = localStorage.getItem('user')
          if (hasUser) {
            localStorage.removeItem('user')
            clearAllTempBookings()
          }
        }
      } catch (_err) {
        // Nếu có lỗi, clear tất cả dữ liệu
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        clearAllTempBookings()
        setAccessToken(null)
        setUser(null)
      } finally {
        // Chỉ set loading=false sau khi đã check xong
        setLoading(false)
      }
    }
    
    initAuth()
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await authenticationService.login(credentials)
    console.log("data", data);
    
    const token = data?.accessToken || data?.token
    if (token) {
      try { localStorage.setItem('accessToken', token) } catch (_err) {}
      setAccessToken(token)
      // Fetch user profile ngay sau khi login
      try {
        const profileData = await getUserProfile()
        if (profileData?.user) {
          setUser(profileData.user)
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
        // Nếu API trả về thông tin user trong response login, dùng nó
        if (data?.user) { 
          setUser(data.user)
        }
      }
    }
    return data
  }, [])

  const logout = useCallback(() => {
    try {
      // Lấy userId trước khi xóa user để xóa temp bookings của user đó
      const rawUser = localStorage.getItem('user')
      let userId = null
      if (rawUser) {
        try {
          const user = JSON.parse(rawUser)
          userId = user?.user_id || user?.id || user?.userId
        } catch (_e) {}
      }
      
      // Xóa tất cả dữ liệu
      localStorage.removeItem('accessToken') 
      localStorage.removeItem('user')
      localStorage.removeItem('pendingPaymentExpiry')
      localStorage.removeItem('pendingPayment')
      localStorage.removeItem('chatbot_session_id')
      
      // Xóa tất cả temp bookings (của user hiện tại và các user khác nếu có)
      clearAllTempBookings()
    } catch (_err) {
      console.error('Error during logout:', _err)
    }
    setAccessToken(null)
    setUser(null)
  }, [])

  const value = useMemo(() => ({
    user,
    setUser,
    accessToken,
    setAccessToken,
    isAuthenticated: Boolean(accessToken),
    loading,
    login,
    logout,
  }), [user, accessToken, loading, login, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

export default AuthContext



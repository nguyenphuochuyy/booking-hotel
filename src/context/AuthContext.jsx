import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import authenticationService from '../services/authentication.service'
import { getUserProfile } from '../services/user.service'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const token = localStorage.getItem('accessToken')
      if (token) {
        setAccessToken(token)
        // Khi có token, cố gắng tải hồ sơ user
        getUserProfile()
          .then((data) => {
            if (data?.user) setUser(data.user)
          })
          .catch(() => {})
      }
    } catch (_err) {}
    setLoading(false)
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await authenticationService.login(credentials)
    const token = data?.accessToken || data?.token
    if (token) {
      try { localStorage.setItem('accessToken', token) } catch (_err) {}
      setAccessToken(token)
    }
    // Nếu API trả về thông tin user, lưu lại
    if (data?.user) {
      setUser(data.user)
    }
    return data
  }, [])

  const logout = useCallback(() => {
    try { localStorage.removeItem('accessToken') } catch (_err) {}
    setAccessToken(null)
    setUser(null)
  }, [])

  const value = useMemo(() => ({
    user,
    setUser,
    accessToken,
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



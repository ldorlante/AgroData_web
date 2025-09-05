/**
 * Authentication Hook
 * Provides authentication utilities and automatic token refresh handling
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated())
  const [user, setUser] = useState(authService.getCurrentUser())
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Check token validity periodically
  useEffect(() => {
    const checkTokenValidity = async () => {
      if (authService.isAuthenticated()) {
        try {
          const result = await authService.ensureValidToken()
          if (!result.success && result.shouldRedirectToLogin) {
            handleTokenExpiration()
          }
        } catch (error) {
          console.error('Token validity check failed:', error)
          if (error.shouldRedirectToLogin) {
            handleTokenExpiration()
          }
        }
      }
    }

    // Check token validity every 5 minutes
    const interval = setInterval(checkTokenValidity, 5 * 60 * 1000)
    
    // Initial check
    checkTokenValidity()

    return () => clearInterval(interval)
  }, [])

  const handleTokenExpiration = useCallback(() => {
    setIsAuthenticated(false)
    setUser(null)
    authService.clearAuthData()
    navigate('/login', { replace: true })
  }, [navigate])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const result = await authService.login(email, password)
      if (result.success) {
        setIsAuthenticated(true)
        setUser(result.data.user || null)
      }
      return result
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await authService.logout()
      setIsAuthenticated(false)
      setUser(null)
      navigate('/login', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    setLoading(true)
    try {
      const result = await authService.register(userData)
      return result
    } finally {
      setLoading(false)
    }
  }

  const refreshToken = async () => {
    try {
      const result = await authService.refreshToken()
      if (!result.success && result.shouldRedirectToLogin) {
        handleTokenExpiration()
      }
      return result
    } catch (error) {
      console.error('Token refresh failed:', error)
      handleTokenExpiration()
      throw error
    }
  }

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    register,
    refreshToken,
    handleTokenExpiration,
  }
}

export default useAuth

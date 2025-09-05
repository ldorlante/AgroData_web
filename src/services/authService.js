/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import apiService from './apiService'
import { API_ENDPOINTS } from '../config/api'

class AuthService {
  /**
   * Login user
   */
  async login(email, password) {
    try {
      const response = await apiService.post(API_ENDPOINTS.auth.login, {
        email: email.trim(),
        password,
      })

      // Store authentication data
      if (response.token) {
        localStorage.setItem('authToken', response.token)
        localStorage.setItem('user', JSON.stringify(response.user || {}))
        
        // Store refresh token if provided
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken)
        }
        
        // Store token expiration if provided
        if (response.expiresIn) {
          const expirationTime = Date.now() + (response.expiresIn * 1000)
          localStorage.setItem('tokenExpiration', expirationTime.toString())
        }
      }

      return {
        success: true,
        data: response,
        message: '¡Login exitoso!',
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status,
      }
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await apiService.post(API_ENDPOINTS.auth.logout)
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error)
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('tokenExpiration')
      localStorage.removeItem('user')
    }

    return { success: true }
  }

  /**
   * Register new user
   */
  async register(userData) {
    try {
      const response = await apiService.post(API_ENDPOINTS.auth.register, userData)
      return {
        success: true,
        data: response,
        message: 'Registro exitoso',
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status,
      }
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken() {
    try {
      const currentRefreshToken = localStorage.getItem('refreshToken')
      
      if (!currentRefreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await apiService.post(API_ENDPOINTS.auth.refreshToken, {
        refreshToken: currentRefreshToken
      })
      
      // Update tokens in localStorage
      if (response.token) {
        localStorage.setItem('authToken', response.token)
      }

      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken)
      }

      // Update token expiration if provided
      if (response.expiresIn) {
        const expirationTime = Date.now() + (response.expiresIn * 1000)
        localStorage.setItem('tokenExpiration', expirationTime.toString())
      }

      // Update user data if provided
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user))
      }

      return {
        success: true,
        data: response,
        message: 'Token actualizado exitosamente',
      }
    } catch (error) {
      // If refresh fails, logout user
      console.error('Token refresh failed:', error)
      await this.logout()
      return {
        success: false,
        error: error.message,
        status: error.status,
        shouldRedirectToLogin: true,
      }
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(email) {
    try {
      const response = await apiService.post(API_ENDPOINTS.auth.forgotPassword, {
        email: email.trim(),
      })

      return {
        success: true,
        data: response,
        message: 'Email de recuperación enviado',
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status,
      }
    }
  }

  /**
   * Reset password
   */
  async resetPassword(token, password) {
    try {
      const response = await apiService.post(API_ENDPOINTS.auth.resetPassword, {
        token,
        password,
      })

      return {
        success: true,
        data: response,
        message: 'Contraseña restablecida exitosamente',
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status,
      }
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('authToken')
  }

  /**
   * Get current user data
   */
  getCurrentUser() {
    try {
      const userData = localStorage.getItem('user')
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error('Error parsing user data:', error)
      return null
    }
  }

  /**
   * Get current auth token
   */
  getToken() {
    return localStorage.getItem('authToken')
  }

  /**
   * Get current refresh token
   */
  getRefreshToken() {
    return localStorage.getItem('refreshToken')
  }

  /**
   * Check if token is expired or about to expire
   */
  isTokenExpired() {
    const expirationTime = localStorage.getItem('tokenExpiration')
    if (!expirationTime) {
      return false // If no expiration time is set, assume token is valid
    }

    const currentTime = Date.now()
    const expiration = parseInt(expirationTime)
    
    // Consider token expired if it expires in the next 5 minutes (300000 ms)
    return currentTime >= (expiration - 300000)
  }

  /**
   * Check if refresh token is available
   */
  hasRefreshToken() {
    return !!localStorage.getItem('refreshToken')
  }

  /**
   * Automatically refresh token if needed
   */
  async ensureValidToken() {
    if (!this.isAuthenticated()) {
      return { success: false, error: 'No auth token available' }
    }

    if (this.isTokenExpired() && this.hasRefreshToken()) {
      console.log('Token expired, attempting to refresh...')
      return await this.refreshToken()
    }

    return { success: true, message: 'Token is valid' }
  }

  /**
   * Clear all authentication data
   */
  clearAuthData() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('tokenExpiration')
    localStorage.removeItem('user')
  }
}

// Export singleton instance
export default new AuthService()

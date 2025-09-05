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
      const response = await apiService.post(API_ENDPOINTS.auth.refreshToken)
      
      if (response.token) {
        localStorage.setItem('authToken', response.token)
      }

      return {
        success: true,
        data: response,
      }
    } catch (error) {
      // If refresh fails, logout user
      this.logout()
      return {
        success: false,
        error: error.message,
        status: error.status,
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
}

// Export singleton instance
export default new AuthService()

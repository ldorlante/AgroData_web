/**
 * API Service
 * Centralized service for making HTTP requests with proper error handling,
 * timeouts, retries, and authentication
 */

import { API_CONFIG, HTTP_STATUS, ERROR_MESSAGES } from '../config/api'

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL
    this.timeout = API_CONFIG.timeout
    this.retryAttempts = API_CONFIG.retryAttempts
    this.retryDelay = API_CONFIG.retryDelay
  }

  /**
   * Get authentication token from localStorage
   */
  getAuthToken() {
    return localStorage.getItem('authToken')
  }

  /**
   * Get default headers for requests
   */
  getDefaultHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    const token = this.getAuthToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return headers
  }

  /**
   * Fetch with timeout and retry logic
   */
  async fetchWithTimeout(url, options, timeout = this.timeout) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('TIMEOUT_ERROR')
      }
      throw error
    }
  }

  /**
   * Make HTTP request with retry logic and automatic token refresh
   */
  async makeRequest(endpoint, options = {}, retryCount = 0) {
    // Skip token refresh for auth endpoints to avoid infinite loops
    const isAuthEndpoint = endpoint.includes('/Auth/')
    
    // Try to ensure valid token before making request (except for auth endpoints)
    if (!isAuthEndpoint) {
      try {
        // Dynamic import to avoid circular dependency
        const { default: authService } = await import('./authService')
        const tokenResult = await authService.ensureValidToken()
        
        if (!tokenResult.success && tokenResult.error === 'No auth token available') {
          // User is not authenticated, let the request proceed and handle 401
        } else if (!tokenResult.success && tokenResult.shouldRedirectToLogin) {
          // Token refresh failed, user should be redirected to login
          throw new Error('TOKEN_REFRESH_FAILED')
        }
      } catch (error) {
        if (error.message === 'TOKEN_REFRESH_FAILED') {
          throw error
        }
        // If token refresh fails for other reasons, continue with request
        console.warn('Token refresh check failed:', error)
      }
    }

    const url = `${this.baseURL}${endpoint}`
    const requestOptions = {
      ...options,
      headers: {
        ...this.getDefaultHeaders(),
        ...options.headers,
      },
    }

    try {
      const response = await this.fetchWithTimeout(url, requestOptions)
      
      // Handle 401 Unauthorized responses
      if (response.status === 401 && !isAuthEndpoint) {
        try {
          // Try to refresh token once
          const { default: authService } = await import('./authService')
          const refreshResult = await authService.refreshToken()
          
          if (refreshResult.success) {
            // Retry the original request with new token
            const newRequestOptions = {
              ...requestOptions,
              headers: {
                ...requestOptions.headers,
                ...this.getDefaultHeaders(), // Get updated headers with new token
              },
            }
            
            const retryResponse = await this.fetchWithTimeout(url, newRequestOptions)
            if (retryResponse.ok) {
              const contentType = retryResponse.headers.get('content-type')
              if (contentType && contentType.includes('application/json')) {
                return await retryResponse.json()
              }
            }
          }
        } catch (refreshError) {
          console.error('Token refresh failed during 401 handling:', refreshError)
        }
      }
      
      // Check if response is ok
      if (!response.ok) {
        const errorData = await this.handleErrorResponse(response)
        throw errorData
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('INVALID_RESPONSE')
      }

      return await response.json()
    } catch (error) {
      // Handle token refresh failure
      if (error.message === 'TOKEN_REFRESH_FAILED') {
        throw {
          status: 401,
          message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
          shouldRedirectToLogin: true,
        }
      }

      // Retry logic for network errors
      if (this.shouldRetry(error, retryCount)) {
        await this.delay(this.retryDelay * Math.pow(2, retryCount)) // Exponential backoff
        return this.makeRequest(endpoint, options, retryCount + 1)
      }

      throw this.formatError(error)
    }
  }

  /**
   * Handle error responses
   */
  async handleErrorResponse(response) {
    try {
      const errorData = await response.json()
      return {
        status: response.status,
        message: errorData.message || ERROR_MESSAGES[response.status] || 'Error desconocido',
        details: errorData,
      }
    } catch {
      return {
        status: response.status,
        message: ERROR_MESSAGES[response.status] || 'Error desconocido',
      }
    }
  }

  /**
   * Format error for consistent handling
   */
  formatError(error) {
    if (error.status) {
      return error // Already formatted error from API
    }

    if (error.message === 'TIMEOUT_ERROR') {
      return {
        status: 'TIMEOUT',
        message: ERROR_MESSAGES.TIMEOUT_ERROR,
      }
    }

    if (error.message === 'INVALID_RESPONSE') {
      return {
        status: 'INVALID_RESPONSE',
        message: ERROR_MESSAGES.INVALID_RESPONSE,
      }
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        status: 'NETWORK_ERROR',
        message: ERROR_MESSAGES.NETWORK_ERROR,
      }
    }

    return {
      status: 'UNKNOWN_ERROR',
      message: 'Error desconocido',
      details: error.message,
    }
  }

  /**
   * Determine if request should be retried
   */
  shouldRetry(error, retryCount) {
    if (retryCount >= this.retryAttempts) return false
    
    // Retry on network errors and specific HTTP status codes
    const retryableStatuses = [
      HTTP_STATUS.TOO_MANY_REQUESTS,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      HTTP_STATUS.BAD_GATEWAY,
      HTTP_STATUS.SERVICE_UNAVAILABLE,
    ]

    return (
      error.message === 'TIMEOUT_ERROR' ||
      error.name === 'TypeError' ||
      (error.status && retryableStatuses.includes(error.status))
    )
  }

  /**
   * Delay utility for retry logic
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // HTTP Methods
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    return this.makeRequest(url, { method: 'GET' })
  }

  async post(endpoint, data = {}) {
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put(endpoint, data = {}) {
    return this.makeRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async patch(endpoint, data = {}) {
    return this.makeRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async delete(endpoint) {
    return this.makeRequest(endpoint, { method: 'DELETE' })
  }
}

// Export singleton instance
export default new ApiService()

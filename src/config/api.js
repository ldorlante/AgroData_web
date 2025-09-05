/**
 * API Configuration for AgroData
 * Centralizes all API-related settings and utilities
 */

// Base API configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5142/api',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  retryAttempts: 3,
  retryDelay: 1000, // milliseconds
}

// Application configuration
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'AgroData',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  isDevelopment: import.meta.env.VITE_DEV_MODE === 'true',
  logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
}

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/Auth/login',
    logout: '/Auth/logout',
    register: '/Auth/register',
    refreshToken: '/Auth/refresh-token',
    forgotPassword: '/Auth/forgot-password',
    resetPassword: '/Auth/reset-password',
  },
  user: {
    profile: '/User/profile',
    updateProfile: '/User/profile',
    changePassword: '/User/change-password',
  },
  // Agregar más endpoints según sea necesario
}

// HTTP status codes for better error handling
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
}

// Error messages mapping
export const ERROR_MESSAGES = {
  [HTTP_STATUS.BAD_REQUEST]: 'Datos de entrada inválidos',
  [HTTP_STATUS.UNAUTHORIZED]: 'Credenciales incorrectas',
  [HTTP_STATUS.FORBIDDEN]: 'Acceso denegado',
  [HTTP_STATUS.NOT_FOUND]: 'Recurso no encontrado',
  [HTTP_STATUS.CONFLICT]: 'Conflicto con el estado actual',
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: 'Datos no procesables',
  [HTTP_STATUS.TOO_MANY_REQUESTS]: 'Demasiados intentos. Intenta más tarde',
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'Error interno del servidor',
  [HTTP_STATUS.BAD_GATEWAY]: 'Error del servidor proxy',
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: 'Servicio no disponible',
  NETWORK_ERROR: 'Error de conexión de red',
  TIMEOUT_ERROR: 'La petición tardó demasiado',
  INVALID_RESPONSE: 'Respuesta del servidor no válida',
}

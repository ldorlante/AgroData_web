# Sistema de Refresh Tokens - AgroData

## Descripción General

El sistema de refresh tokens implementado permite mantener a los usuarios autenticados de forma segura, renovando automáticamente los tokens de acceso cuando están a punto de expirar, sin requerir que el usuario inicie sesión nuevamente.

## Características Implementadas

### 1. AuthService Mejorado (`src/services/authService.js`)

- **Manejo completo de tokens**: Almacena y gestiona access tokens, refresh tokens y tiempos de expiración
- **Renovación automática**: Método `refreshToken()` que se comunica con el endpoint `/Auth/refresh-token`
- **Validación de tokens**: Verifica si los tokens están expirados o próximos a expirar
- **Limpieza segura**: Limpia todos los datos de autenticación cuando es necesario

#### Métodos principales:
```javascript
// Verificar si el token está expirado
authService.isTokenExpired()

// Asegurar que el token sea válido
authService.ensureValidToken()

// Renovar token manualmente
authService.refreshToken()

// Verificar si hay refresh token disponible
authService.hasRefreshToken()
```

### 2. ApiService Mejorado (`src/services/apiService.js`)

- **Interceptor automático**: Maneja automáticamente las respuestas 401 Unauthorized
- **Renovación transparente**: Intenta renovar tokens automáticamente cuando sea necesario
- **Prevención de bucles**: Evita bucles infinitos en endpoints de autenticación
- **Reintento inteligente**: Reintenta requests automáticamente después de renovar tokens

### 3. Hook de Autenticación (`src/hooks/useAuth.js`)

- **Gestión de estado**: Maneja el estado de autenticación en React
- **Verificación periódica**: Verifica tokens cada 5 minutos
- **Redirección automática**: Redirige al login cuando la sesión expira
- **API simplificada**: Proporciona métodos fáciles de usar para componentes

### 4. Componente de Ejemplo (`src/views/examples/AuthExample.js`)

Demuestra cómo usar el sistema correctamente.

## Configuración del Endpoint

El endpoint debe estar configurado en `src/config/api.js`:

```javascript
export const API_ENDPOINTS = {
  auth: {
    refreshToken: '/Auth/refresh-token',
    // ... otros endpoints
  }
}
```

## Uso en Componentes

### Opción 1: Usando el Hook useAuth

```javascript
import useAuth from '../hooks/useAuth'

const MyComponent = () => {
  const { isAuthenticated, user, logout } = useAuth()
  
  // El hook maneja automáticamente la renovación de tokens
  return (
    <div>
      {isAuthenticated ? (
        <p>Bienvenido, {user.nombre}</p>
      ) : (
        <p>No autenticado</p>
      )}
    </div>
  )
}
```

### Opción 2: Uso directo del AuthService

```javascript
import authService from '../services/authService'

// Verificar manualmente si el token necesita renovación
const checkToken = async () => {
  const result = await authService.ensureValidToken()
  if (!result.success && result.shouldRedirectToLogin) {
    // Redirigir al login
  }
}
```

### Opción 3: Llamadas a API (automático)

```javascript
import apiService from '../services/apiService'

// Las llamadas a la API manejan automáticamente la renovación de tokens
const fetchUserData = async () => {
  try {
    const userData = await apiService.get('/User/profile')
    return userData
  } catch (error) {
    if (error.shouldRedirectToLogin) {
      // El token no se pudo renovar, redirigir al login
    }
  }
}
```

## Flujo del Sistema

1. **Login exitoso**: Se almacenan access token, refresh token y tiempo de expiración
2. **Requests de API**: Antes de cada request, se verifica si el token está próximo a expirar
3. **Token expirado**: Se intenta renovar automáticamente usando el refresh token
4. **Respuesta 401**: Si una API devuelve 401, se intenta renovar el token y reintentar
5. **Refresh fallido**: Si el refresh token es inválido, se limpia la sesión y se redirige al login

## Configuración del Servidor

El endpoint `/Auth/refresh-token` debe:

### Request esperado:
```json
{
  "refreshToken": "string"
}
```

### Response exitoso:
```json
{
  "token": "nuevo_access_token",
  "refreshToken": "nuevo_refresh_token_opcional",
  "expiresIn": 3600,
  "user": {
    "nombre": "Usuario",
    "email": "user@example.com"
  }
}
```

### Response de error:
```json
{
  "message": "Refresh token inválido",
  "status": 401
}
```

## Seguridad

- Los tokens se almacenan en `localStorage` (considera usar `httpOnly cookies` para mayor seguridad)
- El refresh token se envía solo cuando es necesario
- Los tokens expirados se limpian automáticamente
- Se previenen bucles infinitos en la renovación de tokens

## Testing

Para probar el sistema:

1. Inicia sesión en la aplicación
2. Navega al componente `AuthExample`
3. Usa los botones para probar endpoints protegidos
4. Simula expiración de tokens modificando el tiempo en localStorage

## Próximos Pasos

- Implementar almacenamiento seguro de tokens (httpOnly cookies)
- Agregar logging de eventos de renovación
- Implementar notificaciones al usuario sobre renovaciones
- Agregar métricas de uso de tokens

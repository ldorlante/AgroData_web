/**
 * Example component showing how to use the authentication system with refresh tokens
 * This component demonstrates proper usage of the useAuth hook and API calls
 */

import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CRow,
  CAlert,
  CSpinner,
} from '@coreui/react'
import useAuth from '../../hooks/useAuth'
import apiService from '../../services/apiService'

const AuthExample = () => {
  const { isAuthenticated, user, logout, refreshToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ type: '', message: '', visible: false })

  const handleTestProtectedEndpoint = async () => {
    setLoading(true)
    setAlert({ type: '', message: '', visible: false })

    try {
      // Example of calling a protected endpoint
      // The apiService will automatically handle token refresh if needed
      const response = await apiService.get('/User/profile')
      
      setAlert({
        type: 'success',
        message: 'Endpoint protegido llamado exitosamente',
        visible: true
      })
      
      console.log('Protected endpoint response:', response)
    } catch (error) {
      console.error('Protected endpoint error:', error)
      
      if (error.shouldRedirectToLogin) {
        setAlert({
          type: 'warning',
          message: 'Sesión expirada. Serás redirigido al login.',
          visible: true
        })
      } else {
        setAlert({
          type: 'danger',
          message: error.message || 'Error al llamar endpoint protegido',
          visible: true
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleManualRefresh = async () => {
    setLoading(true)
    setAlert({ type: '', message: '', visible: false })

    try {
      const result = await refreshToken()
      
      if (result.success) {
        setAlert({
          type: 'success',
          message: 'Token actualizado exitosamente',
          visible: true
        })
      } else {
        setAlert({
          type: 'danger',
          message: result.error || 'Error al actualizar token',
          visible: true
        })
      }
    } catch (error) {
      setAlert({
        type: 'danger',
        message: 'Error al actualizar token',
        visible: true
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCard>
              <CCardHeader>
                <h4>Sistema de Autenticación</h4>
              </CCardHeader>
              <CCardBody>
                <p>Debes estar autenticado para ver este ejemplo.</p>
                <p>Por favor, inicia sesión primero.</p>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    )
  }

  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md={8}>
          <CCard>
            <CCardHeader>
              <h4>Ejemplo de Sistema de Refresh Tokens</h4>
            </CCardHeader>
            <CCardBody>
              {alert.visible && (
                <CAlert 
                  color={alert.type} 
                  dismissible 
                  onClose={() => setAlert({ ...alert, visible: false })}
                >
                  {alert.message}
                </CAlert>
              )}

              <div className="mb-3">
                <h5>Usuario actual:</h5>
                <p><strong>Nombre:</strong> {user?.nombre || 'No disponible'}</p>
                <p><strong>Email:</strong> {user?.email || 'No disponible'}</p>
              </div>

              <div className="d-grid gap-2">
                <CButton
                  color="primary"
                  onClick={handleTestProtectedEndpoint}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <CSpinner size="sm" className="me-2" />
                      Probando...
                    </>
                  ) : (
                    'Probar Endpoint Protegido'
                  )}
                </CButton>

                <CButton
                  color="info"
                  variant="outline"
                  onClick={handleManualRefresh}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <CSpinner size="sm" className="me-2" />
                      Actualizando...
                    </>
                  ) : (
                    'Actualizar Token Manualmente'
                  )}
                </CButton>

                <CButton
                  color="danger"
                  variant="outline"
                  onClick={logout}
                  disabled={loading}
                >
                  Cerrar Sesión
                </CButton>
              </div>

              <hr />

              <div className="mt-4">
                <h6>Información técnica:</h6>
                <ul>
                  <li>Los tokens se actualizan automáticamente cuando están a punto de expirar</li>
                  <li>Si una llamada a la API devuelve 401, se intenta actualizar el token automáticamente</li>
                  <li>Si el refresh token es inválido, el usuario es redirigido al login</li>
                  <li>Los tokens se verifican cada 5 minutos en segundo plano</li>
                </ul>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default AuthExample

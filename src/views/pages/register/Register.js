import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import authService from '../../../services/authService'

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ type: '', message: '', visible: false })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      setAlert({ type: 'danger', message: 'El nombre es requerido', visible: true })
      return false
    }
    if (!formData.email.trim()) {
      setAlert({ type: 'danger', message: 'El email es requerido', visible: true })
      return false
    }
    if (!formData.password) {
      setAlert({ type: 'danger', message: 'La contraseña es requerida', visible: true })
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setAlert({ type: 'danger', message: 'Las contraseñas no coinciden', visible: true })
      return false
    }
    if (formData.password.length < 6) {
      setAlert({ type: 'danger', message: 'La contraseña debe tener al menos 6 caracteres', visible: true })
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAlert({ type: '', message: '', visible: false })

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const registrationData = {
        nombre: formData.nombre.trim(),
        email: formData.email.trim(),
        password: formData.password,
      }

      const result = await authService.register(registrationData)

      if (result.success) {
        setAlert({ 
          type: 'success', 
          message: 'Registro exitoso. Ahora puedes iniciar sesión.', 
          visible: true 
        })
        // Limpiar el formulario
        setFormData({
          nombre: '',
          email: '',
          password: '',
          confirmPassword: '',
        })
      } else {
        setAlert({ 
          type: 'danger', 
          message: result.error || 'Error en el registro', 
          visible: true 
        })
      }
    } catch (error) {
      setAlert({ 
        type: 'danger', 
        message: 'Error de conexión. Intenta de nuevo.', 
        visible: true 
      })
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={handleSubmit}>
                  <h1>Registro</h1>
                  <p className="text-body-secondary">Crea tu cuenta</p>
                  
                  {alert.visible && (
                    <CAlert color={alert.type} dismissible onClose={() => setAlert({ ...alert, visible: false })}>
                      {alert.message}
                    </CAlert>
                  )}

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput 
                      name="nombre"
                      placeholder="Nombre completo" 
                      autoComplete="name"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </CInputGroup>
                  
                  <CInputGroup className="mb-3">
                    <CInputGroupText>@</CInputGroupText>
                    <CFormInput 
                      name="email"
                      type="email"
                      placeholder="Email" 
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </CInputGroup>
                  
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      name="password"
                      type="password"
                      placeholder="Contraseña"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </CInputGroup>
                  
                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirmar contraseña"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </CInputGroup>
                  
                  <div className="d-grid">
                    <CButton 
                      color="success" 
                      type="submit" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <CSpinner size="sm" className="me-2" />
                          Creando cuenta...
                        </>
                      ) : (
                        'Crear cuenta'
                      )}
                    </CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Register

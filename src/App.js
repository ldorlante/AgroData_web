import React, { Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'

// We use those styles to show code examples, you should remove them in your application.
import './scss/examples.scss'

// Auth Context
import { AuthProvider, useAuthContext } from './contexts/AuthContext'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
const PublicDashboardLayout = React.lazy(() => import('./public/layouts/PublicDashboardLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

// Components
const ProtectedRoute = React.lazy(() => import('./components/ProtectedRoute'))

// Componente interno para manejar el enrutamiento basado en autenticación
const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuthContext()

  // Mostrar spinner mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <CSpinner color="primary" size="lg" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route exact path="/login" name="Login Page" element={<Login />} />
      <Route exact path="/register" name="Register Page" element={<Register />} />
      <Route exact path="/404" name="Page 404" element={<Page404 />} />
      <Route exact path="/500" name="Page 500" element={<Page500 />} />
      
      {/* Rutas principales - dependen del estado de autenticación */}
      <Route 
        exact 
        path="/" 
        element={isAuthenticated ? <DefaultLayout /> : <PublicDashboardLayout />} 
      />
      <Route 
        exact 
        path="/dashboard" 
        name="Dashboard" 
        element={isAuthenticated ? <DefaultLayout /> : <PublicDashboardLayout />} 
      />
      
      {/* Rutas protegidas */}
      <Route 
        path="*" 
        name="Home" 
        element={
          <ProtectedRoute>
            <DefaultLayout />
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthProvider>
      <HashRouter>
        <Suspense
          fallback={
            <div className="pt-3 text-center">
              <CSpinner color="primary" variant="grow" />
            </div>
          }
        >
          <AppRoutes />
        </Suspense>
      </HashRouter>
    </AuthProvider>
  )
}

export default App

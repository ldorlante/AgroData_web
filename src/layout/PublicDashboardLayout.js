import React, { Suspense } from 'react'
import { CContainer, CSpinner } from '@coreui/react'
import Dashboard from '../views/dashboard/Dashboard'
import { PublicHeader } from '../components/header'

// Import styles
import '../scss/style.scss'
import '../scss/public-dashboard.scss'

const PublicDashboardLayout = () => {
  return (
    <div className="min-vh-100 d-flex flex-column public-dashboard-container">
      {/* Header */}
      <PublicHeader />
      
      {/* Content */}
      <main className="flex-grow-1 py-4">
        <CContainer lg>
          <Suspense fallback={<CSpinner color="primary" />}>
            <Dashboard />
          </Suspense>
        </CContainer>
      </main>
      
      {/* Footer */}
      <footer className="public-footer py-3 text-center">
        <CContainer>
          <small className="text-muted">
            © 2025 AgroData. Dashboard público - 
            <a href="/login" className="text-decoration-none ms-1">
              Iniciar sesión para acceder a todas las funciones
            </a>
          </small>
        </CContainer>
      </footer>
    </div>
  )
}

export default PublicDashboardLayout

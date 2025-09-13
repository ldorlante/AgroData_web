import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader, MobileBottomNav } from '../components/index'

const DefaultLayout = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
      <MobileBottomNav />
    </div>
  )
}

export default DefaultLayout

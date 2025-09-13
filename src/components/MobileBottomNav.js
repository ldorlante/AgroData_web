import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilChartPie,
  cilLocationPin,
  cilCalculator,
  cilMenu
} from '@coreui/icons'
import { useSelector, useDispatch } from 'react-redux'

const MobileBottomNav = () => {
  const location = useLocation()
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  const navigationItems = [
    {
      name: 'Dashboard',
      to: '/dashboard',
      icon: cilSpeedometer,
    },
    {
      name: 'Charts',
      to: '/charts',
      icon: cilChartPie,
    },
    {
      name: 'Maps',
      to: '/maps/agro-maps',
      icon: cilLocationPin,
    },
    {
      name: 'Widgets',
      to: '/widgets',
      icon: cilCalculator,
    },
    {
      name: 'Menu',
      action: 'menu',
      icon: cilMenu,
    },
  ]

  const handleMenuClick = () => {
    dispatch({ type: 'set', sidebarShow: !sidebarShow })
  }

  const isActive = (path) => {
    if (path === '/maps/agro-maps') {
      return location.pathname.startsWith('/maps')
    }
    return location.pathname === path
  }

  return (
    <div className="mobile-bottom-nav d-lg-none">
      <div className="mobile-bottom-nav-container">
        {navigationItems.map((item, index) => (
          <div key={index} className="mobile-nav-item">
            {item.action === 'menu' ? (
              <button 
                className="mobile-nav-button"
                onClick={handleMenuClick}
              >
                <CIcon icon={item.icon} size="lg" />
                <span className="mobile-nav-label">{item.name}</span>
              </button>
            ) : (
              <Link 
                to={item.to} 
                className={`mobile-nav-button ${isActive(item.to) ? 'active' : ''}`}
              >
                <CIcon icon={item.icon} size="lg" />
                <span className="mobile-nav-label">{item.name}</span>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MobileBottomNav

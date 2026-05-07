
import { useState } from 'react'
import './TopNavigation.css'

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

const TopNavigation = ({ userName = 'John Doe' }) => {
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <nav className="top-nav">
      <div className="nav-container">
        <div className="nav-left">
          <div className="nav-brand">
            <div className="htc-logo">
              <img src="/htc-logo.png" alt="HTC logo" />
            </div>
          </div>
        </div>

        <div className="nav-right">
          <div className="nav-actions">
            <button type="button" className="icon-btn" aria-label="Home">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 10L12 3L21 10V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="nav-user">
            <div className="user-menu-trigger" onClick={() => setShowUserMenu(!showUserMenu)}>
              <div className="user-avatar">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-greeting">{getGreeting()},</span>
                <span className="user-name">{userName}</span>
              </div>
              <svg
                className={`dropdown-icon ${showUserMenu ? 'active' : ''}`}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            {showUserMenu && (
              <div className="user-dropdown">
                <button type="button" className="dropdown-item">
                  Profile
                </button>
                <button type="button" className="dropdown-item">
                  Settings
                </button>
                <button type="button" className="dropdown-item">
                  Help
                </button>
                <div className="dropdown-divider" />
                <button type="button" className="dropdown-item logout">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default TopNavigation


import { useState } from 'react'
import './TopNavigation.css'

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

const SUPPORT_AGENTS = [
  { name: 'Sarah Mitchell', role: 'HR Onboarding Specialist', ext: '1042', available: true },
  { name: 'David Okafor',   role: 'People Operations',        ext: '1078', available: true },
  { name: 'Priya Nair',     role: 'Benefits & Compliance',    ext: '1055', available: false },
]

const CallSupportModal = ({ onClose }) => (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <div className="modal-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.5 10.81 19.79 19.79 0 01.44 2.18 2 2 0 012.42.01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h3>HR Support Line</h3>
          <p>Our team is ready to help you with onboarding questions.</p>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
      </div>

      <div className="modal-agents">
        {SUPPORT_AGENTS.map((agent) => (
          <div key={agent.ext} className="support-agent">
            <div className="agent-avatar">{agent.name.charAt(0)}</div>
            <div className="agent-info">
              <span className="agent-name">{agent.name}</span>
              <span className="agent-role">{agent.role}</span>
            </div>
            <div className="agent-right">
              <span className={`agent-status ${agent.available ? 'agent-status--on' : 'agent-status--off'}`}>
                {agent.available ? 'Available' : 'Busy'}
              </span>
              <a className="agent-ext" href={`tel:${agent.ext}`}>Ext. {agent.ext}</a>
            </div>
          </div>
        ))}
      </div>

      <div className="modal-footer">
        <div className="modal-helpline">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.5 10.81 19.79 19.79 0 01.44 2.18 2 2 0 012.42.01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>General HR Helpline: <strong>1-800-HTC-HELP</strong> · Mon–Fri, 8 AM–6 PM</span>
        </div>
        <button className="modal-dismiss" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
)

const TopNavigation = ({ userName = 'John Doe' }) => {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showCallModal, setShowCallModal] = useState(false)

  return (
    <>
    <nav className="top-nav">
      <div className="nav-container">
        <div className="nav-left">
          <div className="nav-brand">
            <div className="htc-logo">
              <img src="/htc-logo.png" alt="HTC logo" />
            </div>
            <div className="neo-logo">
              <img src="/neo-logo.svg" alt="Neo - New Employee Onboarding" />
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
            <button type="button" className="icon-btn" aria-label="Call Support" onClick={() => setShowCallModal(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.5 10.81 19.79 19.79 0 01.44 2.18 2 2 0 012.42.01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

    {showCallModal && <CallSupportModal onClose={() => setShowCallModal(false)} />}
  </>
  )
}

export default TopNavigation

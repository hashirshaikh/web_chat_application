import './WelcomePage.css'
import { useNavigate } from 'react-router-dom'

function WelcomePage({ user, onLogout }) {
  const navigate = useNavigate()
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-left">
          <h1 className="app-name">
            <svg className="app-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="url(#gradient)"/>
              <defs>
                <linearGradient id="gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#667eea"/>
                  <stop offset="1" stop-color="#764ba2"/>
                </linearGradient>
              </defs>
            </svg>
            iChat
          </h1>
          <p className="header-tagline">Secure conversations, seamless connections</p>
        </div>
        <div className="user-info">
          <div className="user-display">
            <span className="user-icon">👤</span>
            <span className="username">{user?.username || 'User'}</span>
          </div>
          <button onClick={onLogout} className="logout-button">Logout</button>
        </div>
      </div>
      
      <div className="dashboard-content">
        <h1 className="dashboard-title">Connect.   Chat.</h1>
        <h1 className="dashboard-subtitle">Collaborate.</h1>
        
        <div className="options-grid">
          <div className="option-card" onClick={() => navigate('/profile')}>
            <div className="option-icon">👤</div>
            <h3>Your Profile</h3>
            <p>View and edit your profile settings</p>
          </div>
          
          <div className="option-card" onClick={() => navigate('/create-chat')}>
            <div className="option-icon">➕</div>
            <h3>Create Chat Room</h3>
            <p>Start a new conversation room</p>
          </div>
          
          <div className="option-card" onClick={() => navigate('/join-chat')}>
            <div className="option-icon">🔍</div>
            <h3>Join Chat Room</h3>
            <p>Find and join existing rooms</p>
          </div>
          
          <div className="option-card" onClick={() => navigate('/chat-rooms')}>
            <div className="option-icon">💬</div>
            <h3>Your Chat Rooms</h3>
            <p>View all your active conversations</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomePage

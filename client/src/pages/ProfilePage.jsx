import './ProfilePage.css'
import { useState } from 'react'

function ProfilePage({ user, onUserUpdate, onBack }) {
  const [activeSection, setActiveSection] = useState(null)
  const [newUsername, setNewUsername] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUsernameChange = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/auth/update-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newUsername })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Username update failed')
      }

      setMessage('Username updated successfully!')
      onUserUpdate(data.user)
      setNewUsername('')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Password update failed')
      }

      setMessage('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="header-left">
          <h1 className="app-name">
            <svg className="app-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="url(#profilePageGradient)"/>
              <defs>
                <linearGradient id="profilePageGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
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
          <button onClick={onBack} className="back-button">Back</button>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-picture-section">
          <div className="profile-picture">
            <span className="profile-icon">👤</span>
          </div>
          <button 
            className="change-photo-btn"
            onClick={() => setActiveSection('photo')}
          >
            Change Profile Photo
          </button>
        </div>

        <div className="profile-options">
          <div 
            className={`option-item ${activeSection === 'username' ? 'active' : ''}`}
            onClick={() => setActiveSection('username')}
          >
            <div className="option-icon">📝</div>
            <div className="option-text">
              <h3>Change Username</h3>
              <p>Update your display name</p>
            </div>
          </div>

          <div 
            className={`option-item ${activeSection === 'password' ? 'active' : ''}`}
            onClick={() => setActiveSection('password')}
          >
            <div className="option-icon">🔒</div>
            <div className="option-text">
              <h3>Change Password</h3>
              <p>Update your password</p>
            </div>
          </div>
        </div>

        {activeSection === 'username' && (
          <div className="form-section">
            <h2>Change Username</h2>
            <form onSubmit={handleUsernameChange}>
              <div className="form-group">
                <label>New Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                  minLength={3}
                />
              </div>
              {message && (
                <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}
              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Username'}
                </button>
                <button type="button" onClick={() => setActiveSection(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {activeSection === 'password' && (
          <div className="form-section">
            <h2>Change Password</h2>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              {message && (
                <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}
              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
                <button type="button" onClick={() => setActiveSection(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {activeSection === 'photo' && (
          <div className="form-section">
            <h2>Change Profile Photo</h2>
            <p className="photo-note">Photo upload functionality coming soon!</p>
            <div className="form-actions">
              <button type="button" onClick={() => setActiveSection(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage

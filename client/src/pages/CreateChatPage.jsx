import './CreateChatPage.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatUI from '../components/ChatUI'
import { apiFetch } from '../api'

function CreateChatPage({ user, onBack, socket }) {
  const navigate = useNavigate()
  const [roomName, setRoomName] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [joined, setJoined] = useState(false)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [roomId, setRoomId] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!socket) return

    const handleReceiveMessage = (message) => {
      setMessages(prev => [...prev, message])
    }

    socket.on('receive-message', handleReceiveMessage)
    return () => {
      socket.off('receive-message', handleReceiveMessage)
    }
  }, [socket])

  const handleGenerateCode = async (e) => {
    e.preventDefault()
    if (roomName.trim()) {
      setLoading(true)
      setError('')
      try {
        const response = await apiFetch('/rooms/generateCode', {
          method: 'POST'
        })
        const data = await response.json()

        if (response.status === 401) {
          navigate('/auth')
          return
        }

        if (!response.ok) {
          throw new Error(data.message || 'Failed to generate code')
        }
        setGeneratedCode(data.code)
        setShowConfirmation(true)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleConfirmCreate = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await apiFetch('/rooms/create-room', {
        method: 'POST',
        body: JSON.stringify({ roomName, roomCode: generatedCode })
      })
      const data = await response.json()

      if (response.status === 401) {
        navigate('/auth')
        return
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create room')
      }

      // Join the shared socket room
      if (socket) {
        socket.emit('join-room', data.room._id)
      }

      setRoomId(data.room._id)
      setJoined(true)
      setIsAdmin(true)
      setShowConfirmation(false)

      // TODO: Load actual messages from backend
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleLeaveRoom = async () => {
    try {
      const response = await apiFetch(`/chats/leave-room/${roomId}`, {
        method: 'POST'
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.message || 'Failed to leave room')
        return
      }

      if (socket) {
        socket.emit('leave-room', roomId)
      }

      setJoined(false)
      setRoomId(null)
      setMessages([])
      setShowConfirmation(false)
      setGeneratedCode('')
      setRoomName('')
      setIsAdmin(false)
    } catch (err) {
      console.error('Failed to leave room:', err)
      setError('Failed to leave room')
    }
  }

  if (joined) {
    return (
      <div className="create-chat-container">
        {error && (
          <div className="error-notification">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
            <button onClick={() => setError('')} className="error-close">×</button>
          </div>
        )}
        <div className="chat-header">
          <button onClick={onBack} className="back-button">← Back</button>
          <div className="room-info">
            <h2>{roomName}</h2>
            <span className="room-status">Connected</span>
          </div>
          {!isAdmin && (
            <button onClick={handleLeaveRoom} className="leave-button">Leave Room</button>
          )}
        </div>
        <ChatUI
          messages={messages}
          currentUser={user?.username}
          socket={socket}
          roomId={roomId}
          userId={user?._id}
          onLocalMessage={(message) => setMessages(prev => [...prev, message])}
          className="chat-ui-full"
        />
      </div>
    )
  }

  return (
    <div className="create-chat-container">
      <div className="create-chat-header">
        <div className="header-left">
          <h1 className="app-name">
            <svg className="app-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="url(#createChatGradient)" />
              <defs>
                <linearGradient id="createChatGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#667eea" />
                  <stop offset="1" stop-color="#764ba2" />
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

      <div className="create-chat-content">
        {!showConfirmation ? (
          <div className="create-form-card">
            <h2>Create a Chat Room</h2>
            <p>Give your room a name and we'll generate a unique code</p>

            <form onSubmit={handleGenerateCode}>
              <div className="form-group">
                <label htmlFor="roomName">Room Name</label>
                <input
                  type="text"
                  id="roomName"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Enter room name (e.g., Project Discussion)"
                  required
                  maxLength={50}
                  disabled={loading}
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="create-button" disabled={loading}>
                {loading ? 'Generating...' : 'Generate Room Code'}
              </button>
            </form>

            <div className="help-text">
              <p>👥 Private rooms for every conversation</p>  
              <p>🔒 Share the code with others to let them join</p>
            </div>
          </div>
        ) : (
          <div className="confirmation-card">
            <div className="confirmation-icon">✨</div>
            <h2>Room Created!</h2>
            <p>Your room has been created successfully</p>

            <div className="code-display">
              <p className="code-label">Room Code</p>
              <div className="code-value">{generatedCode}</div>
              <p className="room-name-display">{roomName}</p>
            </div>

            <div className="confirmation-actions">
              <button onClick={handleConfirmCreate} className="confirm-button" disabled={loading}>
                {loading ? 'Creating...' : 'Create Room'}
              </button>
              <button onClick={() => setShowConfirmation(false)} className="cancel-button" disabled={loading}>
                Cancel
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="share-info">
              <p>📋 Share this code with others to join your room</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateChatPage

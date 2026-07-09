import './JoinChatPage.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatUI from '../components/ChatUI'
import { apiFetch } from '../api'

function JoinChatPage({ user, socket, onBack }) {
  const navigate = useNavigate()
  const [roomCode, setRoomCode] = useState('')
  const [roomName, setRoomName] = useState('')
  const [joined, setJoined] = useState(false)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [roomId, setRoomId] = useState(null)

  useEffect(() => {
    if (!socket || !roomId) return

    const handleReceiveMessage = (message) => {
      if (message.roomId !== roomId) return
      setMessages(prev => [...prev, message])
    }

    socket.on('receive-message', handleReceiveMessage)
    return () => {
      socket.off('receive-message', handleReceiveMessage)
    }
  }, [socket, roomId])

  useEffect(() => {
    return () => {
      if (socket && roomId) {
        socket.emit('leave-room', roomId)
      }
    }
  }, [socket, roomId])

  const handleJoinRoom = async (e) => {
    e.preventDefault()
    if (roomCode.trim()) {
      setLoading(true)
      setError('')
      try {
        const response = await apiFetch('/rooms/accept-code', {
          method: 'POST',
          body: JSON.stringify({ roomCode })
        })
        const data = await response.json()
        
        if (response.status === 401) {
          navigate('/auth')
          return
        }
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to join room')
        }
        
        if (!socket) {
          throw new Error('Socket is not connected yet')
        }

        socket.emit('join-room', data.room._id)
        setRoomId(data.room._id)
        setRoomName(data.room.roomName)
        setJoined(true)

        const messagesResponse = await apiFetch(`/chats/room/${data.room._id}/messages`, {
          method: 'GET'
        })

        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json()
          const sortedMessages = messagesData.msg.sort((a, b) =>
            new Date(a.createdAt) - new Date(b.createdAt)
          )
          const formattedMessages = sortedMessages.map(msg => ({
            sender: msg.senderUsername || 'Unknown',
            senderId: msg.sender_id,
            text: msg.message,
            time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }))
          setMessages(formattedMessages)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
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
      setRoomName('')
      setMessages([])
      setRoomCode('')
    } catch (err) {
      console.error('Failed to leave room:', err)
      setError('Failed to leave room')
    }
  }

  if (joined) {
    return (
      <div className="join-chat-container">
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
          <button onClick={handleLeaveRoom} className="leave-button">Leave Room</button>
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
    <div className="join-chat-container">
      <div className="join-chat-header">
        <div className="header-left">
          <h1 className="app-name">
            <svg className="app-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="url(#joinChatGradient)"/>
              <defs>
                <linearGradient id="joinChatGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
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

      <div className="join-chat-content">
        <div className="join-form-card">
          <h2>Join a Chat Room</h2>
          <p>Enter the room code to join an existing conversation</p>
          
          <form onSubmit={handleJoinRoom}>
            <div className="form-group">
              <label htmlFor="roomCode">Room Code</label>
              <input
                type="text"
                id="roomCode"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter room code (e.g., ABC123)"
                required
                maxLength={10}
                disabled={loading}
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" className="join-button" disabled={loading}>
              {loading ? 'Joining...' : 'Join Room'}
            </button>
          </form>

          <div className="help-text">
            <p>🚀 Instant message delivery</p>
            <p>💡 Room codes are 6 characters long</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JoinChatPage

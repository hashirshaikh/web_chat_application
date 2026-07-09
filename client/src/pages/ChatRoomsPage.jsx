import './ChatRoomsPage.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatUI from '../components/ChatUI'
import { apiFetch } from '../api'

function ChatRoomsPage({ user, socket, onBack }) {
  const navigate = useNavigate()
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [roomId, setRoomId] = useState(null)

  const [chatRooms, setChatRooms] = useState([])

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await apiFetch('/rooms')
        if (response.ok) {
          const data = await response.json()
          const formattedRooms = data.rooms.map(room => ({
            id: room.roomCode,
            _id: room._id,
            name: room.roomName,
            unreadCount: 0,
            participants: room.member,
            lastMessage: '',
            lastMessageTime: ''
          }))
          setChatRooms(formattedRooms)
        }
      } catch (err) {
        console.error('Failed to fetch rooms:', err)
      }
    }
    fetchRooms()
  }, [])

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

  const handleRoomClick = async (room) => {
    setLoading(true)
    setError('')
    try {
      // Fetch room messages from backend
      const response = await apiFetch(`/chats/room/${room._id}/messages`, {
        method: 'GET'
      })

      if (response.status === 401) {
        navigate('/auth')
        return
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load messages')
      }

      // Sort messages by createdAt in ascending order (oldest first)
      const sortedMessages = data.msg.sort((a, b) =>
        new Date(a.createdAt) - new Date(b.createdAt)
      )

      // Format messages for display
      const formattedMessages = sortedMessages.map(msg => ({
        sender: msg.senderUsername || 'Unknown',
        senderId: msg.sender_id,
        text: msg.message,
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }))

      setMessages(formattedMessages)
      setSelectedRoom(room)
      setRoomId(room._id)

      if (!socket) {
        throw new Error('Socket is not connected yet')
      }

      socket.emit('join-room', room._id)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToList = () => {
    if (socket && roomId) {
      socket.emit('leave-room', roomId)
    }
    setSelectedRoom(null)
    setRoomId(null)
    setMessages([])
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

      setChatRooms(prevRooms => prevRooms.filter(room => room._id !== roomId))
      setSelectedRoom(null)
      setRoomId(null)
      setMessages([])
    } catch (err) {
      console.error('Failed to leave room:', err)
      setError('Failed to leave room')
    }
  }

  if (selectedRoom) {
    return (
      <div className="chat-rooms-container">
        {error && (
          <div className="error-notification">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
            <button onClick={() => setError('')} className="error-close">×</button>
          </div>
        )}
        <div className="chat-header">
          <button onClick={handleBackToList} className="back-button">← Rooms</button>
          <div className="room-info">
            <h2>{selectedRoom.name}</h2>
            <span className="room-status">Connected</span>
          </div>
          {user?._id !== selectedRoom?.admin_id && (
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
    <div className="chat-rooms-container">
      <div className="chat-rooms-header">
        <div className="header-left">
          <h1 className="app-name">
            <svg className="app-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="url(#chatRoomsGradient)" />
              <defs>
                <linearGradient id="chatRoomsGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
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

      <div className="chat-rooms-content">
        <div className="rooms-header">
          <h2>Your Chat Rooms</h2>
          <p className="rooms-count">{chatRooms.length} active conversations</p>
        </div>

        <div className="rooms-list">
          {chatRooms.length === 0 ? (
            <div className="no-rooms">
              <div className="no-rooms-icon">💬</div>
              <h3>No chat rooms yet</h3>
              <p>Create or join a room to start chatting</p>
            </div>
          ) : (
            chatRooms.map((room) => (
              <div
                key={room.id}
                className="room-card"
                onClick={() => handleRoomClick(room)}
              >
                <div className="room-card-left">
                  <div className="room-avatar">
                    {room.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="room-info">
                    <div className="room-name-row">
                      <h3>{room.name}</h3>
                      {room.unreadCount > 0 && (
                        <span className="unread-badge">{room.unreadCount}</span>
                      )}
                    </div>
                    <p className="room-preview">{room.lastMessage}</p>
                    <div className="room-meta">
                      <span className="room-time">{room.lastMessageTime}</span>
                      <span className="room-participants">
                        {room.participants.length} participants
                      </span>
                    </div>
                  </div>
                </div>
                <div className="room-card-right">
                  <div className="room-code">{room.id}</div>
                  <span className="arrow-icon">→</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatRoomsPage

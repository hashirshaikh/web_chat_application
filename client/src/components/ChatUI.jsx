import './ChatUI.css'
import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '../api'

function ChatUI({ messages = [], currentUser = '', onSendMessage, onLocalMessage, className = '', socket = null, roomId = null, userId = null }) {
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const audioRef = useRef(null)
  const messageIdsRef = useRef(new Set())

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Play notification sound for incoming messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.sender !== currentUser) {
        playNotificationSound()
      }
    }
  }, [messages, currentUser])

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(err => {
        console.log('Audio play failed:', err)
      })
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (newMessage.trim() && !sending) {
      setSending(true)
      try {
        // Call broadcast API
        const response = await apiFetch('/chats/broadcast', {
          method: 'POST',
          body: JSON.stringify({
            senderId: userId,
            sender: currentUser,
            roomId: roomId,
            message: newMessage.trim()
          })
        })

        if (response.ok) {
          const messageData = {
            roomId: roomId,
            sender: currentUser,
            senderId: userId,
            text: newMessage.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }

          if (socket && roomId) {
            socket.emit('send-message', messageData)
          }

          if (typeof onLocalMessage === 'function') {
            onLocalMessage(messageData)
          }

          setNewMessage('')
        }
      } catch (err) {
        console.error('Failed to send message:', err)
      } finally {
        setSending(false)
      }
    }
  }

  return (
    <div className={`chat-container ${className}`}>
      {/* Hidden audio element for notification sound */}
      <audio 
        ref={audioRef} 
        preload="auto"
        src="/notification.mp3"
      />
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">
            <div className="no-messages-icon">💬</div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage = msg.sender === currentUser
            return (
              <div 
                key={index} 
                className={`message ${isOwnMessage ? 'other' : 'own'}`}
              >
                <div className="message-content">
                  <span className="message-sender">{msg.sender}</span>
                  <span className="message-colon">:</span>
                  <span className="message-text">{msg.text}</span>
                </div>
                <div className="message-time">
                  {msg.time}
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="send-button" disabled={!newMessage.trim() || sending}>
          {sending ? '...' : (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="white"/>
            </svg>
          )}
        </button>
      </form>
    </div>
  )
}

export default ChatUI

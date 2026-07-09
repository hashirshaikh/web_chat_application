import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState, createContext, useContext } from 'react'
import { io } from 'socket.io-client'
import { apiFetch, getSocketUrl } from './api'
import AuthPage from './pages/AuthPage'
import WelcomePage from './pages/WelcomePage'
import ProfilePage from './pages/ProfilePage'
import JoinChatPage from './pages/JoinChatPage'
import CreateChatPage from './pages/CreateChatPage'
import ChatRoomsPage from './pages/ChatRoomsPage'

const SocketContext = createContext(null)

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated && !socket) {
      const newSocket = io(getSocketUrl(), {
        withCredentials: true,
        transports: ['websocket', 'polling']
      })
      setSocket(newSocket)
    }
  }, [isAuthenticated, socket])

  const checkAuth = async () => {
    try {
      const response = await apiFetch('/auth/me')
      
      if (response.ok) {
        const userData = await response.json()
        setIsAuthenticated(true)
        setUser(userData)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    await checkAuth()
  }

  const handleLogout = async () => {
    try {
      // Disconnect socket before logout
      if (socket) {
        socket.disconnect()
        setSocket(null)
      }
      
      await apiFetch('/auth/logout', {
        method: 'POST'
      })
      setIsAuthenticated(false)
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <WelcomePage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route 
          path="/profile" 
          element={
            isAuthenticated ? (
              <ProfilePage user={user} onUserUpdate={handleUserUpdate} onBack={() => window.history.back()} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route 
          path="/join-chat" 
          element={
            isAuthenticated ? (
              <JoinChatPage user={user} socket={socket} onBack={() => window.history.back()} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route 
          path="/create-chat" 
          element={
            isAuthenticated ? (
              <CreateChatPage user={user} socket={socket} onBack={() => window.history.back()} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route 
          path="/chat-rooms" 
          element={
            isAuthenticated ? (
              <ChatRoomsPage user={user} socket={socket} onBack={() => window.history.back()} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route 
          path="/auth" 
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <AuthPage onLogin={handleLogin} />
            )
          } 
        />
        <Route 
          path="/auth/login" 
          element={<Navigate to="/auth" replace />} 
        />
        <Route 
          path="/auth/register" 
          element={<Navigate to="/auth" replace />} 
        />
        <Route 
          path="*" 
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App

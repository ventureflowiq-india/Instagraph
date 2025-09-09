// src/App.tsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './hooks/useAuth'
import LandingPage from './pages/LandingPage'
import About from './pages/About'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Dashboard from './pages/Dashboard'
import DataViewer from './pages/DataViewer'
import UserProfile from './pages/UserProfile'
import YourFiles from './pages/YourFiles'
import PlanBilling from './pages/PlanBilling'
import SignIn from './components/auth/SignIn'
import SignUp from './components/auth/SignUp'
import ForgotPassword from './components/auth/ForgotPassword'
import './index.css'

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/signin" replace />
  }

  return <>{children}</>
}

// Public Route Component (redirect to dashboard if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/about" 
        element={
          <PublicRoute>
            <About />
          </PublicRoute>
        } 
      />
      <Route 
        path="/contact" 
        element={
          <PublicRoute>
            <Contact />
          </PublicRoute>
        } 
      />
      <Route 
        path="/privacy" 
        element={
          <PublicRoute>
            <Privacy />
          </PublicRoute>
        } 
      />
      <Route 
        path="/terms" 
        element={
          <PublicRoute>
            <Terms />
          </PublicRoute>
        } 
      />
      <Route 
        path="/signin" 
        element={
          <PublicRoute>
            <SignIn />
          </PublicRoute>
        } 
      />
      <Route 
        path="/signup" 
        element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        } 
      />
      <Route 
        path="/forgot-password" 
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } 
      />

      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/data/:fileId" 
        element={
          <ProtectedRoute>
            <DataViewer />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/files" 
        element={
          <ProtectedRoute>
            <YourFiles />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/plan-billing" 
        element={
          <ProtectedRoute>
            <PlanBilling />
          </ProtectedRoute>
        } 
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
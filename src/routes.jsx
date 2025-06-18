"use client"
import { Routes, Route, Navigate } from "react-router-dom"
import SignInPage from "./pages/SignInPage"
import SignUpPage from "./pages/SignUpPage"
import MePage from "./pages/MePage"
import ChatPage from "./pages/ChatPage"
import { useAuth } from "./lib/AuthContext"

// Komponen wrapper untuk rute yang butuh autentikasi
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    // Jika belum login, redirect ke /signin
    return <Navigate to="/signin" replace />
  }
  return children
}

// Add a component to redirect authenticated users away from auth pages
function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (user) {
    // If already logged in, redirect to dashboard
    return <Navigate to="/me" replace />
  }
  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rute root langsung dialihkan ke /me jika sudah login,
          atau ke /signin kalau belum */}
      <Route path="/" element={<Navigate to="/me" replace />} />

      {/* Public routes - redirect to /me if already logged in */}
      <Route
        path="/signin"
        element={
          <PublicRoute>
            <SignInPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignUpPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/me"
        element={
          <ProtectedRoute>
            <MePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />

      {/* Jika rute lain, kembalikan ke /me */}
      <Route path="*" element={<Navigate to="/me" replace />} />
    </Routes>
  )
}
// This file defines the main routing structure of the application using React Router.
// It includes public routes for signing in and signing up, and protected routes for the main application
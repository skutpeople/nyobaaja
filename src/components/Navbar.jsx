"use client"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../lib/AuthContext"
import "./Navbar.css" // Ensure this CSS file is linked

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Hide navbar on sign-in and sign-up pages
  if (location.pathname === "/signin" || location.pathname === "/signup") {
    return null
  }

  const handleSignOut = () => {
    signOut()
    navigate("/signin")
  }

  return (
    <nav className="navbar">
      {/* If user is logged in → show Me, Chat, and Sign Out */}
      {user ? (
        <>
          <NavLink to="/me" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            <span className="material-icons">account_circle</span> 
            <span>Me</span>
          </NavLink>

          <NavLink to="/chat" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            <span className="material-icons">chat_bubble_outline</span> 
            <span>Chat</span>
          </NavLink>

          <button onClick={handleSignOut} className="nav-link" style={{ border: "none", background: "none" }}>
            <span className="material-icons">logout</span> 
            <span>Sign Out</span>
          </button>
        </>
      ) : (
        // This block will effectively be hidden by the `if` statement above
        <>
          <NavLink to="/signin" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            <span className="material-icons">login</span>
            <span>Sign In</span>
          </NavLink>

          <NavLink to="/signup" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            <span className="material-icons">person_add</span>
            <span>Sign Up</span>
          </NavLink>
        </>
      )}
    </nav>
  )
}

"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import SignInForm from "../components/SignInForm"
import SignUpForm from "../components/SignUpForm"
import TexturedLayout from "../components/TexturedLayout" // Use the existing TexturedLayout

export default function AuthLayout() {
  const [isSignIn, setIsSignIn] = useState(true)
  const navigate = useNavigate()

  const handleAuthSuccess = () => {
    navigate("/me") // Navigate to dashboard on successful sign-in/sign-up
  }

  const toggleForm = () => {
    setIsSignIn((prev) => !prev)
  }

  return (
    <TexturedLayout>
      {" "}
      {/* Wrap with TexturedLayout for consistent background */}
      <div style={styles.cardContainer}>
        {/* Header Section */}
        <div style={styles.header}>
          <h1 style={styles.welcomeTitle}>
            <span style={styles.emoji}>✨</span> Welcome!
          </h1>
          <p style={styles.welcomeSubtitle}>Sign in to your account or create a new one to start tracking your calories.</p>
        </div>

        {/* Toggle Buttons */}
        <div style={styles.toggleContainer}>
          <button
            onClick={() => setIsSignIn(true)}
            style={{
              ...styles.toggleButton,
              ...(isSignIn ? styles.toggleButtonActive : styles.toggleButtonInactive),
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsSignIn(false)}
            style={{
              ...styles.toggleButton,
              ...(!isSignIn ? styles.toggleButtonActive : styles.toggleButtonInactive),
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Render the appropriate form */}
        <div style={styles.formWrapper}>
          {isSignIn ? (
            <SignInForm onSuccess={handleAuthSuccess} onToggleForm={toggleForm} />
          ) : (
            <SignUpForm onSuccess={handleAuthSuccess} onToggleForm={toggleForm} />
          )}
        </div>
      </div>
    </TexturedLayout>
  )
}

const styles = {
  cardContainer: {
    backgroundColor: "var(--color-card-bg)", // Darker than background, transparent
    backdropFilter: "blur(15px)",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
    maxWidth: "500px",
    width: "100%",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    margin: "auto", // Center the card vertically and horizontally
  },
  header: {
    padding: "2.5rem 2rem",
    color: "var(--color-white)",
    textAlign: "center",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    background: "rgba(0, 0, 0, 0.2)", // Subtle dark background for header
  },
  welcomeTitle: {
    margin: "0 0 0.75rem 0",
    fontSize: "2.2rem",
    fontWeight: "700",
    background: "linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)", // White gradient text
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  emoji: {
    marginRight: "0.5rem",
    fontSize: "1.8rem",
  },
  welcomeSubtitle: {
    margin: 0,
    fontSize: "1rem",
    lineHeight: "1.5",
    color: "var(--color-gray-400)", // Lighter gray for subtitle
  },
  toggleContainer: {
    display: "flex",
    margin: "1.5rem 2rem 0",
    backgroundColor: "rgba(255, 255, 255, 0.05)", // Subtle background for toggle
    borderRadius: "12px",
    padding: "0.25rem",
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)",
  },
  toggleButton: {
    flex: 1,
    padding: "0.8rem 1.5rem",
    borderRadius: "10px",
    border: "none",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    color: "var(--color-white)",
    textAlign: "center",
  },
  toggleButtonActive: {
    background: "var(--color-primary-orange)", // Active orange
    boxShadow: "0 4px 12px rgba(255, 107, 53, 0.3)",
  },
  toggleButtonInactive: {
    backgroundColor: "transparent",
    color: "var(--color-gray-400)", // Inactive gray
  },
  formWrapper: {
    padding: "2rem",
    backgroundColor: "transparent", // Form background is transparent, relies on cardContainer
    flexGrow: 1,
  },
  // Message styles are now defined in SignInForm/SignUpForm for better modularity
}

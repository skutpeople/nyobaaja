"use client"

import { useState } from "react"
import { useAuth } from "../lib/AuthContext"

export default function SignInForm({ onSuccess, onToggleForm }) {
  const { signIn, loading } = useAuth()

  const [emailOrUsername, setEmailOrUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!emailOrUsername.trim() || !password.trim()) {
      setError("Email/Username dan password harus diisi")
      return
    }

    try {
      await signIn(emailOrUsername.trim(), password)
      onSuccess() // Call the success callback from AuthLayout
    } catch (err) {
      setError(err.message || "Gagal sign in")
    }
  }

  return (
    <div style={formStyles.container}>
      {error && <p style={{ ...formStyles.message, ...formStyles.errorMessage }}>{error}</p>}
      <form onSubmit={handleSubmit} style={formStyles.form}>
        <div style={formStyles.inputGroup}>
          <label htmlFor="emailOrUsername" style={formStyles.label}>
            Email or username
          </label>
          <div style={formStyles.inputWrapper}>
            <span style={formStyles.icon}>✉️</span>
            <input
              id="emailOrUsername"
              type="text"
              placeholder="nama@email.com atau username"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              style={formStyles.input}
              disabled={loading}
            />
          </div>
        </div>
        <div style={formStyles.inputGroup}>
          <label htmlFor="password" style={formStyles.label}>
            Password
          </label>
          <div style={formStyles.inputWrapper}>
            <span style={formStyles.icon}>🔒</span>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={formStyles.input}
              disabled={loading}
            />
          </div>
        </div>
        <button
          type="submit"
          style={{
            ...formStyles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          disabled={loading}
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>
      <p style={formStyles.toggleText}>
        Belum punya akun?{" "}
        <span
          onClick={() => !loading && onToggleForm()}
          style={{
            ...formStyles.link,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          Daftar
        </span>
      </p>
    </div>
  )
}

const formStyles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    color: "var(--color-white)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "var(--color-gray-400)",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)", // Subtle transparent background
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "0.75rem 1rem",
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
  },
  icon: {
    marginRight: "0.75rem",
    fontSize: "1.2rem",
    color: "var(--color-gray-400)",
  },
  input: {
    flex: 1,
    background: "none",
    border: "none",
    color: "var(--color-white)",
    fontSize: "1rem",
    padding: 0,
    "&::placeholder": {
      color: "var(--color-gray-500)",
    },
    "&:focus": {
      outline: "none",
    },
  },
  button: {
    padding: "1rem 1.5rem",
    borderRadius: "12px",
    border: "none",
    background: "var(--color-primary-orange)", // Use primary orange
    color: "var(--color-white)",
    cursor: "pointer",
    fontSize: "1.1rem",
    fontWeight: "600",
    marginTop: "1rem",
    boxShadow: "0 6px 16px rgba(255, 107, 53, 0.3)",
    transition: "all 0.3s ease",
  },
  toggleText: {
    textAlign: "center",
    fontSize: "0.9rem",
    color: "var(--color-gray-400)",
  },
  link: {
    color: "var(--color-primary-orange)",
    cursor: "pointer",
    textDecoration: "none",
    fontWeight: "600",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  message: {
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: "1rem",
    animation: "fadeIn 0.3s ease-out",
  },
  errorMessage: {
    backgroundColor: "rgba(255, 99, 71, 0.2)", // Tomato red with transparency
    color: "#ff6347",
    border: "1px solid rgba(255, 99, 71, 0.4)",
  },
  successMessage: {
    backgroundColor: "rgba(81, 207, 102, 0.2)", // Green with transparency
    color: "#51cf66",
    border: "1px solid rgba(81, 207, 102, 0.4)",
  },
}

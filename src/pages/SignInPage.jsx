"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../lib/AuthContext"

export default function SignInPage() {
  const { signIn, loading } = useAuth()
  const navigate = useNavigate()

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
      // Jika berhasil sign in, navigasi ke /me
      navigate("/me")
    } catch (err) {
      setError(err.message || "Gagal sign in")
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Sign In</h2>
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Email atau Username"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          style={styles.input}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          disabled={loading}
        />
        <button
          type="submit"
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          disabled={loading}
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>
      <p>
        Belum punya akun?{" "}
        <span
          onClick={() => !loading && navigate("/signup")}
          style={{
            ...styles.link,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          Sign Up
        </span>
      </p>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "3rem auto",
    padding: "2rem",
    backgroundColor: "var(--color-card-bg)",
    borderRadius: "8px",
    color: "var(--color-white)",
    fontFamily: "var(--font-sans)",
  },
  heading: {
    textAlign: "center",
    marginBottom: "1rem",
  },
  error: {
    color: "red",
    marginBottom: "0.5rem",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  input: {
    padding: "0.5rem 0.75rem",
    borderRadius: "4px",
    border: "1px solid var(--color-gray-600)",
    backgroundColor: "var(--color-gray-700)",
    color: "var(--color-white)",
    fontSize: "14px",
  },
  button: {
    padding: "0.5rem 0.75rem",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "var(--color-primary-orange)",
    color: "var(--color-white)",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  link: {
    color: "var(--color-primary-orange)",
    cursor: "pointer",
    textDecoration: "underline",
  },
}

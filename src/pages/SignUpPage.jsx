"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../lib/AuthContext"

export default function SignUpPage() {
  const { signUp, loading } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Basic validation
    if (!email.trim() || !username.trim() || !password.trim() || !passwordConfirm.trim()) {
      setError("Semua field harus diisi")
      return
    }

    if (!email.includes("@")) {
      setError("Format email tidak valid")
      return
    }

    if (password !== passwordConfirm) {
      setError("Password tidak sama")
      return
    }

    try {
      await signUp(email.trim(), username.trim(), password, passwordConfirm)
      // Jika berhasil sign up, langsung navigasi ke dashboard /me
      navigate("/me")
    } catch (err) {
      setError(err.message || "Gagal sign up")
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Sign Up</h2>
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          disabled={loading}
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password (minimal 8 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Konfirmasi Password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
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
          {loading ? "Memproses..." : "Daftar"}
        </button>
      </form>
      <p>
        Sudah punya akun?{" "}
        <span
          onClick={() => !loading && navigate("/signin")}
          style={{
            ...styles.link,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          Sign In
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

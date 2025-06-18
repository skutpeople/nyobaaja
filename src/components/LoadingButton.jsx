"use client"

import LoadingSpinner from "./LoadingSpinner"

export default function LoadingButton({
  loading = false,
  children,
  disabled = false,
  loadingText = "Memproses...",
  style = {},
  ...props
}) {
  const buttonStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.5rem 0.75rem",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "var(--color-primary-orange)",
    color: "var(--color-white)",
    cursor: loading || disabled ? "not-allowed" : "pointer",
    fontSize: "14px",
    fontWeight: "500",
    opacity: loading || disabled ? 0.7 : 1,
    transition: "opacity 0.2s ease",
    ...style,
  }

  return (
    <button style={buttonStyles} disabled={loading || disabled} {...props}>
      {loading && <LoadingSpinner size="small" color="white" />}
      {loading ? loadingText : children}
    </button>
  )
}

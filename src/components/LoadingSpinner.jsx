"use client"

import { forwardRef } from "react"

const LoadingSpinner = forwardRef(
  ({ size = "medium", color = "primary", overlay = false, text = "", className = "", ...props }, ref) => {
    const sizeClasses = {
      small: "16px",
      medium: "24px",
      large: "32px",
      xlarge: "48px",
    }

    const colorClasses = {
      primary: "var(--color-primary-orange)",
      white: "var(--color-white)",
      gray: "var(--color-gray-400)",
      inherit: "currentColor",
    }

    const spinnerSize = sizeClasses[size] || sizeClasses.medium
    const spinnerColor = colorClasses[color] || colorClasses.primary

    const spinnerStyles = {
      width: spinnerSize,
      height: spinnerSize,
      border: `2px solid transparent`,
      borderTop: `2px solid ${spinnerColor}`,
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    }

    const containerStyles = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: text ? "column" : "row",
      gap: text ? "0.5rem" : "0",
      ...(overlay && {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 9999,
      }),
    }

    const textStyles = {
      color: overlay ? "var(--color-white)" : "var(--color-text)",
      fontSize: "14px",
      fontFamily: "var(--font-sans)",
      marginTop: "0.5rem",
    }

    return (
      <>
        <style>
          {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
        </style>
        <div
          ref={ref}
          style={containerStyles}
          className={className}
          role="status"
          aria-label={text || "Loading"}
          {...props}
        >
          <div style={spinnerStyles} aria-hidden="true" />
          {text && <span style={textStyles}>{text}</span>}
        </div>
      </>
    )
  },
)

LoadingSpinner.displayName = "LoadingSpinner"

export default LoadingSpinner

// Preset components for common use cases
export const ButtonSpinner = ({ size = "small", color = "white", ...props }) => (
  <LoadingSpinner size={size} color={color} {...props} />
)

export const PageSpinner = ({ text = "Memuat...", ...props }) => (
  <LoadingSpinner size="large" overlay text={text} {...props} />
)

export const InlineSpinner = ({ size = "small", color = "inherit", ...props }) => (
  <LoadingSpinner size={size} color={color} {...props} />
)

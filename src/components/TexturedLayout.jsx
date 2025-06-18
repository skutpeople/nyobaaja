"use client"

export default function TexturedLayout({ children, className = "" }) {
  return (
    <div style={styles.backgroundContainer} className={className}>
      {/* Textured background overlay */}
      <div style={styles.textureOverlay} />

      {/* Main content container */}
      <div style={styles.contentContainer}>
        <div style={styles.innerContainer}>{children}</div>
      </div>
    </div>
  )
}

const styles = {
  backgroundContainer: {
    minHeight: "100vh",
    background: `
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 107, 53, 0.2) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
      linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)
    `,
    position: "relative",
    padding: "2rem 1rem",
  },
  textureOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 2px,
        rgba(255, 255, 255, 0.01) 2px,
        rgba(255, 255, 255, 0.01) 4px
      ),
      repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 2px,
        rgba(0, 0, 0, 0.02) 2px,
        rgba(0, 0, 0, 0.02) 4px
      )
    `,
    pointerEvents: "none",
  },
  contentContainer: {
    maxWidth: "900px",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },
  innerContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(10px)",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: `
      0 20px 40px rgba(0, 0, 0, 0.3),
      0 8px 16px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `,
    padding: "2rem",
    position: "relative",
    overflow: "hidden",
  },
}

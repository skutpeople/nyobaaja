"use client"

import { useState, useEffect } from "react"
import { ChatHistoryService } from "../lib/chatHistoryService"
import { useAuth } from "../lib/AuthContext"

export default function ChatDebugInfo() {
  const { user } = useAuth()
  const [messageCount, setMessageCount] = useState(0)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  useEffect(() => {
    const fetchMessageCount = async () => {
      if (!user?.id) return

      try {
        const count = await ChatHistoryService.getMessageCount(user.id)
        setMessageCount(count)
      } catch (error) {
        console.error("Error fetching message count:", error)
      }
    }

    fetchMessageCount()
  }, [user?.id, lastRefresh])

  const handleRefresh = () => {
    setLastRefresh(new Date())
  }

  if (!user) return null

  return (
    <div style={styles.container}>
      <div style={styles.info}>
        <span>Messages in DB: {messageCount}</span>
        <button onClick={handleRefresh} style={styles.refreshButton}>
          🔄 Refresh
        </button>
      </div>
      <div style={styles.timestamp}>Last checked: {lastRefresh.toLocaleTimeString()}</div>
    </div>
  )
}

const styles = {
  container: {
    position: "fixed",
    top: "10px",
    right: "10px",
    backgroundColor: "var(--color-card-bg)",
    padding: "0.5rem",
    borderRadius: "6px",
    fontSize: "0.75rem",
    color: "var(--color-white)",
    border: "1px solid var(--color-gray-600)",
    zIndex: 1000,
  },
  info: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.25rem",
  },
  refreshButton: {
    background: "none",
    border: "none",
    color: "var(--color-primary-orange)",
    cursor: "pointer",
    fontSize: "0.75rem",
  },
  timestamp: {
    color: "var(--color-gray-400)",
    fontSize: "0.625rem",
  },
}
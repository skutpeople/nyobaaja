"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import ChatMessage from "../components/ChatMessage"
import ChatInput from "../components/ChatInput"
import { supabase } from "../lib/supabaseClient"
import { analyzeFoodByText, analyzeHealthQuestion } from "../lib/deepseekClient"
import { IntentPredictor } from "../lib/intentPredictor"
import { ChatHistoryService } from "../lib/chatHistoryService"
import { useAuth } from "../lib/AuthContext"
import LoadingSpinner from "../components/LoadingSpinner"
import TexturedLayout from "../components/TexturedLayout"
import "./ChatPage.css"

export default function ChatPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const messagesEndRef = useRef(null)

  // Load chat history when component mounts
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user?.id) {
        setIsLoadingHistory(false)
        return
      }

      try {
        setIsLoadingHistory(true)
        const history = await ChatHistoryService.loadChatHistory(user.id)
        const formattedMessages = history.map((msg) => ({
          text: msg.message,
          isUser: msg.sender === "user",
          messageType: msg.message_type,
          timestamp: msg.created_at,
          id: msg.id,
        }))
        setMessages(formattedMessages)
      } catch (error) {
        console.error("❌ Error loading chat history:", error)
        setMessages([])
      } finally {
        setIsLoadingHistory(false)
      }
    }

    loadChatHistory()
  }, [user?.id])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSend = async (text) => {
    if (!user?.id) {
      console.error("❌ No user ID available")
      return
    }

    const trimmedText = text.trim()
    if (!trimmedText) return

    console.log("🔍 Processing message:", trimmedText)
    setIsTyping(true)

    // Step 1: Predict intent
    let intent = 0
    try {
      intent = await IntentPredictor.predict(trimmedText)
      console.log("🔍 Intent:", intent, IntentPredictor.getIntentName(intent))
    } catch (error) {
      console.error("❌ Intent prediction error:", error)
      intent = 0 // Default to asking only
    }

    // Step 2: Save user message
    const messageType = IntentPredictor.isFoodLogging(intent) ? "food_logging" : "general"
    let userMessageId = null
    try {
      const savedMessage = await ChatHistoryService.saveMessage(user.id, trimmedText, "user", messageType)
      userMessageId = savedMessage.id
    } catch (error) {
      console.error("❌ Error saving user message:", error)
    }

    // Step 3: Add user message to UI
    const userMessage = {
      text: trimmedText,
      isUser: true,
      messageType: messageType,
      timestamp: new Date().toISOString(),
      id: userMessageId,
    }
    setMessages((prev) => [...prev, userMessage])

    // Step 4: Process based on intent
    let botReply = ""
    let botMessageType = "general"

    try {
      if (IntentPredictor.isAskingOnly(intent)) {
        // Handle general health questions
        console.log("🔍 Processing as health question")
        botReply = await analyzeHealthQuestion(trimmedText)
        botMessageType = "general"
      } else if (IntentPredictor.isFoodLogging(intent)) {
        // Handle food logging
        console.log("🔍 Processing as food logging")
        const deepseekResult = await analyzeFoodByText(trimmedText)

        const items = Array.isArray(deepseekResult.items) ? deepseekResult.items : []
        let sumCalsFromItems = 0

        if (items.length > 0) {
          for (const item of items) {
            const name = item.name || trimmedText
            const cals = item.calories || 0
            const qty = item.quantity || 1
            const totalCalories = item.totalCalories || cals * qty
            sumCalsFromItems += totalCalories

            try {
              await supabase.from("calorie_logs").insert({
                user_id: user.id,
                food_name: name,
                calories: cals,
                quantity: qty,
                totalcalories: totalCalories,
              })
            } catch (error) {
              console.error("❌ Error saving to calorie_logs:", error)
            }
          }
        }

        botReply = `Great! I've logged ${sumCalsFromItems} calories for "${text}". Keep tracking your intake!`
        botMessageType = "food_logging"
      }
    } catch (error) {
      console.error("❌ Error processing message:", error)
      botReply = "Sorry, I encountered an error processing your message. Please try again."
      botMessageType = "general"
    }

    // Step 5: Save and display bot reply
    let botMessageId = null
    try {
      const savedBotMessage = await ChatHistoryService.saveMessage(user.id, botReply, "bot", botMessageType)
      botMessageId = savedBotMessage.id
    } catch (error) {
      console.error("❌ Error saving bot reply:", error)
    }

    setIsTyping(false)
    setMessages((prev) => [
      ...prev,
      {
        text: botReply,
        isUser: false,
        messageType: botMessageType,
        timestamp: new Date().toISOString(),
        id: botMessageId,
      },
    ])
  }

  const handleClearHistory = async () => {
    if (!user?.id) return
    if (window.confirm("Are you sure you want to clear all chat history?")) {
      try {
        await ChatHistoryService.clearChatHistory(user.id)
        setMessages([])
      } catch (error) {
        console.error("❌ Error clearing history:", error)
        alert("Failed to clear chat history")
      }
    }
  }

  if (isLoadingHistory) {
    return (
      <TexturedLayout>
        <div style={styles.loadingContainer}>
          <LoadingSpinner size="large" text="Loading chat history..." />
        </div>
      </TexturedLayout>
    )
  }

  return (
    <TexturedLayout>
      <div style={styles.pageContainer}>
        <div style={styles.header}>
          <h2 style={styles.heading}>Smart Health Chat</h2>
          <div style={styles.headerActions}>
            <button style={styles.clearButton} onClick={handleClearHistory}>
              🗑️ Clear
            </button>
            <button style={styles.backBtn} onClick={() => navigate("/me")}>
              Back to Dashboard
            </button>
          </div>
        </div>

        <div style={styles.chatContainer}>
          {messages.length === 0 && (
            <div style={styles.welcomeMessage}>
              <h3 style={styles.welcomeTitle}>🤖 Smart Health Assistant</h3>
              <p style={styles.welcomeSubtitle}>Ask health questions or log your food intake!</p>
              <div style={styles.examples}>
                <div style={styles.exampleSection}>
                  <p style={styles.exampleTitle}>
                    <strong>🍎 Ask Questions:</strong>
                  </p>
                  <ul style={styles.exampleList}>
                    <li>"Berapa kalori nasi goreng?"</li>
                    <li>"Makanan apa yang sehat untuk diet?"</li>
                    <li>"Olahraga apa yang bagus untuk menurunkan berat badan?"</li>
                  </ul>
                </div>
                <div style={styles.exampleSection}>
                  <p style={styles.exampleTitle}>
                    <strong>📝 Log Food:</strong>
                  </p>
                  <ul style={styles.exampleList}>
                    <li>"Aku abis makan burger dan kentang goreng"</li>
                    <li>"Tadi makan nasi padang 1 porsi"</li>
                    <li>"Aku minum kopi susu 2 gelas"</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} style={styles.messageWrapper}>
              <ChatMessage text={msg.text} isUser={msg.isUser} />
              <div style={styles.messageInfo}>
                <span style={styles.timestamp}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span style={styles.messageType}>
                  {msg.messageType === "food_logging" ? "🍽️ Food Log" : "💬 Question"}
                </span>
              </div>
            </div>
          ))}

          {isTyping && <div style={styles.typingIndicator}>🤖 AI is thinking...</div>}
          <div ref={messagesEndRef} />
        </div>

        <div style={styles.inputContainer}>
          <ChatInput onSend={handleSend} />
        </div>
      </div>
    </TexturedLayout>
  )
}

const styles = {
  pageContainer: {
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 4rem)", // Account for TexturedLayout padding
    color: "var(--color-white, #ffffff)",
    fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "60vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    flexWrap: "wrap",
    gap: "1rem",
  },
  heading: {
    margin: 0,
    fontSize: "1.75rem",
    fontWeight: "700",
    background: "linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  headerActions: {
    display: "flex",
    gap: "0.75rem",
  },
  clearButton: {
    padding: "0.75rem 1.25rem",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  },
  backBtn: {
    padding: "0.75rem 1.25rem",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(255, 107, 53, 0.3)",
  },
  chatContainer: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    marginBottom: "1.5rem",
    padding: "0 0.5rem",
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(255, 255, 255, 0.3) transparent",
  },
  messageWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  messageInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.75rem",
    color: "rgba(255, 255, 255, 0.5)",
    marginBottom: "0.5rem",
    paddingLeft: "0.5rem",
  },
  timestamp: {},
  messageType: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: "0.25rem 0.5rem",
    borderRadius: "8px",
    fontSize: "0.625rem",
    backdropFilter: "blur(5px)",
  },
  welcomeMessage: {
    textAlign: "center",
    padding: "2.5rem",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    margin: "2rem 0",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
  },
  welcomeTitle: {
    margin: "0 0 1rem 0",
    fontSize: "1.5rem",
    fontWeight: "600",
    background: "linear-gradient(135deg, #ffffff 0%, #ff6b35 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  welcomeSubtitle: {
    margin: "0 0 2rem 0",
    fontSize: "1.1rem",
    color: "rgba(255, 255, 255, 0.8)",
  },
  examples: {
    textAlign: "left",
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "1.5rem",
  },
  exampleSection: {
    padding: "1.5rem",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  exampleTitle: {
    margin: "0 0 1rem 0",
    color: "#ffffff",
    fontSize: "1rem",
  },
  exampleList: {
    margin: 0,
    paddingLeft: "1.5rem",
    color: "rgba(255, 255, 255, 0.8)",
  },
  typingIndicator: {
    fontStyle: "italic",
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: "0.9rem",
    textAlign: "center",
    padding: "1rem",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    backdropFilter: "blur(5px)",
  },
  inputContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    padding: "1.5rem",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
  },
}

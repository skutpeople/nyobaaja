// "use client"

// import { useState, useEffect, useRef } from "react"
// import { useNavigate } from "react-router-dom"
// import ChatMessage from "../components/ChatMessage"
// import ChatInput from "../components/ChatInput"
// import { supabase } from "../lib/supabaseClient"
// import { analyzeFoodByText } from "../lib/deepseekClient"
// import { useAuth } from "../lib/AuthContext"
// import "./ChatPage.css"

// export default function ChatPage() {
//   const navigate = useNavigate()
//   const { user } = useAuth()

//   const [messages, setMessages] = useState([])
//   const [isTyping, setIsTyping] = useState(false)
//   const messagesEndRef = useRef(null)

//   // Auto‐scroll ke pesan terakhir
//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
//     }
//   }, [messages])

//   const handleSend = async (text) => {
//     // Tampilkan dulu pesan user di UI
//     setMessages((prev) => [...prev, { text, isUser: true }])
//     setIsTyping(true)

//     let deepseekResult = null
//     try {
//       deepseekResult = await analyzeFoodByText(text)
//       console.log("> Hasil deepseekResult di ChatPage:", deepseekResult)
//       // Diharapkan deepseekResult = { items: [...], totalCalories: number }
//     } catch (err) {
//       console.error("Error DeepSeek di ChatPage:", err)
//       setIsTyping(false)
//       setMessages((prev) => [
//         ...prev,
//         { text: "Maaf, terjadi kesalahan memanggil DeepSeek. Coba lagi nanti.", isUser: false },
//       ])
//       return
//     }

//     // Proses response dari DeepSeek
//     const items = Array.isArray(deepseekResult.items) ? deepseekResult.items : []

//     // Simpan tiap item ke calorie_logs
//     let sumCalsFromItems = 0
//     if (items.length > 0) {
//       for (const it of items) {
//         const name = it.name || text
//         const cals = it.calories || 0
//         const qty = it.quantity || 1
//         const totalCalories = it.totalCalories || cals * qty
//         sumCalsFromItems += totalCalories

//         await supabase.from("calorie_logs").insert({
//           user_id: user.id,
//           food_name: name,
//           calories: cals,
//           quantity: qty,
//           totalcalories: totalCalories,
//         })
//       }
//     } else {
//       // Jika items kosong, simpan satu row saja dengan totalCalories
//       sumCalsFromItems = items.totalCalories
//       await supabase.from("calorie_logs").insert({
//         user_id: user.id,
//         food_name: text,
//         calories: items.calories || 0,
//         quantity: items.quantity || 1,
//         totalcalories: items.totalCalories || (items.calories * items.quantity)
//       })
//     }

//     // Tampilkan balasan bot di UI
//     setIsTyping(false)
//     const botReply = `Great! I've logged ${sumCalsFromItems} calories for "${text}". Keep tracking your intake!`
//     setMessages((prev) => [...prev, { text: botReply, isUser: false }])
//   }

//   return (
//     <div style={styles.pageContainer}>
//       <div style={styles.header}>
//         <h2 style={styles.heading}>Food Logging Chat</h2>
//         <button style={styles.backBtn} onClick={() => navigate("/me")}>
//           Back to Dashboard
//         </button>
//       </div>

//       <div style={styles.chatContainer}>
//         {messages.length === 0 && (
//           <div style={styles.welcomeMessage}>
//             <h3>🍽️ Welcome to Food Logging!</h3>
//             <p>Describe any food you've eaten and I'll help you track the calories.</p>
//             <div style={styles.examples}>
//               <p>
//                 <strong>Examples:</strong>
//               </p>
//               <ul>
//                 <li>"I had a chicken sandwich with fries"</li>
//                 <li>"2 slices of pizza and a coke"</li>
//                 <li>"Greek salad with grilled chicken"</li>
//               </ul>
//             </div>
//           </div>
//         )}

//         {messages.map((msg, idx) => (
//           <ChatMessage key={idx} text={msg.text} isUser={msg.isUser} />
//         ))}
//         {isTyping && <div style={styles.typingIndicator}>AI is analyzing your food...</div>}
//         <div ref={messagesEndRef} />
//       </div>

//       <div style={styles.inputContainer}>
//         <ChatInput onSend={handleSend} />
//       </div>
//     </div>
//   )
// }

// const styles = {
//   pageContainer: {
//     display: "flex",
//     flexDirection: "column",
//     height: "100vh",
//     padding: "1rem",
//     boxSizing: "border-box",
//     maxWidth: "800px",
//     margin: "0 auto",
//   },
//   header: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: "1rem",
//     paddingBottom: "1rem",
//     borderBottom: "1px solid var(--color-gray-700)",
//   },
//   heading: {
//     color: "var(--color-white)",
//     margin: 0,
//     fontFamily: "var(--font-sans)",
//     fontSize: "1.5rem",
//   },
//   backBtn: {
//     backgroundColor: "var(--color-primary-orange)",
//     border: "none",
//     borderRadius: "6px",
//     padding: "0.5rem 1rem",
//     color: "var(--color-white)",
//     cursor: "pointer",
//     fontSize: "0.875rem",
//   },
//   chatContainer: {
//     flex: 1,
//     overflowY: "auto",
//     display: "flex",
//     flexDirection: "column",
//     gap: "0.75rem",
//     marginBottom: "1rem",
//     padding: "0 0.5rem",
//   },
//   welcomeMessage: {
//     textAlign: "center",
//     padding: "2rem",
//     backgroundColor: "var(--color-card-bg)",
//     borderRadius: "12px",
//     color: "var(--color-white)",
//     margin: "2rem 0",
//   },
//   examples: {
//     textAlign: "left",
//     marginTop: "1.5rem",
//     padding: "1rem",
//     backgroundColor: "var(--color-gray-800)",
//     borderRadius: "8px",
//   },
//   typingIndicator: {
//     fontStyle: "italic",
//     color: "var(--color-gray-400)",
//     fontSize: "0.875rem",
//     textAlign: "center",
//     padding: "0.5rem",
//   },
//   inputContainer: {
//     backgroundColor: "var(--color-card-bg)",
//     padding: "1rem",
//     borderRadius: "12px",
//     border: "1px solid var(--color-gray-700)",
//   },
// }

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
      <div style={styles.pageContainer}>
        <div style={styles.loadingContainer}>
          <LoadingSpinner size="large" text="Loading chat history..." />
        </div>
      </div>
    )
  }

  return (
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
            <h3>🤖 Smart Health Assistant</h3>
            <p>Ask health questions or log your food intake!</p>
            <div style={styles.examples}>
              <div style={styles.exampleSection}>
                <p>
                  <strong>🍎 Ask Questions:</strong>
                </p>
                <ul>
                  <li>"Berapa kalori nasi goreng?"</li>
                  <li>"Makanan apa yang sehat untuk diet?"</li>
                  <li>"Olahraga apa yang bagus untuk menurunkan berat badan?"</li>
                </ul>
              </div>
              <div style={styles.exampleSection}>
                <p>
                  <strong>📝 Log Food:</strong>
                </p>
                <ul>
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
  )
}

const styles = {
  pageContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    padding: "1rem",
    boxSizing: "border-box",
    maxWidth: "800px",
    margin: "0 auto",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid var(--color-gray-700)",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  heading: {
    color: "var(--color-white)",
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: "1.5rem",
  },
  headerActions: {
    display: "flex",
    gap: "0.5rem",
  },
  clearButton: {
    backgroundColor: "var(--color-gray-600)",
    border: "none",
    borderRadius: "6px",
    padding: "0.5rem 1rem",
    color: "var(--color-white)",
    cursor: "pointer",
    fontSize: "0.875rem",
  },
  backBtn: {
    backgroundColor: "var(--color-primary-orange)",
    border: "none",
    borderRadius: "6px",
    padding: "0.5rem 1rem",
    color: "var(--color-white)",
    cursor: "pointer",
    fontSize: "0.875rem",
  },
  chatContainer: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    marginBottom: "1rem",
    padding: "0 0.5rem",
  },
  messageWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  messageInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.75rem",
    color: "var(--color-gray-400)",
    marginBottom: "0.5rem",
  },
  timestamp: {},
  messageType: {
    backgroundColor: "var(--color-gray-700)",
    padding: "0.125rem 0.375rem",
    borderRadius: "4px",
    fontSize: "0.625rem",
  },
  welcomeMessage: {
    textAlign: "center",
    padding: "2rem",
    backgroundColor: "var(--color-card-bg)",
    borderRadius: "12px",
    color: "var(--color-white)",
    margin: "2rem 0",
  },
  examples: {
    textAlign: "left",
    marginTop: "1.5rem",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  exampleSection: {
    padding: "1rem",
    backgroundColor: "var(--color-gray-800)",
    borderRadius: "8px",
  },
  typingIndicator: {
    fontStyle: "italic",
    color: "var(--color-gray-400)",
    fontSize: "0.875rem",
    textAlign: "center",
    padding: "0.5rem",
  },
  inputContainer: {
    backgroundColor: "var(--color-card-bg)",
    padding: "1rem",
    borderRadius: "12px",
    border: "1px solid var(--color-gray-700)",
  },
}
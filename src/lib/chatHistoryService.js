import { supabase } from "./supabaseClient"

export class ChatHistoryService {
  // Save message to database
  static async saveMessage(userId, message, sender, messageType = "general") {
    if (!userId || !message || !sender) {
      console.error("Invalid parameters for saveMessage:", { userId, message, sender })
      throw new Error("Missing required parameters")
    }

    const maxRetries = 3
    let lastError = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Saving message (attempt ${attempt}):`, {
          userId,
          sender,
          messageType,
          messageLength: message.length,
        })

        const { data, error } = await supabase
          .from("chat_history")
          .insert({
            user_id: userId,
            message: message.trim(),
            sender: sender,
            message_type: messageType,
          })
          .select()

        if (error) {
          console.error(`Error saving message (attempt ${attempt}):`, error)
          lastError = error

          if (attempt < maxRetries) {
            // Wait before retry
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
            continue
          }
          throw error
        }

        console.log("Message saved successfully:", data[0])
        return data[0]
      } catch (error) {
        console.error(`Error in saveMessage attempt ${attempt}:`, error)
        lastError = error

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
          continue
        }
      }
    }

    throw lastError || new Error("Failed to save message after multiple attempts")
  }

  // Load chat history for user
  static async loadChatHistory(userId, limit = 100) {
    if (!userId) {
      console.error("No userId provided for loadChatHistory")
      return []
    }

    try {
      console.log("Loading chat history for user:", userId)

      const { data, error } = await supabase
        .from("chat_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(limit)

      if (error) {
        console.error("Error loading chat history:", error)
        throw error
      }

      console.log(`Loaded ${data?.length || 0} messages from database`)
      return data || []
    } catch (error) {
      console.error("Error in loadChatHistory:", error)
      return []
    }
  }

  // Clear chat history for user (optional feature)
  static async clearChatHistory(userId) {
    try {
      const { error } = await supabase.from("chat_history").delete().eq("user_id", userId)

      if (error) {
        console.error("Error clearing chat history:", error)
        throw error
      }

      return true
    } catch (error) {
      console.error("Error in clearChatHistory:", error)
      throw error
    }
  }

  // Get recent messages count
  static async getMessageCount(userId) {
    try {
      const { count, error } = await supabase
        .from("chat_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)

      if (error) {
        console.error("Error getting message count:", error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error("Error in getMessageCount:", error)
      return 0
    }
  }
}
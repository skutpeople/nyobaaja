import axios from "axios"

const DEEPSEEK_API_TOKEN = import.meta.env.VITE_DEEPSEEK_API_TOKEN
const DEEPSEEK_BASE_URL = "https://api.deepseek.com"

// Simplified intent system - hanya 2 intent utama
const POSSIBLE_INTENTIONS = [
  "asking only (general health questions, nutrition info, food recommendations, etc) - DO NOT log to calorie tracker",
  "food logging (user wants to record/log food they ate) - LOG to calorie tracker",
]

const INTENT_SYSTEM_PROMPT = `
You are an intent classifier for a calorie tracking app. Analyze the user's message and determine their intent.

Choose from:
0. asking only (general health questions, nutrition info, food recommendations, etc) - DO NOT log to calorie tracker
1. food logging (user wants to record/log food they ate) - LOG to calorie tracker

IMPORTANT GUIDELINES:
- Intent 0 (asking only): Questions like "berapa kalori nasi?", "makanan apa yang sehat?", "olahraga apa yang bagus?", "apakah jeruk sehat?"
- Intent 1 (food logging): Statements like "aku abis makan burger", "tadi makan nasi padang", "aku makan 2 slice pizza", "tolong catat makananku"

Key indicators for food logging (intent 1):
- Past tense: "aku abis makan", "tadi makan", "sudah makan"
- Direct logging requests: "tolong catat", "log makananku", "record this"
- Specific quantities with past consumption: "makan 2 porsi", "abis minum 1 gelas"

Key indicators for asking only (intent 0):
- Questions: "berapa kalori?", "apa nutrisi?", "makanan apa yang?"
- Future tense: "mau makan apa?", "sebaiknya makan?"
- General advice: "olahraga apa yang bagus?", "diet apa yang cocok?"

Respond with a single digit only (0 or 1).
`

export class IntentPredictor {
  // Cache untuk menghindari API calls yang redundant
  static _intentCache = new Map()

  static async predict(message) {
    // Check cache first
    if (this._intentCache.has(message)) {
      console.log("🔍 Intent from cache:", this._intentCache.get(message))
      return this._intentCache.get(message)
    }

    try {
      console.log("🔍 Predicting intent for:", message)

      const response = await axios.post(
        `${DEEPSEEK_BASE_URL}/chat/completions`,
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: INTENT_SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: message,
            },
          ],
          temperature: 0,
          max_tokens: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${DEEPSEEK_API_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      )

      const intentStr = response.data.choices[0].message.content.trim()
      const intentIdx = Number.parseInt(intentStr)

      // Validate intent
      if (isNaN(intentIdx) || intentIdx < 0 || intentIdx > 1) {
        console.warn("🔍 Invalid intent response, defaulting to asking only:", intentStr)
        return 0 // Default to asking only
      }

      // Cache the result
      this._intentCache.set(message, intentIdx)

      console.log("🔍 Predicted intent:", intentIdx, intentIdx === 0 ? "(asking only)" : "(food logging)")
      return intentIdx
    } catch (error) {
      console.error("❌ Error predicting intent:", error)
      return 0 // Default to asking only on error
    }
  }

  static getIntentName(intentIdx) {
    switch (intentIdx) {
      case 0:
        return "asking_only"
      case 1:
        return "food_logging"
      default:
        return "unknown"
    }
  }

  static isAskingOnly(intentIdx) {
    return intentIdx === 0
  }

  static isFoodLogging(intentIdx) {
    return intentIdx === 1
  }
}
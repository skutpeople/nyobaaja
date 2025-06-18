import axios from "axios"

const DEEPSEEK_API_TOKEN = import.meta.env.VITE_DEEPSEEK_API_TOKEN
const DEEPSEEK_BASE_URL = "https://api.deepseek.com"

if (!DEEPSEEK_API_TOKEN) {
  console.error("❌ DeepSeek API token belum di‐set di .env.local!")
}

// System prompt untuk general health questions (intent 0)
const HEALTH_QUESTION_PROMPT = `
You are a helpful and knowledgeable health and nutrition assistant.

Your role is to provide clear, concise, and accurate responses related to:
    Nutritional information about foods,
    Healthy eating guidelines,
    Exercise and physical activity recommendations,
    General wellness and health tips,
    Calorie counts for various foods.

When the user asks in Indonesian, respond in Indonesian. Otherwise, use English.

Use plain language that is easy to understand. Do not use any formatting syntax such as asterisks (*, **), underscores (_), backticks, or bullet points. Write everything in plain text.
All outputs must be:
    Free of Markdown or HTML
    Neatly structured into short, readable paragraphs
    Easy to copy and read in any plain-text interface
    
Always stay evidence-based and practical. Avoid overly technical terms unless clearly explained.
`

// System prompt untuk food logging (intent 1)
const FOOD_LOGGING_PROMPT = `
You are a nutrition analyzer for calorie tracking. When the user describes food they have eaten, respond with ONLY a JSON object in this exact format:

{
  "items": [
    {
      "name": "food name",
      "calories": number,
      "quantity": number,
      "totalCalories": number
    }
  ]
}

Make sure to multiply calories by quantity if specified to get the totalCalories.
If the user does not specify quantity, assume 1 serving.

Make sure calories are realistic numbers (not 0). For example:
- 1 apple = 80 calories, quantity 1 = 80 total calories
- 2 slice pizza = 300 calories, quantity 2 = 600 total calories  
- 1 burger = 500 calories, quantity 1 = 500 total calories
- 1 cup rice = 200 calories, quantity 1 = 200 total calories

Always provide realistic calorie estimates.
`

export async function analyzeHealthQuestion(text) {
  console.log("🔍 Analyzing health question:", text)

  try {
    const response = await axios.post(
      `${DEEPSEEK_BASE_URL}/chat/completions`,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: HEALTH_QUESTION_PROMPT,
          },
          {
            role: "user",
            content: text,
          },
        ],
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${DEEPSEEK_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    )

    console.log("✅ Health question response received")
    return response.data.choices[0].message.content
  } catch (error) {
    console.error("❌ Error analyzing health question:", error)
    throw error
  }
}

export async function analyzeFoodByText(text) {
  console.log("🔍 Analyzing food for logging:", text)

  try {
    const response = await axios.post(
      `${DEEPSEEK_BASE_URL}/chat/completions`,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: FOOD_LOGGING_PROMPT,
          },
          {
            role: "user",
            content: text,
          },
        ],
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${DEEPSEEK_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    )

    console.log("✅ Food analysis response received")

    // Parse JSON response
    const rawContent = response.data.choices[0].message.content
    const cleaned = rawContent
      .replace(/```json/, "")
      .replace(/```/, "")
      .trim()

    let parsed
    try {
      parsed = JSON.parse(cleaned)
    } catch (err) {
      console.error("❌ Failed to parse JSON from DeepSeek:", cleaned)
      throw new Error("Invalid JSON response from DeepSeek.")
    }

    return parsed
  } catch (error) {
    console.error("❌ Error analyzing food:", error)
    throw error
  }
}
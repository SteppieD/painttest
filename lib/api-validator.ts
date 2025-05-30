import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'

export interface APIValidation {
  isValid: boolean
  provider: 'gemini' | 'openai' | null
  error?: string
}

/**
 * Validates API configuration and tests connection
 */
export async function validateAPIConfiguration(): Promise<APIValidation> {
  const geminiKey = process.env.GEMINI_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  // Check if either key is configured
  if (!geminiKey && !openaiKey) {
    return {
      isValid: false,
      provider: null,
      error: 'No API keys configured. Please set either GEMINI_API_KEY or OPENAI_API_KEY.'
    }
  }

  // Try Gemini first if configured
  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
      
      // Test the connection with a simple prompt
      const result = await model.generateContent('Test connection')
      const response = await result.response
      const text = response.text()
      
      if (text) {
        return {
          isValid: true,
          provider: 'gemini'
        }
      }
    } catch (error) {
      console.error('Gemini API test failed:', error)
      // If Gemini fails and OpenAI is configured, we'll try that next
      if (!openaiKey) {
        return {
          isValid: false,
          provider: null,
          error: 'Gemini API validation failed and no OpenAI key is configured.'
        }
      }
    }
  }

  // Try OpenAI if configured
  if (openaiKey) {
    try {
      const openai = new OpenAI({
        apiKey: openaiKey
      })

      // Test the connection with a simple completion
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: 'Test connection' }],
        model: 'gpt-3.5-turbo',
      })

      if (completion.choices[0]?.message?.content) {
        return {
          isValid: true,
          provider: 'openai'
        }
      }
    } catch (error) {
      console.error('OpenAI API test failed:', error)
      return {
        isValid: false,
        provider: null,
        error: 'OpenAI API validation failed.'
      }
    }
  }

  return {
    isValid: false,
    provider: null,
    error: 'All configured API providers failed validation.'
  }
}

/**
 * Gets the current active API provider
 */
export function getActiveProvider(): 'gemini' | 'openai' | null {
  if (process.env.GEMINI_API_KEY) return 'gemini'
  if (process.env.OPENAI_API_KEY) return 'openai'
  return null
}

/**
 * Creates an instance of the appropriate AI client
 */
export function createAIClient() {
  const provider = getActiveProvider()
  
  if (provider === 'gemini') {
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  }
  
  if (provider === 'openai') {
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    })
  }
  
  throw new Error('No API provider configured')
}

// Add API keys to environment if not present
export function updateAPIKeys(geminiKey?: string, openaiKey?: string) {
  if (geminiKey) {
    process.env.GEMINI_API_KEY = geminiKey
  }
  
  if (openaiKey) {
    process.env.OPENAI_API_KEY = openaiKey
  }
}

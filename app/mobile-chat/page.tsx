'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Menu, ArrowLeft } from 'lucide-react'
import './mobile-chat.css'

export default function MobileChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, text: "👋 Hi! I'm your painting quote assistant. What project can I help you quote today?", sender: 'bot' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user'
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Call your AI endpoint here
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      })
      
      const data = await response.json()
      
      setIsTyping(false)
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: data.reply || "I'll help you create a quote. What type of painting project is this?",
        sender: 'bot'
      }])
    } catch (error) {
      setIsTyping(false)
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: "Sorry, I had trouble processing that. Could you please try again?",
        sender: 'bot'
      }])
    }
  }

  return (
    <div className="mobile-chat-container">
      {/* Header */}
      <div className="chat-header">
        <ArrowLeft className="header-icon" />
        <div className="header-info">
          <h1>Paint Quote Bot</h1>
          <span className="status">Online</span>
        </div>
        <Menu className="header-icon" />
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            <div className="message-bubble">
              {msg.text}
            </div>
            <div className="message-time">
              {new Intl.DateTimeFormat('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              }).format(new Date())}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message bot">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="input-container">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="message-input"
        />
        <button onClick={sendMessage} className="send-button">
          <Send size={20} />
        </button>
      </div>
    </div>
  )
}
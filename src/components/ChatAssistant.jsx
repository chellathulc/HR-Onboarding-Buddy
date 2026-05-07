import { useState, useRef, useEffect } from 'react'

const REPLY_MAP = {
  leave: "Leave requests must be submitted through the HR portal at least 10 days in advance. Annual leave accrues at 1.5 days per month from day one.",
  vacation: "Submit vacation requests via the HR portal at least 10 days before your planned leave. PTO accrues from your first day.",
  payroll: "Payroll is processed on the 25th of each month. Set up direct deposit under 'Banking' in your employee portal.",
  benefits: "Benefits include medical, dental, and vision insurance plus a $100/month wellness allowance. Coverage starts from your first day.",
  health: "Health insurance begins from the first of the month following your start date. You can choose from three plan tiers.",
  remote: "Remote work eligibility depends on your role. Most positions support hybrid work after the first 30 days — check with your manager.",
  document: "Upload documents in the Document Validation section. Accepted formats: PDF, JPG, PNG (max 5 MB). Files are validated in real time.",
  id: "Accepted IDs include a passport, driver's license, or national ID. Make sure all four corners are clearly visible in the scan.",
  policy: "All company policies are in the Policy Hub — leave, expenses, remote work, and code of conduct.",
  onboarding: "Your onboarding has 4 steps: personal details, document verification, orientation scheduling, and policy review. Track your progress in the stepper.",
  expense: "Expenses up to $50 are self-approved. Anything above requires manager sign-off. Submit via the Expense module in your portal.",
  training: "Mandatory training modules must be completed within your first 30 days. Check your Learning Hub dashboard for the full list.",
  password: "Reset your password through the IT self-service portal at ithelp.htcinc.com or contact IT support at ext. 4000.",
  laptop: "Your laptop should arrive on your start date. If it hasn't, email IT at it-support@htcinc.com with your employee ID.",
  orientation: "Orientation is scheduled for your first Monday. You'll meet your team, tour the office, and complete mandatory compliance training.",
}

const getReply = (text) => {
  const normalized = text.toLowerCase()
  const match = Object.keys(REPLY_MAP).find((key) => normalized.includes(key))
  return match
    ? REPLY_MAP[match]
    : "I'm here to help with your onboarding! Try asking about leave, documents, payroll, benefits, remote work, or orientation."
}

const speak = (text) => {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.95
  utterance.pitch = 1.05
  utterance.volume = 1
  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find((v) => v.name.includes('Samantha') || v.name.includes('Google US English') || v.lang === 'en-US')
  if (preferred) utterance.voice = preferred
  window.speechSynthesis.speak(utterance)
}

const ChatAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Buddy',
      content: "Hi! I'm your onboarding buddy. I can help with documents, policies, payroll, benefits, and more. What do you need?",
    },
  ])
  const [query, setQuery] = useState('')
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const chatWindowRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    const userMessage = { id: Date.now(), sender: 'You', content: trimmed }
    setMessages((prev) => [...prev, userMessage])
    setQuery('')
    setIsTyping(true)

    window.setTimeout(() => {
      const reply = getReply(trimmed)
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'Buddy', content: reply },
      ])
      setIsTyping(false)
      if (voiceEnabled) speak(reply)
    }, 700)
  }

  const toggleVoice = () => {
    if (voiceEnabled) window.speechSynthesis?.cancel()
    setVoiceEnabled((v) => !v)
  }

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Try Chrome.')
      return
    }
    if (isListening) {
      recognitionRef.current?.stop()
      return
    }
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setQuery(transcript)
    }
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)
    recognition.start()
    setIsListening(true)
  }

  return (
    <div className="card chat-card">
      <div className="panel-header">
        <div>
          <h2>AI chat assistant</h2>
          <p>Ask anything about onboarding, policies, or documents.</p>
        </div>
        <div className="chat-controls">
          <button
            type="button"
            className={`voice-toggle ${voiceEnabled ? 'active' : ''}`}
            onClick={toggleVoice}
            title={voiceEnabled ? 'Disable voice replies' : 'Enable voice replies'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M19 10V12C19 15.866 15.866 19 12 19M12 19C8.13401 19 5 15.866 5 12V10M12 19V23M8 23H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Voice {voiceEnabled ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === 'Buddy' ? 'message-ai' : 'message-user'}`}
          >
            <span className="message-sender">
              {message.sender === 'Buddy' ? '🤖 Buddy' : '👤 You'}
            </span>
            <p>{message.content}</p>
          </div>
        ))}
        {isTyping && (
          <div className="message message-ai">
            <span className="message-sender">🤖 Buddy</span>
            <div className="typing-dots">
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>

      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about policies, documents, payroll…"
        />
        <button
          type="button"
          className={`mic-btn ${isListening ? 'mic-btn--active' : ''}`}
          onClick={startListening}
          title={isListening ? 'Stop listening' : 'Speak your question'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M19 10V12C19 15.866 15.866 19 12 19M12 19C8.13401 19 5 15.866 5 12V10M12 19V23M8 23H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button type="submit">Send</button>
      </form>
    </div>
  )
}

export default ChatAssistant

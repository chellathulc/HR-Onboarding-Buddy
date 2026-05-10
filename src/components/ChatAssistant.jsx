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

const READY_INTENT_PATTERN = /\b(yes|ready|i am ready|i'm ready|iam ready)\b/i
const ALLOWED_UPLOAD_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024
const ID_FILE_NAME_PATTERN = /((^|[\s._-])dl([\s._-]|$)|driving[\s._-]*license|drivinglicense|green[\s._-]*card|greencard|ration[\s._-]*card|rationcard|id[\s._-]*proof|government[\s._-]*id)/i
const PASSPORT_FILE_NAME_PATTERN = /(passport|travel[\s._-]*doc|pp)/i
const ADDRESS_FILE_NAME_PATTERN = /(utility[\s._-]*bill|bank[\s._-]*(statement|stmt)|bankstatement|statement|stmt)/i
const CERTIFICATION_FILE_NAME_PATTERN = /(certificate|cert|degree|college|university|marksheet|transcript|provisional)/i
const ASSISTANT_NAME = 'Neo'
const CHAT_HISTORY_STORAGE_KEY = 'neo-chat-history-v1'

const ChatAssistant = ({
  userName,
  verificationEvent,
  documentRemovalEvent,
  onReadyForDocument,
  onUploadDocument,
  onScrollToDocuments,
}) => {
  const initialMessage = `Hi ${userName}! I'm ${ASSISTANT_NAME}, your onboarding chat assistant buddy. I can help with your onboarding documents uploads, policies, payroll, benefits, and more. Are you ready with the needed documents?`
  const initialMessages = [
    {
      id: 1,
      sender: ASSISTANT_NAME,
      content: initialMessage,
    },
  ]
  const [messages, setMessages] = useState(() => {
    try {
      const cached = window.localStorage.getItem(CHAT_HISTORY_STORAGE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {
      // Fallback to fresh greeting when cache is unavailable/corrupt.
    }
    return initialMessages
  })
  const [query, setQuery] = useState('')
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [currentTarget, setCurrentTarget] = useState('government')
  const [awaitingReady, setAwaitingReady] = useState(true)
  const [uploadEnabled, setUploadEnabled] = useState(false)
  const [awaitingVerification, setAwaitingVerification] = useState(false)
  const [lastVerificationId, setLastVerificationId] = useState(null)
  const [lastRemovalId, setLastRemovalId] = useState(null)
  const chatWindowRef = useRef(null)
  const recognitionRef = useRef(null)
  const uploadInputRef = useRef(null)
  const getTargetLabel = (target) => {
    if (target === 'passport') return 'Passport'
    if (target === 'address') return 'Proof of address'
    if (target === 'certification') return 'Certification files'
    return 'Government ID proof'
  }

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight
    }
  }, [messages, isTyping])

  useEffect(() => {
    window.localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    if (!verificationEvent || verificationEvent.id === lastVerificationId) return
    setLastVerificationId(verificationEvent.id)
    setAwaitingVerification(false)

    const parsedInfo = Object.entries(verificationEvent.fields)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')

    const nextTarget = verificationEvent.nextTarget ?? null
    const nextMessage = nextTarget
      ? `The following information is successfully parsed and validated:\n${parsedInfo}\n\nAre you ready to upload your ${getTargetLabel(nextTarget)}?`
      : `The following information is successfully parsed and validated:\n${parsedInfo}\n\nAll required document checks in this flow are complete.`

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: ASSISTANT_NAME, content: nextMessage },
    ])

    if (nextTarget) {
      setCurrentTarget(nextTarget)
      setAwaitingReady(true)
      setUploadEnabled(false)
    } else {
      setAwaitingReady(false)
      setUploadEnabled(false)
    }
  }, [verificationEvent, lastVerificationId])

  useEffect(() => {
    if (!documentRemovalEvent || documentRemovalEvent.id === lastRemovalId) return
    setLastRemovalId(documentRemovalEvent.id)

    const target = documentRemovalEvent.target
    const targetLabel = getTargetLabel(target)

    setCurrentTarget(target)
    setAwaitingReady(true)
    setUploadEnabled(false)
    setAwaitingVerification(false)

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: ASSISTANT_NAME,
        content: `${targetLabel} was removed. Please upload it again to continue verification. Reply with "yes" or "ready" when you are ready.`,
      },
    ])
    onScrollToDocuments()
  }, [documentRemovalEvent, lastRemovalId, onScrollToDocuments])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (uploadEnabled || awaitingVerification) return

    const trimmed = query.trim()
    if (!trimmed) return

    const userMessage = { id: Date.now(), sender: 'You', content: trimmed }
    setMessages((prev) => [...prev, userMessage])
    setQuery('')
    setIsTyping(true)

    window.setTimeout(() => {
      let reply
      const isReadyIntent = READY_INTENT_PATTERN.test(trimmed)
      if (awaitingReady && isReadyIntent) {
        const targetLabel = getTargetLabel(currentTarget)
        reply = `Great! Upload button is now enabled. Please use Upload Documents to upload your ${targetLabel}.`
        setUploadEnabled(true)
        setAwaitingReady(false)
        onReadyForDocument(currentTarget)
        onScrollToDocuments()
      } else {
        reply = `${getReply(trimmed)}\n\nWhen you are ready, reply with "yes" or "ready" so I can enable ${getTargetLabel(currentTarget)} upload.`
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: ASSISTANT_NAME, content: reply },
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

  const handleUploadClick = () => {
    uploadInputRef.current?.click()
  }

  const handleUploadChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const loweredName = file.name.toLowerCase()
    if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: ASSISTANT_NAME,
          content: 'Please upload only PDF, JPG, or PNG for government-issued ID proof.',
        },
      ])
      event.target.value = ''
      return
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: ASSISTANT_NAME,
          content: 'This file is too large. Please upload a file up to 5 MB.',
        },
      ])
      event.target.value = ''
      return
    }

    const targetPattern = currentTarget === 'passport'
      ? PASSPORT_FILE_NAME_PATTERN
      : currentTarget === 'address'
        ? ADDRESS_FILE_NAME_PATTERN
        : currentTarget === 'certification'
          ? CERTIFICATION_FILE_NAME_PATTERN
        : ID_FILE_NAME_PATTERN
    if (!targetPattern.test(loweredName)) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: ASSISTANT_NAME,
          content: currentTarget === 'passport'
            ? 'Please upload a passport file and include "passport" in the file name.'
            : currentTarget === 'address'
              ? 'Please upload a Utility Bill or Bank Statement and include that in the file name.'
              : currentTarget === 'certification'
                ? 'Please upload your college certificate file and include words like certificate, degree, marksheet, or transcript.'
            : 'Please upload a government-issued ID file (Driving License, Green Card, or Ration Card). Include the ID type in the file name.',
        },
      ])
      event.target.value = ''
      return
    }

    onUploadDocument(currentTarget, file)
    setUploadEnabled(false)
    setAwaitingVerification(true)
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'You', content: `Uploaded file: ${file.name}` },
      {
        id: Date.now() + 1,
        sender: ASSISTANT_NAME,
        content: `Thanks! "${file.name}" is sent for parsing. I will update you once verification is complete.`,
      },
    ])
    event.target.value = ''
  }

  const handleClearHistory = () => {
    setMessages(initialMessages)
    window.localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY)
  }

  return (
    <div className="card chat-card">
      <div className="panel-header">
        <div>
          <h2>AI chat assistant</h2>
          <p>Ask anything about onboarding, policies, or documents.</p>
        </div>
        <button type="button" className="chat-clear-btn" onClick={handleClearHistory}>
          Clear chat
        </button>
      </div>

      <div className="chat-card-body">
        <div className="chat-window" ref={chatWindowRef}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender === ASSISTANT_NAME ? 'message-ai' : 'message-user'}`}
            >
              <span className="message-sender">
                {message.sender === ASSISTANT_NAME ? `🤖 ${ASSISTANT_NAME}` : '👤 You'}
              </span>
              <p>{message.content}</p>
            </div>
          ))}
          {isTyping && (
            <div className="message message-ai">
              <span className="message-sender">🤖 {ASSISTANT_NAME}</span>
              <div className="typing-dots">
                <span /><span /><span />
              </div>
            </div>
          )}
        </div>

        <form className="chat-form" onSubmit={handleSubmit}>
          <textarea
            value={query}
            disabled={uploadEnabled || awaitingVerification}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            placeholder={uploadEnabled || awaitingVerification ? 'Upload in progress. Waiting for verification...' : 'Ask about policies, documents, payroll…'}
            rows={3}
          />
          <div className="chat-form-actions">
            {!uploadEnabled && !awaitingVerification && (
              <>
                <button
                  type="button"
                  className={`voice-input-toggle ${isListening ? 'voice-input-toggle--active' : ''}`}
                  onClick={startListening}
                  title={isListening ? 'Stop listening' : 'Speak your question'}
                >
                  {isListening ? 'Stop' : 'Voice On'}
                </button>
                <button type="submit">Send</button>
              </>
            )}
            {uploadEnabled && (
              <>
                <button type="button" onClick={handleUploadClick}>
                  {currentTarget === 'passport'
                    ? 'Upload Passport'
                    : currentTarget === 'address'
                      ? 'Upload Address Proof'
                      : currentTarget === 'certification'
                        ? 'Upload Certificates'
                      : 'Upload Documents'}
                </button>
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  onChange={handleUploadChange}
                />
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatAssistant

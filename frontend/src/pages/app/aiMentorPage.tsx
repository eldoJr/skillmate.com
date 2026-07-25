import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlinePaperAirplane, HiOutlineSparkles, HiOutlinePlus,
  HiOutlineTrash, HiOutlineLightBulb, HiOutlineChatBubbleLeftRight,
} from 'react-icons/hi2'
import { aiService, type ConversationBrief, type MentorMessage, type ProactiveSuggestion } from '../../services/ai'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

function MessageBubble({ msg }: { msg: MentorMessage }) {
  const isUser = msg.role === 'user'
  return (
    <div className={clsx('flex gap-3', isUser && 'flex-row-reverse')}>
      <div className={clsx(
        'w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold mt-0.5',
        isUser
          ? 'bg-[#0969da] dark:bg-[#2f81f7] text-white'
          : 'bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97]',
      )}>
        {isUser ? 'You' : <HiOutlineSparkles className="w-3.5 h-3.5" />}
      </div>
      <div className={clsx(
        'max-w-[75%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap',
        isUser
          ? 'bg-[#0969da] dark:bg-[#2f81f7] text-white rounded-tr-sm'
          : 'bg-[#f6f8fa] dark:bg-[#21262d] text-[#1f2328] dark:text-[#e6edf3] rounded-tl-sm',
      )}>
        {msg.content}
      </div>
    </div>
  )
}

export default function AiMentorPage() {
  const [conversations, setConversations] = useState<ConversationBrief[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<MentorMessage[]>([])
  const [suggestions, setSuggestions] = useState<ProactiveSuggestion[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    aiService.getConversations().then(setConversations)
    aiService.getProactiveSuggestions().then(setSuggestions)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const loadConversation = async (id: string) => {
    setActiveId(id)
    const conv = await aiService.getConversation(id)
    setMessages(conv.messages)
  }

  const newChat = () => {
    setActiveId(null)
    setMessages([])
  }

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await aiService.deleteConversation(id)
    setConversations((prev) => prev.filter((c) => c.id !== id))
    if (activeId === id) newChat()
  }

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || streaming) return
    setInput('')

    const userMsg: MentorMessage = { id: crypto.randomUUID(), role: 'user', content, created_at: new Date().toISOString() }
    setMessages((prev) => [...prev, userMsg])
    setStreaming(true)
    setStreamingContent('')

    const token = localStorage.getItem('skillmate_token')
    let accumulated = ''

    try {
      const res = await fetch(`${BASE}/mentor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: content, conversation_id: activeId }),
      })

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          // SSE lines: "data: ..." or "data: [DONE]" or "data: {"conversation_id": ...}"
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue
            const payload = line.slice(6).trim()
            if (payload === '[DONE]') continue
            try {
              const parsed = JSON.parse(payload)
              if (parsed.conversation_id && !activeId) {
                setActiveId(parsed.conversation_id)
                aiService.getConversations().then(setConversations)
              }
              if (parsed.token) {
                accumulated += parsed.token
                setStreamingContent(accumulated)
              }
            } catch {
              // plain text token
              accumulated += payload
              setStreamingContent(accumulated)
            }
          }
        }
      }
    } finally {
      setStreaming(false)
      if (accumulated) {
        const aiMsg: MentorMessage = { id: crypto.randomUUID(), role: 'assistant', content: accumulated, created_at: new Date().toISOString() }
        setMessages((prev) => [...prev, aiMsg])
      }
      setStreamingContent('')
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div className="flex h-[calc(100vh-56px)] gap-0 -mx-6 -mt-6 overflow-hidden">
      {/* Sidebar */}
      <div className="w-[220px] shrink-0 border-r border-[#d0d7de] dark:border-[#30363d] flex flex-col bg-[#f6f8fa] dark:bg-[#0d1117]">
        <div className="p-3 border-b border-[#d0d7de] dark:border-[#30363d]">
          <button
            onClick={newChat}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[12px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] transition-colors cursor-pointer"
          >
            <HiOutlinePlus className="w-4 h-4" /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {conversations.length === 0 && (
            <p className="text-[11px] text-[#636c76] dark:text-[#848d97] px-2 py-3">No conversations yet.</p>
          )}
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => loadConversation(c.id)}
              className={clsx(
                'group w-full text-left px-3 py-2 rounded-xl text-[12px] transition-colors cursor-pointer flex items-center justify-between gap-2',
                activeId === c.id
                  ? 'bg-white dark:bg-[#161b22] text-[#1f2328] dark:text-[#e6edf3] shadow-sm'
                  : 'text-[#636c76] dark:text-[#848d97] hover:bg-white dark:hover:bg-[#161b22] hover:text-[#1f2328] dark:hover:text-[#e6edf3]',
              )}
            >
              <span className="truncate flex-1">{c.title}</span>
              <button
                onClick={(e) => deleteConversation(c.id, e)}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-[#d1242f] dark:hover:text-[#f85149] transition-all cursor-pointer"
              >
                <HiOutlineTrash className="w-3.5 h-3.5" />
              </button>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {messages.length === 0 && !streaming && (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0969da] to-[#8250df] flex items-center justify-center">
                <HiOutlineSparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">AI Career Mentor</p>
                <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mt-1 max-w-xs">Ask me anything about your career, skills, opportunities, or how to grow as a student.</p>
              </div>

              {suggestions.length > 0 && (
                <div className="w-full max-w-md space-y-2">
                  <p className="text-[11px] font-semibold text-[#636c76] dark:text-[#848d97] uppercase tracking-widest flex items-center gap-1.5 justify-center">
                    <HiOutlineLightBulb className="w-3.5 h-3.5" /> Suggestions
                  </p>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s.message)}
                      className="w-full text-left px-4 py-3 rounded-xl border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#161b22] text-[12px] text-[#636c76] dark:text-[#848d97] hover:border-[#0969da] dark:hover:border-[#2f81f7] hover:text-[#0969da] dark:hover:text-[#2f81f7] transition-colors cursor-pointer"
                    >
                      {s.message}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}

          {streaming && streamingContent && (
            <MessageBubble msg={{ id: 'streaming', role: 'assistant', content: streamingContent, created_at: '' }} />
          )}
          {streaming && !streamingContent && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-[#f6f8fa] dark:bg-[#21262d]">
                <HiOutlineSparkles className="w-3.5 h-3.5 text-[#636c76] dark:text-[#848d97]" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[#f6f8fa] dark:bg-[#21262d] flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-[#636c76] dark:bg-[#848d97]"
                    animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[#d0d7de] dark:border-[#30363d] px-6 py-4">
          <div className="flex items-end gap-3 max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask your career mentor…"
                className="w-full px-4 py-3 pr-12 rounded-2xl text-[13px] bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#636c76] dark:placeholder-[#848d97] outline-none focus:border-[#0969da] dark:focus:border-[#2f81f7] focus:bg-white dark:focus:bg-[#0d1117] resize-none transition-all max-h-40 overflow-y-auto"
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const t = e.currentTarget
                  t.style.height = 'auto'
                  t.style.height = `${Math.min(t.scrollHeight, 160)}px`
                }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || streaming}
              className="p-3 rounded-2xl bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <HiOutlinePaperAirplane className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-[10px] text-[#636c76] dark:text-[#848d97] mt-2">AI can make mistakes. Verify important information.</p>
        </div>
      </div>
    </div>
  )
}

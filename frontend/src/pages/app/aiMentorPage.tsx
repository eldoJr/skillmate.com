import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import {
  HiOutlinePaperAirplane, HiOutlinePlus,
  HiOutlineTrash, HiOutlineLightBulb,
} from 'react-icons/hi2'
import { aiService, type ConversationBrief, type MentorMessage, type ProactiveSuggestion } from '../../services/ai'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

function formatTime(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diffMins = Math.floor((now.getTime() - d.getTime()) / 60000)
  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`
  return `${Math.floor(diffMins / 1440)}d`
}

function MessageBubble({ msg }: { msg: MentorMessage }) {
  const isUser = msg.role === 'user'
  return (
    <div className={clsx('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className={clsx(
        'max-w-[70%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed',
        isUser
          ? 'bg-[#0969da] dark:bg-[#2f81f7] text-white rounded-br-md'
          : 'bg-[#f6f8fa] dark:bg-[#21262d] text-[#1f2328] dark:text-[#e6edf3] rounded-bl-md',
      )}>
        <p className="whitespace-pre-wrap">{msg.content}</p>
        {msg.created_at && (
          <p className={clsx('text-[9px] mt-1', isUser ? 'text-white/60' : 'text-[#636c76] dark:text-[#848d97]')}>
            {formatTime(msg.created_at)}
          </p>
        )}
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
    <div className="flex gap-0 h-[calc(100vh-112px)] rounded-2xl overflow-hidden bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d]">

      {/* Sidebar */}
      <div className="w-[260px] shrink-0 border-r border-[#d0d7de] dark:border-[#30363d] flex flex-col">
        <div className="p-4 border-b border-[#d0d7de]/60 dark:border-[#30363d]">
          <h2 className="text-[14px] font-semibold text-[#1f2328] dark:text-[#e6edf3] mb-3">AI Mentor</h2>
          <button
            onClick={newChat}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[12px] font-medium bg-[#f6f8fa] dark:bg-[#21262d] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] hover:bg-[#eaeef2] dark:hover:bg-[#30363d] transition-colors cursor-pointer"
          >
            <HiOutlinePlus className="w-3.5 h-3.5 text-[#636c76] dark:text-[#848d97]" />
            New conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && (
            <p className="text-[12px] text-[#636c76] dark:text-[#848d97] text-center py-8">No conversations yet</p>
          )}
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => loadConversation(c.id)}
              className={clsx(
                'group w-full flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer text-left',
                activeId === c.id
                  ? 'bg-[#ddf4ff] dark:bg-[#121d2f]'
                  : 'hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]',
              )}
            >
              <div className="w-8 h-8 rounded-full shrink-0 bg-gradient-to-br from-[#0969da] to-[#8250df] flex items-center justify-center">
                <img src="/icons/ai-icon.png" alt="AI" className="w-4 h-4 object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={clsx(
                  'text-[12px] truncate font-medium',
                  activeId === c.id ? 'text-[#1f2328] dark:text-[#e6edf3]' : 'text-[#636c76] dark:text-[#848d97]',
                )}>
                  {c.title}
                </p>
              </div>
              <button
                onClick={(e) => deleteConversation(c.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-[#d1242f] dark:hover:text-[#f85149] text-[#636c76] dark:text-[#848d97] transition-all cursor-pointer"
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
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.length === 0 && !streaming && (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0969da] to-[#8250df] flex items-center justify-center">
                <img src="/icons/ai-icon.png" alt="AI" className="w-6 h-6 object-contain" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Start a conversation</p>
                <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mt-1 max-w-xs">
                  Ask me anything about your career, skills, or opportunities.
                </p>
              </div>
              {suggestions.length > 0 && (
                <div className="w-full max-w-sm space-y-2">
                  <p className="text-[10px] font-semibold text-[#636c76] dark:text-[#848d97] uppercase tracking-widest flex items-center gap-1.5 justify-center">
                    <HiOutlineLightBulb className="w-3.5 h-3.5" /> Suggestions
                  </p>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s.message)}
                      className="w-full text-left px-4 py-2.5 rounded-xl border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#21262d] text-[12px] text-[#636c76] dark:text-[#848d97] hover:border-[#0969da] dark:hover:border-[#2f81f7] hover:text-[#0969da] dark:hover:text-[#2f81f7] transition-colors cursor-pointer"
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
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-[#f6f8fa] dark:bg-[#21262d] flex items-center gap-1.5">
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
        <div className="px-4 py-3 border-t border-[#d0d7de]/60 dark:border-[#30363d]">
          <div className="flex items-center gap-2">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask your career mentor…"
              className="flex-1 px-4 py-2.5 rounded-xl text-[13px] bg-[#f6f8fa] dark:bg-[#21262d] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#636c76] dark:placeholder-[#848d97] outline-none focus:border-[#0969da] dark:focus:border-[#2f81f7] transition-colors resize-none max-h-32 overflow-y-auto"
              style={{ height: 'auto' }}
              onInput={(e) => {
                const t = e.currentTarget
                t.style.height = 'auto'
                t.style.height = `${Math.min(t.scrollHeight, 128)}px`
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || streaming}
              className={clsx(
                'p-2.5 rounded-xl transition-colors cursor-pointer shrink-0',
                input.trim() && !streaming
                  ? 'bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] dark:hover:bg-[#388bfd]'
                  : 'bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97] cursor-not-allowed',
              )}
            >
              <HiOutlinePaperAirplane className="w-[18px] h-[18px]" />
            </button>
          </div>
          <p className="text-center text-[10px] text-[#636c76] dark:text-[#848d97] mt-2">AI can make mistakes. Verify important information.</p>
        </div>
      </div>
    </div>
  )
}

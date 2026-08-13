import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import {
  HiOutlinePaperAirplane, HiOutlinePlus, HiOutlineTrash, HiOutlineArrowPath,
} from 'react-icons/hi2'
import { aiService, type ConversationBrief, type MentorMessage, type ProactiveSuggestion } from '../../services/ai'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

function formatTime(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const diffMins = Math.floor((Date.now() - d.getTime()) / 60000)
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
        'max-w-[70%] px-3 py-2 font-mono text-[11px] leading-relaxed',
        isUser
          ? 'bg-[#e8490f] dark:bg-[#ff6b35] text-white'
          : 'bg-white dark:bg-[#1e2228] text-[#1f2328] dark:text-[#e6edf3] border border-[#e2e4e8] dark:border-[#2a2f38]',
      )}>
        <p className="whitespace-pre-wrap">{msg.content}</p>
        {msg.created_at && (
          <p className={clsx('font-mono text-[8px] mt-1', isUser ? 'text-white/60' : 'text-[#636c76] dark:text-[#848d97]')}>
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
    setInput('')
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
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

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
              if (parsed.content) {
                accumulated += parsed.content
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

  const activeConvo = conversations.find((c) => c.id === activeId)

  return (
    <div className="flex h-[calc(100vh-112px)] overflow-hidden border border-[#e2e4e8] dark:border-[#1e2228]">

      {/* ── Sidebar ── */}
      <div className="w-[240px] shrink-0 border-r border-[#e2e4e8] dark:border-[#1e2228] flex flex-col bg-white dark:bg-[#0d1117]">

        {/* Header */}
        <div className="px-3 py-2.5 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
            <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">ai mentor</span>
          </div>
          <button
            onClick={newChat}
            className="flex items-center gap-1 px-2 py-1 font-mono text-[9px] tracking-wide border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97] hover:border-[#e8490f] dark:hover:border-[#ff6b35] hover:text-[#e8490f] dark:hover:text-[#ff6b35] transition-colors cursor-pointer"
          >
            <HiOutlinePlus className="w-3 h-3" />
            new
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] text-center py-8">
              ~ no conversations yet
            </p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => loadConversation(c.id)}
                className={clsx(
                  'group w-full flex items-center gap-2.5 px-3 py-3 transition-colors cursor-pointer text-left border-b border-[#e2e4e8] dark:border-[#1e2228] last:border-0',
                  activeId === c.id
                    ? 'bg-[#f6f8fa] dark:bg-[#1e2228] border-l-2 border-l-[#e8490f] dark:border-l-[#ff6b35]'
                    : 'hover:bg-[#f6f8fa] dark:hover:bg-[#0d1117]',
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[10px] truncate text-[#1f2328] dark:text-[#e6edf3]">
                    {c.title}
                  </p>
                  <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] mt-0.5">
                    {formatTime(c.updated_at)}
                  </p>
                </div>
                <button
                  onClick={(e) => deleteConversation(c.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#636c76] dark:text-[#848d97] hover:text-[#d1242f] dark:hover:text-[#f85149] transition-all cursor-pointer"
                >
                  <HiOutlineTrash className="w-3 h-3" />
                </button>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#f6f8fa] dark:bg-[#0a0c0f]">

        {/* Chat header */}
        {activeConvo && (
          <div className="px-4 py-2.5 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-white dark:bg-[#0d1117] shrink-0">
            <p className="font-mono text-[10px] font-medium text-[#1f2328] dark:text-[#e6edf3] truncate">
              {activeConvo.title}
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {messages.length === 0 && !streaming && (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
              <div>
                <p className="font-mono text-[11px] font-medium text-[#1f2328] dark:text-[#e6edf3]">
                  career mentor
                </p>
                <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] mt-1 max-w-xs leading-relaxed">
                  ask me anything about your career, skills, or opportunities
                </p>
              </div>

              {suggestions.length > 0 && (
                <div className="w-full max-w-sm space-y-1.5">
                  <p className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase mb-2">
                    suggestions
                  </p>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s.message)}
                      className="w-full text-left px-3 py-2 font-mono text-[10px] text-[#636c76] dark:text-[#848d97] border border-[#e2e4e8] dark:border-[#1e2228] bg-white dark:bg-[#0d1117] hover:border-[#e8490f] dark:hover:border-[#ff6b35] hover:text-[#e8490f] dark:hover:text-[#ff6b35] transition-colors cursor-pointer"
                    >
                      <span className="text-[#e8490f] dark:text-[#ff6b35] mr-1.5">›</span>
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
              <div className="px-3 py-2.5 bg-white dark:bg-[#1e2228] border border-[#e2e4e8] dark:border-[#2a2f38] flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 bg-[#636c76] dark:bg-[#848d97]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-[#e2e4e8] dark:border-[#1e2228] bg-white dark:bg-[#0d1117] shrink-0">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-2.5 font-mono text-[9px] text-[#636c76] dark:text-[#848d97] pointer-events-none select-none">
                {streaming ? <HiOutlineArrowPath className="w-3 h-3 animate-spin" /> : '>'}
              </span>
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="ask your career mentor…"
                disabled={streaming}
                className="w-full pl-8 pr-3 py-2 font-mono text-[11px] tracking-wide bg-[#f6f8fa] dark:bg-[#0a0c0f] border border-[#e2e4e8] dark:border-[#1e2228] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#adb5bd] dark:placeholder-[#4a5568] outline-none focus:border-[#e8490f] dark:focus:border-[#ff6b35] transition-colors resize-none max-h-32 overflow-y-auto disabled:opacity-50"
                onInput={(e) => {
                  const t = e.currentTarget
                  t.style.height = 'auto'
                  t.style.height = `${Math.min(t.scrollHeight, 128)}px`
                }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || streaming}
              className={clsx(
                'p-2 mb-px transition-colors cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed',
                input.trim() && !streaming
                  ? 'bg-[#e8490f] dark:bg-[#ff6b35] text-white hover:bg-[#d03d0a] dark:hover:bg-[#e85c20]'
                  : 'bg-[#f6f8fa] dark:bg-[#1e2228] text-[#636c76] dark:text-[#848d97] border border-[#e2e4e8] dark:border-[#1e2228]',
              )}
            >
              <HiOutlinePaperAirplane className="w-4 h-4" />
            </button>
          </div>
          <p className="font-mono text-[8px] text-[#636c76] dark:text-[#848d97] mt-2 text-center">
            ai can make mistakes — verify important information
          </p>
        </div>
      </div>
    </div>
  )
}

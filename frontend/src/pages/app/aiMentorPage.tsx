import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
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

const mdComponents: React.ComponentProps<typeof ReactMarkdown>['components'] = {
  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => <p className="font-bold text-[13px] mb-1 mt-2">{children}</p>,
  h2: ({ children }) => <p className="font-bold text-[12px] mb-1 mt-2">{children}</p>,
  h3: ({ children }) => <p className="font-semibold mb-1 mt-1.5">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  code: ({ className, children, ...props }) => {
    const isBlock = className?.includes('language-')
    return isBlock
      ? <code className={clsx(className, 'block text-[11px] leading-relaxed')} {...props}>{children}</code>
      : <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 text-[11px] rounded font-mono">{children}</code>
  },
  pre: ({ children }) => <pre className="mb-2 overflow-x-auto text-[11px] leading-relaxed rounded-lg border border-border-default dark:border-border-dark-default">{children}</pre>,
  blockquote: ({ children }) => <blockquote className="border-l-2 border-brand dark:border-brand-dark-DEFAULT pl-3 text-fg-muted dark:text-fg-dark-muted mb-2">{children}</blockquote>,
  a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" className="text-brand dark:text-brand-dark-DEFAULT underline underline-offset-2">{children}</a>,
  table: ({ children }) => <div className="overflow-x-auto mb-2"><table className="w-full text-[11px] border-collapse border border-border-default dark:border-border-dark-default">{children}</table></div>,
  th: ({ children }) => <th className="border border-border-default dark:border-border-dark-default px-2 py-1 bg-canvas-inset dark:bg-canvas-dark-inset font-semibold text-left">{children}</th>,
  td: ({ children }) => <td className="border border-border-default dark:border-border-dark-default px-2 py-1">{children}</td>,
}

function MessageBubble({ msg }: { msg: MentorMessage }) {
  const isUser = msg.role === 'user'
  return (
    <div className={clsx('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className={clsx(
        'max-w-[75%] px-3 py-2.5 text-[12px] leading-relaxed rounded-2xl',
        isUser
          ? 'bg-brand dark:bg-brand-dark-DEFAULT text-white rounded-br-sm'
          : 'bg-canvas-overlay dark:bg-canvas-dark-overlay text-fg-default dark:text-fg-dark-default border border-border-default dark:border-border-dark-default rounded-bl-sm',
      )}>
        {isUser
          ? <p className="whitespace-pre-wrap">{msg.content}</p>
          : <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={mdComponents}>{msg.content}</ReactMarkdown>
        }
        {msg.created_at && (
          <p className={clsx('text-[10px] mt-1', isUser ? 'text-white/60' : 'text-fg-muted dark:text-fg-dark-muted')}>
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
  const activeIdRef = useRef<string | null>(null)
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
    activeIdRef.current = id
    const conv = await aiService.getConversation(id)
    setMessages(conv.messages)
  }

  const newChat = () => {
    setActiveId(null)
    activeIdRef.current = null
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
    const conversationId = activeIdRef.current
    let accumulated = ''

    try {
      const res = await fetch(`${BASE}/mentor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: content, conversation_id: conversationId }),
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
              if (parsed.conversation_id && !activeIdRef.current) {
                setActiveId(parsed.conversation_id)
                activeIdRef.current = parsed.conversation_id
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
    <div className="flex h-[calc(100vh-112px)] overflow-hidden border border-border-default dark:border-border-dark-default rounded-xl">

      {/* Sidebar */}
      <div className="w-[240px] shrink-0 border-r border-border-default dark:border-border-dark-default flex flex-col bg-canvas-overlay dark:bg-canvas-dark-inset">

        <div className="px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset flex items-center justify-between">
          <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">AI Mentor</span>
          <button
            onClick={newChat}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-lg border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer"
          >
            <HiOutlinePlus className="w-3 h-3" />
            New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted text-center py-8">
              No conversations yet
            </p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => loadConversation(c.id)}
                className={clsx(
                  'group w-full flex items-center gap-2.5 px-3 py-3 transition-colors cursor-pointer text-left border-b border-border-default dark:border-border-dark-default last:border-0 border-l-2',
                  activeId === c.id
                    ? 'bg-canvas-inset dark:bg-canvas-dark-overlay border-l-brand dark:border-l-brand-dark-DEFAULT'
                    : 'border-l-transparent hover:bg-canvas-inset dark:hover:bg-canvas-dark-overlay',
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium truncate text-fg-default dark:text-fg-dark-default">
                    {c.title}
                  </p>
                  <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted mt-0.5">
                    {formatTime(c.updated_at)}
                  </p>
                </div>
                <button
                  onClick={(e) => deleteConversation(c.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-fg-muted dark:text-fg-dark-muted hover:text-danger-fg dark:hover:text-danger-dark-fg transition-all cursor-pointer"
                >
                  <HiOutlineTrash className="w-3.5 h-3.5" />
                </button>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-canvas-subtle dark:bg-canvas-dark-default">

        {activeConvo && (
          <div className="px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-overlay dark:bg-canvas-dark-inset shrink-0">
            <p className="text-[12px] font-semibold text-fg-default dark:text-fg-dark-default truncate">
              {activeConvo.title}
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {messages.length === 0 && !streaming && (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
              <div>
                <p className="text-[14px] font-semibold text-fg-default dark:text-fg-dark-default">
                  Career Mentor
                </p>
                <p className="text-[12px] text-fg-muted dark:text-fg-dark-muted mt-1 max-w-xs leading-relaxed">
                  Ask me anything about your career, skills, or opportunities
                </p>
              </div>

              {suggestions.length > 0 && (
                <div className="w-full max-w-sm space-y-1.5">
                  <p className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted mb-2">
                    Suggestions
                  </p>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s.message)}
                      className="w-full text-left px-3 py-2 text-[12px] text-fg-muted dark:text-fg-dark-muted rounded-lg border border-border-default dark:border-border-dark-default bg-canvas-overlay dark:bg-canvas-dark-inset hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer"
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
              <div className="px-3 py-2.5 rounded-2xl rounded-bl-sm bg-canvas-overlay dark:bg-canvas-dark-overlay border border-border-default dark:border-border-dark-default flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-fg-muted dark:bg-fg-dark-muted"
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
        <div className="px-4 py-3 border-t border-border-default dark:border-border-dark-default bg-canvas-overlay dark:bg-canvas-dark-inset shrink-0">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-2.5 text-[11px] text-brand dark:text-brand-dark-DEFAULT pointer-events-none select-none font-mono">
                {streaming ? <HiOutlineArrowPath className="w-3.5 h-3.5 animate-spin" /> : '>'}
              </span>
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask your career mentor…"
                disabled={streaming}
                className="w-full pl-8 pr-3 py-2 font-mono text-[12px] rounded-lg bg-canvas-subtle dark:bg-canvas-dark-default border border-border-default dark:border-border-dark-default text-fg-default dark:text-fg-dark-default placeholder-fg-subtle dark:placeholder-fg-dark-subtle outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand dark:focus:border-brand-dark-DEFAULT transition-colors resize-none max-h-32 overflow-y-auto disabled:opacity-50"
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
                'p-2 mb-px rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed',
                input.trim() && !streaming
                  ? 'bg-brand dark:bg-brand-dark-DEFAULT text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover'
                  : 'bg-canvas-inset dark:bg-canvas-dark-overlay text-fg-muted dark:text-fg-dark-muted border border-border-default dark:border-border-dark-default',
              )}
            >
              <HiOutlinePaperAirplane className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-fg-muted dark:text-fg-dark-muted mt-2 text-center">
            AI can make mistakes — verify important information
          </p>
        </div>
      </div>
    </div>
  )
}

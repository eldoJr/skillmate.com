import { useEffect, useRef, useState, useCallback } from 'react'
import { clsx } from 'clsx'
import {
  HiOutlineMagnifyingGlass, HiOutlinePaperAirplane,
  HiOutlinePaperClip, HiOutlineFaceSmile, HiOutlineEllipsisHorizontal,
} from 'react-icons/hi2'
import Avatar from '../../components/atoms/avatar'
import { messagesService, type ConversationSummary, type Message } from '../../services/messages'
import { useAuth } from '../../contexts/AuthContext'

function partnerName(p: ConversationSummary['partner']) {
  return `${p.first_name} ${p.last_name}`
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`
  return `${Math.floor(diffMins / 1440)}d`
}

export default function MessagesPage() {
  const { user, token } = useAuth()
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [search, setSearch] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const activeConvo = conversations.find((c) => c.partner.id === activePartnerId)

  const loadConversations = useCallback(async () => {
    const data = await messagesService.getConversations()
    setConversations(data)
    if (!activePartnerId && data.length > 0) setActivePartnerId(data[0].partner.id)
  }, [activePartnerId])

  useEffect(() => { loadConversations() }, [loadConversations])

  useEffect(() => {
    if (!activePartnerId) return
    messagesService.getThread(activePartnerId).then((data) => {
      setMessages([...data].reverse())
      messagesService.markRead(activePartnerId)
      setConversations((prev) => prev.map((c) => c.partner.id === activePartnerId ? { ...c, unread_count: 0 } : c))
    })
  }, [activePartnerId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // WebSocket for live messages
  useEffect(() => {
    if (!token) return
    const apiBase = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1').replace(/^http/, 'ws')
    const ws = new WebSocket(`${apiBase}/messages/ws?token=${token}`)
    wsRef.current = ws
    ws.onmessage = (e) => {
      const { event, data } = JSON.parse(e.data)
      if (event === 'new_message') {
        const msg = data as Message
        if (msg.sender.id === activePartnerId || msg.receiver_id === activePartnerId) {
          setMessages((prev) => [...prev, msg])
        }
        loadConversations()
      }
    }
    return () => ws.close()
  }, [token, activePartnerId, loadConversations])

  const sendMessage = async () => {
    if (!newMessage.trim() || !activePartnerId) return
    const msg = await messagesService.send(activePartnerId, newMessage.trim())
    setMessages((prev) => [...prev, msg])
    setNewMessage('')
    loadConversations()
  }

  const filtered = conversations.filter((c) =>
    !search || partnerName(c.partner).toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex gap-0 h-[calc(100vh-112px)] rounded-2xl overflow-hidden bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d]">

      <div className="w-[280px] shrink-0 border-r border-[#d0d7de] dark:border-[#30363d] flex flex-col">
        <div className="p-4 border-b border-[#d0d7de]/60 dark:border-[#30363d]">
          <h2 className="text-[14px] font-semibold text-[#1f2328] dark:text-[#e6edf3] mb-3">Messages</h2>
          <div className="relative">
            <HiOutlineMagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#636c76] dark:text-[#848d97] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full pl-8 pr-3 py-2 rounded-lg text-[12px] bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#636c76] dark:placeholder-[#848d97] outline-none focus:border-[#0969da] dark:focus:border-[#2f81f7] transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="text-[12px] text-[#636c76] dark:text-[#848d97] text-center py-8">No conversations yet</p>
          )}
          {filtered.map((convo) => (
            <button
              key={convo.partner.id}
              onClick={() => setActivePartnerId(convo.partner.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer text-left',
                activePartnerId === convo.partner.id
                  ? 'bg-[#ddf4ff] dark:bg-[#121d2f]'
                  : 'hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]',
              )}
            >
              <Avatar name={partnerName(convo.partner)} src={convo.partner.avatar_url ?? undefined} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={clsx('text-[12px] truncate', convo.unread_count > 0 ? 'font-bold text-[#1f2328] dark:text-[#e6edf3]' : 'font-medium text-[#636c76] dark:text-[#848d97]')}>
                    {partnerName(convo.partner)}
                  </p>
                  <span className="text-[10px] text-[#636c76] dark:text-[#848d97] shrink-0 ml-2">{formatTime(convo.last_message_at)}</span>
                </div>
                <p className={clsx('text-[11px] truncate mt-0.5', convo.unread_count > 0 ? 'text-[#1f2328] dark:text-[#e6edf3] font-medium' : 'text-[#636c76] dark:text-[#848d97]')}>
                  {convo.last_message}
                </p>
              </div>
              {convo.unread_count > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#0969da] dark:bg-[#2f81f7] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                  {convo.unread_count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {!activeConvo ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[13px] text-[#636c76] dark:text-[#848d97]">Select a conversation</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#d0d7de]/60 dark:border-[#30363d]">
              <div className="flex items-center gap-3">
                <Avatar name={partnerName(activeConvo.partner)} src={activeConvo.partner.avatar_url ?? undefined} size="sm" />
                <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">{partnerName(activeConvo.partner)}</p>
              </div>
              <button className="p-2 rounded-lg text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors cursor-pointer">
                <HiOutlineEllipsisHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.map((msg) => {
                const isMe = msg.sender.id === user?.id
                return (
                  <div key={msg.id} className={clsx('flex', isMe ? 'justify-end' : 'justify-start')}>
                    <div className={clsx(
                      'max-w-[70%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed',
                      isMe
                        ? 'bg-[#0969da] dark:bg-[#2f81f7] text-white rounded-br-md'
                        : 'bg-[#f6f8fa] dark:bg-[#21262d] text-[#1f2328] dark:text-[#e6edf3] rounded-bl-md',
                    )}>
                      <p>{msg.content}</p>
                      <p className={clsx('text-[9px] mt-1', isMe ? 'text-white/60' : 'text-[#636c76] dark:text-[#848d97]')}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            <div className="px-4 py-3 border-t border-[#d0d7de]/60 dark:border-[#30363d]">
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors cursor-pointer">
                  <HiOutlinePaperClip className="w-[18px] h-[18px]" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 px-4 py-2.5 rounded-xl text-[13px] bg-[#f6f8fa] dark:bg-[#21262d] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#636c76] dark:placeholder-[#848d97] outline-none focus:border-[#0969da] dark:focus:border-[#2f81f7] transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button className="p-2 rounded-lg text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors cursor-pointer">
                  <HiOutlineFaceSmile className="w-[18px] h-[18px]" />
                </button>
                <button
                  onClick={sendMessage}
                  className={clsx(
                    'p-2.5 rounded-xl transition-colors cursor-pointer',
                    newMessage.trim()
                      ? 'bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] dark:hover:bg-[#388bfd]'
                      : 'bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97]',
                  )}
                >
                  <HiOutlinePaperAirplane className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

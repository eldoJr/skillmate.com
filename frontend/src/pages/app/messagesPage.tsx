import { useEffect, useRef, useState, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlinePaperAirplane, HiOutlineLockClosed, HiOutlineArrowPath,
} from 'react-icons/hi2'
import Avatar from '../../components/atoms/avatar'
import { messagesService, type ConversationSummary, type Message } from '../../services/messages'
import { usersService } from '../../services/users'
import type { AuthUser } from '../../services/auth'
import { useAuth } from '../../contexts/AuthContext'

function partnerName(p: ConversationSummary['partner']) {
  return `${p.first_name} ${p.last_name}`.trim()
}

function formatTime(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const diffMins = Math.floor((Date.now() - d.getTime()) / 60000)
  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`
  if (diffMins < 10080) return d.toLocaleDateString('en-US', { weekday: 'short' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatMsgTime(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function groupByDate(msgs: Message[]) {
  const groups: { label: string; messages: Message[] }[] = []
  let lastLabel = ''
  for (const msg of msgs) {
    const d = new Date(msg.createdAt)
    const today = new Date()
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
    let label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    if (d.toDateString() === today.toDateString()) label = 'today'
    else if (d.toDateString() === yesterday.toDateString()) label = 'yesterday'
    if (label !== lastLabel) { groups.push({ label, messages: [] }); lastLabel = label }
    groups[groups.length - 1].messages.push(msg)
  }
  return groups
}

export default function MessagesPage() {
  const { user, token } = useAuth()
  const [searchParams] = useSearchParams()
  const partnerParam = searchParams.get('partner')

  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [loadingConvos, setLoadingConvos] = useState(true)
  const [activePartnerId, setActivePartnerId] = useState<string | null>(partnerParam)
  const [messages, setMessages] = useState<Message[]>([])
  const [partnerProfile, setPartnerProfile] = useState<AuthUser | null>(null)
  const [search, setSearch] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [loadingThread, setLoadingThread] = useState(false)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeConvo = conversations.find((c) => c.partner.id === activePartnerId)
  const activePartner = activeConvo?.partner

  const loadConversations = useCallback(async () => {
    const data = await messagesService.getConversations()
    setConversations(data)
    setLoadingConvos(false)
  }, [])

  useEffect(() => { loadConversations() }, [loadConversations])

  useEffect(() => {
    if (!activePartnerId) return
    if (activeConvo) { setPartnerProfile(null); return }
    usersService.getPublicProfile(activePartnerId).then(setPartnerProfile).catch(() => {})
  }, [activePartnerId, activeConvo])

  useEffect(() => {
    if (!activePartnerId) return
    setLoadingThread(true)
    setMessages([])
    messagesService.getThread(activePartnerId).then((data) => {
      setMessages([...data].reverse())
      messagesService.markRead(activePartnerId)
      setConversations((prev) => prev.map((c) =>
        c.partner.id === activePartnerId ? { ...c, unread_count: 0 } : c
      ))
    }).finally(() => setLoadingThread(false))
  }, [activePartnerId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!token) return
    const apiBase = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1').replace(/^http/, 'ws')
    const ws = new WebSocket(`${apiBase}/messages/ws?token=${token}`)
    ws.onmessage = (e) => {
      const { event, data } = JSON.parse(e.data)
      if (event === 'new_message') {
        const msg = data as Message
        setActivePartnerId((pid) => {
          if (msg.senderId === pid) setMessages((prev) => [...prev, msg])
          return pid
        })
        loadConversations()
      }
    }
    return () => ws.close()
  }, [token, loadConversations])

  const sendMessage = async () => {
    if (!newMessage.trim() || !activePartnerId || sending) return
    setSending(true)
    try {
      const msg = await messagesService.send(activePartnerId, newMessage.trim())
      setMessages((prev) => [...prev, msg])
      setNewMessage('')
      loadConversations()
      inputRef.current?.focus()
    } finally { setSending(false) }
  }

  const selectPartner = (id: string) => {
    if (id === activePartnerId) return
    setActivePartnerId(id)
    setMessages([])
  }

  const filtered = conversations.filter((c) =>
    !search || partnerName(c.partner).toLowerCase().includes(search.toLowerCase())
  )

  const displayPartner = activePartner ?? (partnerProfile ? {
    id: partnerProfile.id,
    first_name: partnerProfile.first_name,
    last_name: partnerProfile.last_name,
    avatar_url: partnerProfile.avatar_url,
  } : null)

  const grouped = groupByDate(messages)
  const totalUnread = conversations.reduce((s, c) => s + c.unread_count, 0)

  return (
    <div className="flex h-[calc(100vh-112px)] overflow-hidden border border-[#e2e4e8] dark:border-[#1e2228]">

      {/* ── Sidebar ── */}
      <div className="w-[260px] shrink-0 border-r border-[#e2e4e8] dark:border-[#1e2228] flex flex-col bg-white dark:bg-[#0d1117]">

        {/* Sidebar header */}
        <div className="px-3 py-2.5 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
            <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">messages</span>
          </div>
          {totalUnread > 0 && (
            <span className="px-1.5 py-0.5 font-mono text-[9px] bg-[#e8490f] dark:bg-[#ff6b35] text-white">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-[#e2e4e8] dark:border-[#1e2228]">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-[9px] text-[#636c76] dark:text-[#848d97] pointer-events-none">$</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="search…"
              className="w-full pl-7 pr-3 py-1.5 font-mono text-[10px] tracking-wide bg-white dark:bg-[#0d1117] border border-[#e2e4e8] dark:border-[#1e2228] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#adb5bd] dark:placeholder-[#4a5568] outline-none focus:border-[#e8490f] dark:focus:border-[#ff6b35] transition-colors"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loadingConvos ? (
            <div>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3 py-3 border-b border-[#e2e4e8] dark:border-[#1e2228]">
                  <div className="w-8 h-8 bg-[#f6f8fa] dark:bg-[#1e2228] animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2 w-20 bg-[#f6f8fa] dark:bg-[#1e2228] animate-pulse" />
                    <div className="h-2 w-28 bg-[#f6f8fa] dark:bg-[#1e2228] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 py-12 px-4 text-center">
              <p className="font-mono text-[10px] text-[#636c76] dark:text-[#848d97]">
                {search ? '~ no results' : '~ no conversations yet'}
              </p>
              {!search && (
                <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] leading-relaxed">
                  visit a student's profile to start a conversation
                </p>
              )}
            </div>
          ) : (
            filtered.map((convo) => {
              const isActive = activePartnerId === convo.partner.id
              const name = partnerName(convo.partner)
              return (
                <button
                  key={convo.partner.id}
                  onClick={() => selectPartner(convo.partner.id)}
                  className={clsx(
                    'w-full flex items-center gap-2.5 px-3 py-3 transition-colors cursor-pointer text-left border-b border-[#e2e4e8] dark:border-[#1e2228] last:border-0',
                    isActive
                      ? 'bg-[#f6f8fa] dark:bg-[#1e2228] border-l-2 border-l-[#e8490f] dark:border-l-[#ff6b35]'
                      : 'hover:bg-[#f6f8fa] dark:hover:bg-[#0d1117]',
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar name={name} src={convo.partner.avatar_url ?? undefined} size="md" />
                    {convo.unread_count > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#e8490f] dark:bg-[#ff6b35] text-white font-mono text-[7px] font-bold flex items-center justify-center">
                        {convo.unread_count > 9 ? '9+' : convo.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={clsx(
                        'font-mono text-[10px] truncate',
                        convo.unread_count > 0
                          ? 'font-bold text-[#1f2328] dark:text-[#e6edf3]'
                          : 'font-medium text-[#1f2328] dark:text-[#e6edf3]'
                      )}>
                        {name}
                      </p>
                      <span className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] shrink-0">
                        {formatTime(convo.last_message_at)}
                      </span>
                    </div>
                    <p className={clsx(
                      'font-mono text-[9px] truncate mt-0.5',
                      convo.unread_count > 0
                        ? 'text-[#1f2328] dark:text-[#e6edf3] font-medium'
                        : 'text-[#636c76] dark:text-[#848d97]'
                    )}>
                      {convo.last_message || 'start a conversation'}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#f6f8fa] dark:bg-[#0a0c0f]">
        <AnimatePresence mode="wait">
          {!activePartnerId ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center"
            >
              <p className="font-mono text-[11px] text-[#1f2328] dark:text-[#e6edf3]">
                select a conversation
              </p>
              <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] max-w-[240px] leading-relaxed">
                or visit a student's profile to start a new one
              </p>
              <div className="flex items-center gap-1.5 px-3 py-2 border border-[#e2e4e8] dark:border-[#1e2228] bg-white dark:bg-[#0d1117]">
                <HiOutlineLockClosed className="w-3 h-3 text-[#636c76] dark:text-[#848d97] shrink-0" />
                <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97]">
                  messages are private between you and the recipient
                </p>
              </div>
              {conversations.length > 0 && (
                <p className="font-mono text-[9px] text-[#e8490f] dark:text-[#ff6b35]">
                  › {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} in sidebar
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={activePartnerId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col min-h-0"
            >
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-white dark:bg-[#0d1117] shrink-0">
                {displayPartner ? (
                  <>
                    <Avatar
                      name={`${displayPartner.first_name} ${displayPartner.last_name}`}
                      src={displayPartner.avatar_url ?? undefined}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/app/profile/${displayPartner.id}`}
                        className="font-mono text-[11px] font-medium text-[#1f2328] dark:text-[#e6edf3] hover:text-[#e8490f] dark:hover:text-[#ff6b35] transition-colors block truncate"
                      >
                        {`${displayPartner.first_name} ${displayPartner.last_name}`.trim()}
                      </Link>
                      <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97]">skillmate student</p>
                    </div>
                    <Link
                      to={`/app/profile/${displayPartner.id}`}
                      className="shrink-0 px-3 py-1.5 font-mono text-[9px] tracking-wide border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97] hover:border-[#e8490f] dark:hover:border-[#ff6b35] hover:text-[#e8490f] dark:hover:text-[#ff6b35] transition-colors"
                    >
                      view profile
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 bg-[#f6f8fa] dark:bg-[#1e2228] animate-pulse" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 w-24 bg-[#f6f8fa] dark:bg-[#1e2228] animate-pulse" />
                      <div className="h-2 w-16 bg-[#f6f8fa] dark:bg-[#1e2228] animate-pulse" />
                    </div>
                  </>
                )}
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4">
                {loadingThread ? (
                  <div className="flex items-center justify-center h-full">
                    <HiOutlineArrowPath className="w-4 h-4 text-[#636c76] dark:text-[#848d97] animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    {displayPartner && (
                      <Avatar
                        name={`${displayPartner.first_name} ${displayPartner.last_name}`}
                        src={displayPartner.avatar_url ?? undefined}
                        size="lg"
                      />
                    )}
                    <p className="font-mono text-[10px] font-medium text-[#1f2328] dark:text-[#e6edf3] mt-1">
                      {displayPartner ? `${displayPartner.first_name} ${displayPartner.last_name}`.trim() : ''}
                    </p>
                    <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97]">
                      no messages yet — say hello
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {grouped.map((group) => (
                      <div key={group.label}>
                        {/* Date divider */}
                        <div className="flex items-center gap-3 my-4">
                          <div className="flex-1 h-px bg-[#e2e4e8] dark:bg-[#1e2228]" />
                          <span className="font-mono text-[9px] tracking-wide text-[#636c76] dark:text-[#848d97] px-2 py-0.5 border border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0a0c0f]">
                            {group.label}
                          </span>
                          <div className="flex-1 h-px bg-[#e2e4e8] dark:bg-[#1e2228]" />
                        </div>
                        <div className="space-y-0.5">
                          {group.messages.map((msg, i) => {
                            const isMe = msg.senderId === user?.id
                            const prev = group.messages[i - 1]
                            const next = group.messages[i + 1]
                            const isFirstInBlock = !prev || prev.senderId !== msg.senderId
                            const isLastInBlock = !next || next.senderId !== msg.senderId

                            return (
                              <div
                                key={msg.id}
                                className={clsx(
                                  'flex items-end gap-2',
                                  isMe ? 'justify-end' : 'justify-start',
                                  isFirstInBlock ? 'mt-3' : 'mt-0.5',
                                )}
                              >
                                {/* Partner avatar */}
                                {!isMe && (
                                  <div className="w-6 shrink-0 self-end mb-0.5">
                                    {isLastInBlock && displayPartner ? (
                                      <Avatar
                                        name={`${displayPartner.first_name} ${displayPartner.last_name}`}
                                        src={displayPartner.avatar_url ?? undefined}
                                        size="sm"
                                      />
                                    ) : null}
                                  </div>
                                )}

                                <div className={clsx('group flex flex-col max-w-[60%]', isMe ? 'items-end' : 'items-start')}>
                                  <div className={clsx(
                                    'px-3 py-2 font-mono text-[11px] leading-relaxed break-words',
                                    isMe
                                      ? 'bg-[#e8490f] dark:bg-[#ff6b35] text-white'
                                      : 'bg-white dark:bg-[#1e2228] text-[#1f2328] dark:text-[#e6edf3] border border-[#e2e4e8] dark:border-[#2a2f38]',
                                  )}>
                                    {msg.content}
                                  </div>
                                  {isLastInBlock && (
                                    <span className="font-mono text-[8px] text-[#636c76] dark:text-[#848d97] mt-1 px-0.5 opacity-0 group-hover:opacity-100 transition-opacity select-none">
                                      {formatMsgTime(msg.createdAt)}
                                      {isMe && (
                                        <span className="ml-1">
                                          {msg.isRead ? '· read' : '· sent'}
                                        </span>
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              {/* Input bar */}
              <div className="px-4 py-3 border-t border-[#e2e4e8] dark:border-[#1e2228] bg-white dark:bg-[#0d1117] shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={displayPartner ? `message ${displayPartner.first_name.toLowerCase()}…` : 'type a message…'}
                    className="flex-1 px-3 py-2 font-mono text-[11px] tracking-wide bg-[#f6f8fa] dark:bg-[#0a0c0f] border border-[#e2e4e8] dark:border-[#1e2228] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#adb5bd] dark:placeholder-[#4a5568] outline-none focus:border-[#e8490f] dark:focus:border-[#ff6b35] transition-colors"
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className={clsx(
                      'p-2 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
                      newMessage.trim()
                        ? 'bg-[#e8490f] dark:bg-[#ff6b35] text-white hover:bg-[#d03d0a] dark:hover:bg-[#e85c20]'
                        : 'bg-[#f6f8fa] dark:bg-[#1e2228] text-[#636c76] dark:text-[#848d97] border border-[#e2e4e8] dark:border-[#1e2228]',
                    )}
                  >
                    <HiOutlinePaperAirplane className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

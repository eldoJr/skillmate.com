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
    <div className="flex h-[calc(100vh-112px)] overflow-hidden border border-border-default dark:border-border-dark-default">

      {/* ── Sidebar ── */}
      <div className="w-[260px] shrink-0 border-r border-border-default dark:border-border-dark-default flex flex-col bg-canvas-overlay dark:bg-canvas-dark-inset">

        <div className="px-3 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand dark:bg-brand-dark-DEFAULT" />
            <span className="font-mono text-[9px] tracking-widest text-fg-muted dark:text-fg-dark-muted uppercase">messages</span>
          </div>
          {totalUnread > 0 && (
            <span className="px-1.5 py-0.5 font-mono text-[9px] bg-brand dark:bg-brand-dark-DEFAULT text-white">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-border-default dark:border-border-dark-default">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-[9px] text-brand dark:text-brand-dark-DEFAULT pointer-events-none">$</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="search…"
              className="w-full pl-7 pr-3 py-1.5 font-mono text-[10px] tracking-wide bg-canvas-overlay dark:bg-canvas-dark-inset border border-border-default dark:border-border-dark-default text-fg-default dark:text-fg-dark-default placeholder-fg-subtle dark:placeholder-fg-dark-subtle outline-none focus:border-brand dark:focus:border-brand-dark-DEFAULT transition-colors"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loadingConvos ? (
            <div>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3 py-3 border-b border-border-default dark:border-border-dark-default">
                  <div className="w-8 h-8 bg-canvas-inset dark:bg-border-dark-default animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2 w-20 bg-canvas-inset dark:bg-border-dark-default animate-pulse" />
                    <div className="h-2 w-28 bg-canvas-inset dark:bg-border-dark-default animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 py-12 px-4 text-center">
              <p className="font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted">
                {search ? '~ no results' : '~ no conversations yet'}
              </p>
              {!search && (
                <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted leading-relaxed">
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
                    'w-full flex items-center gap-2.5 px-3 py-3 transition-colors cursor-pointer text-left border-b border-border-default dark:border-border-dark-default last:border-0 border-l-2',
                    isActive
                      ? 'bg-canvas-inset dark:bg-canvas-dark-overlay border-l-brand dark:border-l-brand-dark-DEFAULT'
                      : 'border-l-transparent hover:bg-canvas-inset dark:hover:bg-canvas-dark-overlay',
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar name={name} src={convo.partner.avatar_url ?? undefined} size="md" />
                    {convo.unread_count > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-brand dark:bg-brand-dark-DEFAULT text-white font-mono text-[7px] font-bold flex items-center justify-center">
                        {convo.unread_count > 9 ? '9+' : convo.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={clsx(
                        'font-mono text-[10px] truncate',
                        convo.unread_count > 0
                          ? 'font-bold text-fg-default dark:text-fg-dark-default'
                          : 'font-medium text-fg-default dark:text-fg-dark-default',
                      )}>
                        {name}
                      </p>
                      <span className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted shrink-0">
                        {formatTime(convo.last_message_at)}
                      </span>
                    </div>
                    <p className={clsx(
                      'font-mono text-[9px] truncate mt-0.5',
                      convo.unread_count > 0
                        ? 'text-fg-default dark:text-fg-dark-default font-medium'
                        : 'text-fg-muted dark:text-fg-dark-muted',
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
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-canvas-subtle dark:bg-canvas-dark-default">
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
              <p className="font-mono text-[11px] text-fg-default dark:text-fg-dark-default">
                select a conversation
              </p>
              <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted max-w-[240px] leading-relaxed">
                or visit a student's profile to start a new one
              </p>
              <div className="flex items-center gap-1.5 px-3 py-2 border border-border-default dark:border-border-dark-default bg-canvas-overlay dark:bg-canvas-dark-inset">
                <HiOutlineLockClosed className="w-3 h-3 text-fg-muted dark:text-fg-dark-muted shrink-0" />
                <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted">
                  messages are private between you and the recipient
                </p>
              </div>
              {conversations.length > 0 && (
                <p className="font-mono text-[9px] text-brand dark:text-brand-dark-DEFAULT">
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
              <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-overlay dark:bg-canvas-dark-inset shrink-0">
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
                        className="font-mono text-[11px] font-medium text-fg-default dark:text-fg-dark-default hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors block truncate"
                      >
                        {`${displayPartner.first_name} ${displayPartner.last_name}`.trim()}
                      </Link>
                      <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted">skillmate student</p>
                    </div>
                    <Link
                      to={`/app/profile/${displayPartner.id}`}
                      className="shrink-0 px-3 py-1.5 font-mono text-[9px] tracking-wide border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors"
                    >
                      view profile
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 bg-canvas-inset dark:bg-border-dark-default animate-pulse" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 w-24 bg-canvas-inset dark:bg-border-dark-default animate-pulse" />
                      <div className="h-2 w-16 bg-canvas-inset dark:bg-border-dark-default animate-pulse" />
                    </div>
                  </>
                )}
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4">
                {loadingThread ? (
                  <div className="flex items-center justify-center h-full">
                    <HiOutlineArrowPath className="w-4 h-4 text-fg-muted dark:text-fg-dark-muted animate-spin" />
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
                    <p className="font-mono text-[10px] font-medium text-fg-default dark:text-fg-dark-default mt-1">
                      {displayPartner ? `${displayPartner.first_name} ${displayPartner.last_name}`.trim() : ''}
                    </p>
                    <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted">
                      no messages yet — say hello
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {grouped.map((group) => (
                      <div key={group.label}>
                        <div className="flex items-center gap-3 my-4">
                          <div className="flex-1 h-px bg-border-default dark:bg-border-dark-default" />
                          <span className="font-mono text-[9px] tracking-wide text-fg-muted dark:text-fg-dark-muted px-2 py-0.5 border border-border-default dark:border-border-dark-default bg-canvas-subtle dark:bg-canvas-dark-default">
                            {group.label}
                          </span>
                          <div className="flex-1 h-px bg-border-default dark:bg-border-dark-default" />
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
                                      ? 'bg-brand dark:bg-brand-dark-DEFAULT text-white'
                                      : 'bg-canvas-overlay dark:bg-canvas-dark-overlay text-fg-default dark:text-fg-dark-default border border-border-default dark:border-border-dark-default',
                                  )}>
                                    {msg.content}
                                  </div>
                                  {isLastInBlock && (
                                    <span className="font-mono text-[8px] text-fg-muted dark:text-fg-dark-muted mt-1 px-0.5 opacity-0 group-hover:opacity-100 transition-opacity select-none">
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
              <div className="px-4 py-3 border-t border-border-default dark:border-border-dark-default bg-canvas-overlay dark:bg-canvas-dark-inset shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={displayPartner ? `message ${displayPartner.first_name.toLowerCase()}…` : 'type a message…'}
                    className="flex-1 px-3 py-2 font-mono text-[11px] tracking-wide bg-canvas-subtle dark:bg-canvas-dark-default border border-border-default dark:border-border-dark-default text-fg-default dark:text-fg-dark-default placeholder-fg-subtle dark:placeholder-fg-dark-subtle outline-none focus:border-brand dark:focus:border-brand-dark-DEFAULT transition-colors"
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className={clsx(
                      'p-2 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
                      newMessage.trim()
                        ? 'bg-brand dark:bg-brand-dark-DEFAULT text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover'
                        : 'bg-canvas-inset dark:bg-canvas-dark-overlay text-fg-muted dark:text-fg-dark-muted border border-border-default dark:border-border-dark-default',
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

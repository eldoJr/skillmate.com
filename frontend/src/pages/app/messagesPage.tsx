import { useState } from 'react'
import { clsx } from 'clsx'
import {
  HiOutlineMagnifyingGlass,
  HiOutlinePaperAirplane,
  HiOutlinePaperClip,
  HiOutlineFaceSmile,
  HiOutlineEllipsisHorizontal,
  HiOutlinePhone,
  HiOutlineVideoCamera,
} from 'react-icons/hi2'
import Avatar from '../../components/atoms/avatar'

interface Conversation {
  id: string; name: string; avatar: string; lastMessage: string
  time: string; unread: number; online: boolean; university: string
}

interface Message {
  id: string; sender: 'me' | 'them'; text: string; time: string
}

const conversations: Conversation[] = [
  { id: '1', name: 'Amara K.', avatar: 'https://i.pravatar.cc/100?img=1', lastMessage: 'Sure, I can start on Monday!', time: '2m', unread: 2, online: true, university: 'UCT' },
  { id: '2', name: 'Tolu S.', avatar: 'https://i.pravatar.cc/100?img=3', lastMessage: 'Can you share your portfolio?', time: '15m', unread: 0, online: true, university: 'Wits' },
  { id: '3', name: 'James M.', avatar: 'https://i.pravatar.cc/100?img=8', lastMessage: 'Thanks for the session today!', time: '1h', unread: 1, online: false, university: 'UP' },
  { id: '4', name: 'Leila N.', avatar: 'https://i.pravatar.cc/100?img=9', lastMessage: 'I\'ll send the first draft tonight.', time: '3h', unread: 0, online: false, university: 'UCT' },
  { id: '5', name: 'Kwame B.', avatar: 'https://i.pravatar.cc/100?img=11', lastMessage: 'The report looks great, thank you!', time: '1d', unread: 0, online: true, university: 'Stellenbosch' },
]

const chatMessages: Record<string, Message[]> = {
  '1': [
    { id: 'm1', sender: 'them', text: 'Hi! I saw your React listing. I need help with a final year project.', time: '10:30 AM' },
    { id: 'm2', sender: 'me', text: 'Hey! Sure, I\'d love to help. What\'s the project about?', time: '10:32 AM' },
    { id: 'm3', sender: 'them', text: 'It\'s a student marketplace app — similar to what you\'ve built before.', time: '10:35 AM' },
    { id: 'm4', sender: 'me', text: 'Perfect, that\'s right in my wheelhouse. When do you need to start?', time: '10:38 AM' },
    { id: 'm5', sender: 'them', text: 'Sure, I can start on Monday!', time: '10:40 AM' },
  ],
  '2': [
    { id: 'm1', sender: 'them', text: 'Hi, I\'m looking for a UI/UX designer for my startup.', time: '9:00 AM' },
    { id: 'm2', sender: 'me', text: 'I\'d be happy to help! What kind of product is it?', time: '9:10 AM' },
    { id: 'm3', sender: 'them', text: 'Can you share your portfolio?', time: '9:20 AM' },
  ],
  '3': [
    { id: 'm1', sender: 'me', text: 'Great session today! You\'re picking up pandas really fast.', time: 'Yesterday' },
    { id: 'm2', sender: 'them', text: 'Thanks for the session today!', time: 'Yesterday' },
  ],
}

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState('1')
  const [search, setSearch] = useState('')
  const [newMessage, setNewMessage] = useState('')

  const activeConvo = conversations.find((c) => c.id === activeChat)!
  const messages = chatMessages[activeChat] || []

  const filtered = conversations.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex gap-0 h-[calc(100vh-112px)] rounded-2xl overflow-hidden bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d]">

      {/* Conversation list */}
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
          {filtered.map((convo) => (
            <button
              key={convo.id}
              onClick={() => setActiveChat(convo.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer text-left',
                activeChat === convo.id
                  ? 'bg-[#ddf4ff] dark:bg-[#121d2f]'
                  : 'hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]',
              )}
            >
              <div className="relative shrink-0">
                <Avatar name={convo.name} src={convo.avatar} size="md" />
                {convo.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#1a7f37] dark:bg-[#3fb950] rounded-full ring-2 ring-white dark:ring-[#161b22]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={clsx('text-[12px] truncate', convo.unread > 0 ? 'font-bold text-[#1f2328] dark:text-[#e6edf3]' : 'font-medium text-[#636c76] dark:text-[#848d97]')}>
                    {convo.name}
                  </p>
                  <span className="text-[10px] text-[#636c76] dark:text-[#848d97] shrink-0 ml-2">{convo.time}</span>
                </div>
                <p className={clsx('text-[11px] truncate mt-0.5', convo.unread > 0 ? 'text-[#1f2328] dark:text-[#e6edf3] font-medium' : 'text-[#636c76] dark:text-[#848d97]')}>
                  {convo.lastMessage}
                </p>
              </div>
              {convo.unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#0969da] dark:bg-[#2f81f7] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                  {convo.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#d0d7de]/60 dark:border-[#30363d]">
          <div className="flex items-center gap-3">
            <Avatar name={activeConvo.name} src={activeConvo.avatar} size="sm" showStatus={activeConvo.online} />
            <div>
              <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">{activeConvo.name}</p>
              <p className="text-[10px] text-[#636c76] dark:text-[#848d97]">{activeConvo.university} · {activeConvo.online ? 'Online' : 'Offline'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors cursor-pointer">
              <HiOutlinePhone className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors cursor-pointer">
              <HiOutlineVideoCamera className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors cursor-pointer">
              <HiOutlineEllipsisHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={clsx('flex', msg.sender === 'me' ? 'justify-end' : 'justify-start')}>
              <div className={clsx(
                'max-w-[70%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed',
                msg.sender === 'me'
                  ? 'bg-[#0969da] dark:bg-[#2f81f7] text-white rounded-br-md'
                  : 'bg-[#f6f8fa] dark:bg-[#21262d] text-[#1f2328] dark:text-[#e6edf3] rounded-bl-md',
              )}>
                <p>{msg.text}</p>
                <p className={clsx('text-[9px] mt-1', msg.sender === 'me' ? 'text-white/60' : 'text-[#636c76] dark:text-[#848d97]')}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
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
              onKeyDown={(e) => e.key === 'Enter' && newMessage.trim() && setNewMessage('')}
            />
            <button className="p-2 rounded-lg text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors cursor-pointer">
              <HiOutlineFaceSmile className="w-[18px] h-[18px]" />
            </button>
            <button
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
      </div>
    </div>
  )
}

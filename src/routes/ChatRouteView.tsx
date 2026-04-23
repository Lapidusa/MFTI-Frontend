import { useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useChatContext } from '../context/useChatContext'
import type { Chat, PendingAttachment } from '../types/chat'
import { ChatWindow } from '../components/chat/ChatWindow'

type ChatRouteViewProps = {
  chats: Chat[]
  isLoading: boolean
  error: string | null
  onSend: (chatId: string, payload: { content: string; attachments: PendingAttachment[] }) => void | Promise<void>
  onStop: () => void
  onOpenSidebar: () => void
  onCreateChat: () => void
  onOpenSettings: () => void
  onClearError: () => void
}

export default function ChatRouteView({
  chats,
  isLoading,
  error,
  onSend,
  onStop,
  onOpenSidebar,
  onCreateChat,
  onOpenSettings,
  onClearError,
}: ChatRouteViewProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { setActiveChat } = useChatContext()
  const chat = chats.find((item) => item.id === id) ?? null

  useEffect(() => {
    if (!id) {
      setActiveChat(null)
      return
    }

    if (!chat) {
      navigate('/', { replace: true })
      return
    }

    setActiveChat(id)
  }, [chat, id, navigate, setActiveChat])

  const handleSend = useCallback(
    (payload: { value: string; attachments: PendingAttachment[] }) => {
      if (!chat) return

      return onSend(chat.id, { content: payload.value, attachments: payload.attachments })
    },
    [chat, onSend],
  )

  if (!chat) {
    return null
  }

  return (
    <ChatWindow
      chat={chat}
      isLoading={isLoading}
      error={error}
      onSend={handleSend}
      onStop={onStop}
      onOpenSidebar={onOpenSidebar}
      onCreateChat={onCreateChat}
      onOpenSettings={onOpenSettings}
      onClearError={onClearError}
    />
  )
}

import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useChatContext } from '../context/useChatContext'
import { ChatWindow } from '../components/chat/ChatWindow'

type EmptyChatRouteViewProps = {
  activeChatId: string | null
  onCreateChat: () => void
  onOpenSidebar: () => void
  onOpenSettings: () => void
  onClearError: () => void
}

export default function EmptyChatRouteView({
  activeChatId,
  onCreateChat,
  onOpenSidebar,
  onOpenSettings,
  onClearError,
}: EmptyChatRouteViewProps) {
  const { setActiveChat, state } = useChatContext()

  useEffect(() => {
    setActiveChat(null)
  }, [setActiveChat])

  if (activeChatId) {
    return <Navigate to={`/chat/${activeChatId}`} replace />
  }

  return (
    <ChatWindow
      chat={null}
      isLoading={state.isLoading}
      error={state.error}
      onSend={async () => {}}
      onStop={() => {}}
      onOpenSidebar={onOpenSidebar}
      onCreateChat={onCreateChat}
      onOpenSettings={onOpenSettings}
      onClearError={onClearError}
    />
  )
}

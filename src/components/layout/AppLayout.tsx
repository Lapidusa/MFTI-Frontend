import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useChatContext } from '../../context/useChatContext'
import type { Chat } from '../../types/chat'
import { ChatWindow } from '../chat/ChatWindow'
import { SettingsPanel } from '../settings/SettingsPanel'
import { Sidebar } from '../sidebar/Sidebar'

function EmptyChatRoute({
  activeChatId,
  onCreateChat,
  onOpenSidebar,
  onOpenSettings,
  onClearError,
}: {
  activeChatId: string | null
  onCreateChat: () => void
  onOpenSidebar: () => void
  onOpenSettings: () => void
  onClearError: () => void
}) {
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

function ChatRoute({
  chats,
  isLoading,
  error,
  onSend,
  onStop,
  onOpenSidebar,
  onCreateChat,
  onOpenSettings,
  onClearError,
}: {
  chats: Chat[]
  isLoading: boolean
  error: string | null
  onSend: (chatId: string, content: string) => void | Promise<void>
  onStop: () => void
  onOpenSidebar: () => void
  onCreateChat: () => void
  onOpenSettings: () => void
  onClearError: () => void
}) {
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

  if (!chat) {
    return null
  }

  return (
    <ChatWindow
      chat={chat}
      isLoading={isLoading}
      error={error}
      onSend={(content) => onSend(chat.id, content)}
      onStop={onStop}
      onOpenSidebar={onOpenSidebar}
      onCreateChat={onCreateChat}
      onOpenSettings={onOpenSettings}
      onClearError={onClearError}
    />
  )
}

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const {
    state,
    filteredChats,
    createChat,
    renameChat,
    deleteChat,
    setSearchQuery,
    updateSettings,
    resetSettings,
    sendMessage,
    stopGeneration,
    clearError,
  } = useChatContext()

  const activeChatId = useMemo(() => {
    const match = location.pathname.match(/^\/chat\/([^/]+)$/)

    return match?.[1] ?? null
  }, [location.pathname])

  const handleCreateChat = () => {
    const chatId = createChat()
    navigate(`/chat/${chatId}`)
    setIsSidebarOpen(false)
  }

  const handleSelectChat = (chatId: string) => {
    navigate(`/chat/${chatId}`)
    setIsSidebarOpen(false)
  }

  const handleDeleteChat = (chatId: string) => {
    const remainingChats = state.chats.filter((chat) => chat.id !== chatId)
    deleteChat(chatId)

    if (activeChatId === chatId) {
      navigate(remainingChats[0] ? `/chat/${remainingChats[0].id}` : '/')
    }
  }

  return (
    <div className="app-layout">
      <Sidebar
        chats={filteredChats}
        activeChatId={activeChatId}
        searchQuery={state.searchQuery}
        isOpen={isSidebarOpen}
        onCreateChat={handleCreateChat}
        onSelectChat={handleSelectChat}
        onRenameChat={renameChat}
        onDeleteChat={handleDeleteChat}
        onSearch={setSearchQuery}
        onClose={() => setIsSidebarOpen(false)}
      />

      <Routes>
        <Route
          path="/"
          element={
            <EmptyChatRoute
              activeChatId={state.activeChatId}
              onCreateChat={handleCreateChat}
              onOpenSidebar={() => setIsSidebarOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onClearError={clearError}
            />
          }
        />
        <Route
          path="/chat/:id"
          element={
            <ChatRoute
              chats={state.chats}
              isLoading={state.isLoading}
              error={state.error}
              onSend={sendMessage}
              onStop={stopGeneration}
              onOpenSidebar={() => setIsSidebarOpen(true)}
              onCreateChat={handleCreateChat}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onClearError={clearError}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <SettingsPanel
        isOpen={isSettingsOpen}
        settings={state.settings}
        onClose={() => setIsSettingsOpen(false)}
        onChange={updateSettings}
        onReset={resetSettings}
        onSave={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}

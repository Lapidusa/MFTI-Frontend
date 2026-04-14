import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useChatContext } from '../../context/useChatContext'
const Sidebar = lazy(() => import('../sidebar/Sidebar').then((module) => ({ default: module.Sidebar })))
const SettingsPanel = lazy(() =>
  import('../settings/SettingsPanel').then((module) => ({ default: module.SettingsPanel })),
)
const EmptyChatRouteView = lazy(() => import('../../routes/EmptyChatRouteView'))
const ChatRouteView = lazy(() => import('../../routes/ChatRouteView'))

function SectionFallback({ label }: { label: string }) {
  return <div className="section-fallback">{label}</div>
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

  const handleCreateChat = useCallback(() => {
    const chatId = createChat()
    navigate(`/chat/${chatId}`)
    setIsSidebarOpen(false)
  }, [createChat, navigate])

  const handleSelectChat = useCallback((chatId: string) => {
    navigate(`/chat/${chatId}`)
    setIsSidebarOpen(false)
  }, [navigate])

  const handleDeleteChat = useCallback((chatId: string) => {
    const remainingChats = state.chats.filter((chat) => chat.id !== chatId)
    deleteChat(chatId)

    if (activeChatId === chatId) {
      navigate(remainingChats[0] ? `/chat/${remainingChats[0].id}` : '/')
    }
  }, [activeChatId, deleteChat, navigate, state.chats])

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true)
  }, [])

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false)
  }, [])

  const openSettings = useCallback(() => {
    setIsSettingsOpen(true)
  }, [])

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false)
  }, [])

  const saveSettings = useCallback(() => {
    setIsSettingsOpen(false)
  }, [])

  return (
    <div className="app-layout">
      <Suspense fallback={<SectionFallback label="Загружаем список чатов..." />}>
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
          onClose={closeSidebar}
        />
      </Suspense>

      <Suspense fallback={<SectionFallback label="Загружаем чат..." />}>
        <Routes>
          <Route
            path="/"
            element={
              <EmptyChatRouteView
                activeChatId={state.activeChatId}
                onCreateChat={handleCreateChat}
                onOpenSidebar={openSidebar}
                onOpenSettings={openSettings}
                onClearError={clearError}
              />
            }
          />
          <Route
            path="/chat/:id"
            element={
              <ChatRouteView
                chats={state.chats}
                isLoading={state.isLoading}
                error={state.error}
                onSend={sendMessage}
                onStop={stopGeneration}
                onOpenSidebar={openSidebar}
                onCreateChat={handleCreateChat}
                onOpenSettings={openSettings}
                onClearError={clearError}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      <Suspense fallback={null}>
        <SettingsPanel
          isOpen={isSettingsOpen}
          settings={state.settings}
          onClose={closeSettings}
          onChange={updateSettings}
          onReset={resetSettings}
          onSave={saveSettings}
        />
      </Suspense>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { mockChats, mockMessages } from '../../data/mockData'
import { Sidebar } from '../sidebar/Sidebar'
import { ChatWindow } from '../chat/ChatWindow'
import { SettingsPanel } from '../settings/SettingsPanel'
import type { SettingsState } from '../settings/SettingsPanel'

const defaultSettings: SettingsState = {
  model: 'GigaChat',
  temperature: 0.8,
  topP: 0.95,
  maxTokens: 1024,
  systemPrompt: 'Ты — дружелюбный ассистент, помогающий с интерфейсом.',
  theme: 'light',
}

export function AppLayout() {
  const [activeChatId, setActiveChatId] = useState(mockChats[0]?.id ?? '')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settings, setSettings] = useState<SettingsState>(defaultSettings)

  const activeChatTitle = useMemo(() => {
    return mockChats.find((chat) => chat.id === activeChatId)?.title ?? 'Чат'
  }, [activeChatId])

  return (
    <div className="app-layout">
      <Sidebar
        chats={mockChats}
        activeChatId={activeChatId}
        onSelectChat={(id) => setActiveChatId(id)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <ChatWindow
        title={activeChatTitle}
        messages={mockMessages}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <SettingsPanel
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onChange={(next) => setSettings(next)}
        onReset={() => setSettings(defaultSettings)}
        onSave={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}

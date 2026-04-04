import type { Chat } from '../../types/chat'
import { ChatList } from './ChatList'
import { SearchInput } from './SearchInput'

type SidebarProps = {
  chats: Chat[]
  activeChatId: string | null
  searchQuery: string
  isOpen: boolean
  onCreateChat: () => void
  onSelectChat: (id: string) => void
  onRenameChat: (id: string, title: string) => void
  onDeleteChat: (id: string) => void
  onSearch: (value: string) => void
  onClose: () => void
}

export function Sidebar({
  chats,
  activeChatId,
  searchQuery,
  isOpen,
  onCreateChat,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
  onSearch,
  onClose,
}: SidebarProps) {
  return (
    <>
      <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="sidebar-header">
          <button className="new-chat-button" type="button" onClick={onCreateChat}>
            <span className="icon-plus" aria-hidden="true">
              +
            </span>
            Новый чат
          </button>
          <button className="sidebar-close" type="button" onClick={onClose}>
            ✕
          </button>
        </div>
        <SearchInput value={searchQuery} onChange={onSearch} />
        <ChatList
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={onSelectChat}
          onRenameChat={onRenameChat}
          onDeleteChat={(chatId) => {
            const shouldDelete = window.confirm('Удалить чат без возможности восстановления?')

            if (shouldDelete) {
              onDeleteChat(chatId)
            }
          }}
        />
      </aside>
      <div
        className={`sidebar-backdrop ${isOpen ? 'is-visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
    </>
  )
}

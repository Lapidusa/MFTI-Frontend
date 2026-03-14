import type { ChatItemData } from '../../data/mockData'
import { ChatList } from './ChatList'
import { SearchInput } from './SearchInput'

type SidebarProps = {
  chats: ChatItemData[]
  activeChatId: string
  isOpen: boolean
  onSelectChat: (id: string) => void
  onClose: () => void
}

export function Sidebar({
  chats,
  activeChatId,
  isOpen,
  onSelectChat,
  onClose,
}: SidebarProps) {
  return (
    <>
      <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="sidebar-header">
          <button className="new-chat-button" type="button">
            <span className="icon-plus" aria-hidden="true">
              +
            </span>
            Новый чат
          </button>
          <button className="sidebar-close" type="button" onClick={onClose}>
            ✕
          </button>
        </div>
        <SearchInput />
        <ChatList
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={onSelectChat}
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

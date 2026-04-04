import type { Chat } from '../../types/chat'
import { EmptyState } from '../ui/EmptyState'
import { ChatItem } from './ChatItem'

type ChatListProps = {
  chats: Chat[]
  activeChatId: string | null
  onSelectChat: (id: string) => void
  onRenameChat: (id: string, title: string) => void
  onDeleteChat: (id: string) => void
}

export function ChatList({
  chats,
  activeChatId,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
}: ChatListProps) {
  if (chats.length === 0) {
    return (
      <div className="chat-list chat-list-empty">
        <EmptyState
          title="Чаты не найдены"
          description="Создайте новый чат или измените поисковый запрос."
        />
      </div>
    )
  }

  return (
    <div className="chat-list">
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          isActive={chat.id === activeChatId}
          onSelect={() => onSelectChat(chat.id)}
          onRename={(title) => onRenameChat(chat.id, title)}
          onDelete={() => onDeleteChat(chat.id)}
        />
      ))}
    </div>
  )
}

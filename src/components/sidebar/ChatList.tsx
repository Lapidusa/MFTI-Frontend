import type { Chat } from '../../types/chat'
import { EmptyState } from '../ui/EmptyState'
import { ChatItem } from './ChatItem'

type ChatListProps = {
  chats: Chat[]
  activeChatId: string | null
  onSelectChat: (chatId: string) => void
  onRenameChat: (chatId: string, title: string) => void
  onDeleteChat: (chatId: string) => void
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
          onSelectChat={onSelectChat}
          onRenameChat={onRenameChat}
          onDeleteChat={onDeleteChat}
        />
      ))}
    </div>
  )
}

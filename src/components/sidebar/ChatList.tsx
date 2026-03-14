import type { ChatItemData } from '../../data/mockData'
import { ChatItem } from './ChatItem'

type ChatListProps = {
  chats: ChatItemData[]
  activeChatId: string
  onSelectChat: (id: string) => void
}

export function ChatList({ chats, activeChatId, onSelectChat }: ChatListProps) {
  return (
    <div className="chat-list">
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          isActive={chat.id === activeChatId}
          onSelect={() => onSelectChat(chat.id)}
        />
      ))}
    </div>
  )
}

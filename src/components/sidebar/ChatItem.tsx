import type { ChatItemData } from '../../data/mockData'

type ChatItemProps = {
  chat: ChatItemData
  isActive: boolean
  onSelect: () => void
}

export function ChatItem({ chat, isActive, onSelect }: ChatItemProps) {
  return (
    <div className={`chat-item ${isActive ? 'is-active' : ''}`}>
      <button type="button" className="chat-item-main" onClick={onSelect}>
        <div className="chat-item-title" title={chat.title}>
          {chat.title}
        </div>
        <div className="chat-item-date">{chat.lastMessageAt}</div>
      </button>
      <div className="chat-item-actions" aria-hidden="true">
        <button type="button" className="icon-button" tabIndex={-1}>
          ✎
        </button>
        <button type="button" className="icon-button" tabIndex={-1}>
          🗑
        </button>
      </div>
    </div>
  )
}

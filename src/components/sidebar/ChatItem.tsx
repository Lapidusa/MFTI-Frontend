import { useState } from 'react'
import { formatChatDate, getLastMessagePreview } from '../../lib/chat-utils'
import type { Chat } from '../../types/chat'

type ChatItemProps = {
  chat: Chat
  isActive: boolean
  onSelect: () => void
  onRename: (title: string) => void
  onDelete: () => void
}

export function ChatItem({ chat, isActive, onSelect, onRename, onDelete }: ChatItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(chat.title)

  const handleRenameSubmit = () => {
    const nextTitle = draftTitle.trim()

    if (!nextTitle) {
      setDraftTitle(chat.title)
      setIsEditing(false)
      return
    }

    onRename(nextTitle)
    setIsEditing(false)
  }

  return (
    <div className={`chat-item ${isActive ? 'is-active' : ''}`}>
      {isEditing ? (
        <div className="chat-item-main">
          <input
            className="chat-item-title-input"
            value={draftTitle}
            autoFocus
            onChange={(event) => setDraftTitle(event.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleRenameSubmit()
              }

              if (event.key === 'Escape') {
                setDraftTitle(chat.title)
                setIsEditing(false)
              }
            }}
          />
          <div className="chat-item-preview" title={getLastMessagePreview(chat)}>
            {getLastMessagePreview(chat) || 'Сообщений пока нет'}
          </div>
          <div className="chat-item-date">{formatChatDate(chat.updatedAt)}</div>
        </div>
      ) : (
        <button type="button" className="chat-item-main" onClick={onSelect}>
          <div className="chat-item-title" title={chat.title}>
            {chat.title}
          </div>
          <div className="chat-item-preview" title={getLastMessagePreview(chat)}>
            {getLastMessagePreview(chat) || 'Сообщений пока нет'}
          </div>
          <div className="chat-item-date">{formatChatDate(chat.updatedAt)}</div>
        </button>
      )}
      <div className="chat-item-actions">
        <button
          type="button"
          className="icon-button"
          aria-label="Переименовать чат"
          onClick={() => {
            setDraftTitle(chat.title)
            setIsEditing(true)
          }}
        >
          ✎
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label="Удалить чат"
          onClick={onDelete}
        >
          🗑
        </button>
      </div>
    </div>
  )
}

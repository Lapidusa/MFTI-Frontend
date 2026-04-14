import { memo, useCallback, useState } from 'react'
import { formatChatDate, getLastMessagePreview } from '../../lib/chat-utils'
import type { Chat } from '../../types/chat'

type ChatItemProps = {
  chat: Chat
  isActive: boolean
  onSelectChat: (chatId: string) => void
  onRenameChat: (chatId: string, title: string) => void
  onDeleteChat: (chatId: string) => void
}

function ChatItemComponent({
  chat,
  isActive,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
}: ChatItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(chat.title)
  const lastMessagePreview = getLastMessagePreview(chat)

  const handleRenameSubmit = useCallback(() => {
    const nextTitle = draftTitle.trim()

    if (!nextTitle) {
      setDraftTitle(chat.title)
      setIsEditing(false)
      return
    }

    onRenameChat(chat.id, nextTitle)
    setIsEditing(false)
  }, [chat.id, chat.title, draftTitle, onRenameChat])

  const handleSelect = useCallback(() => {
    onSelectChat(chat.id)
  }, [chat.id, onSelectChat])

  const handleDelete = useCallback(() => {
    onDeleteChat(chat.id)
  }, [chat.id, onDeleteChat])

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
          <div className="chat-item-preview" title={lastMessagePreview}>
            {lastMessagePreview || 'Сообщений пока нет'}
          </div>
          <div className="chat-item-date">{formatChatDate(chat.updatedAt)}</div>
        </div>
      ) : (
        <button type="button" className="chat-item-main" onClick={handleSelect}>
          <div className="chat-item-title" title={chat.title}>
            {chat.title}
          </div>
          <div className="chat-item-preview" title={lastMessagePreview}>
            {lastMessagePreview || 'Сообщений пока нет'}
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
          onClick={handleDelete}
        >
          🗑
        </button>
      </div>
    </div>
  )
}

export const ChatItem = memo(ChatItemComponent)

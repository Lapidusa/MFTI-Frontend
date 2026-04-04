import { useEffect, useRef } from 'react'
import type { Chat } from '../../types/chat'
import { EmptyState } from '../ui/EmptyState'
import { ErrorMessage } from '../ui/ErrorMessage'
import { InputArea } from './InputArea'
import { MessageList } from './MessageList'

type ChatWindowProps = {
  chat: Chat | null
  isLoading: boolean
  error: string | null
  onSend: (content: string) => void | Promise<void>
  onStop: () => void
  onOpenSidebar: () => void
  onCreateChat: () => void
  onOpenSettings: () => void
  onClearError: () => void
}

export function ChatWindow({
  chat,
  isLoading,
  error,
  onSend,
  onStop,
  onOpenSidebar,
  onCreateChat,
  onOpenSettings,
  onClearError,
}: ChatWindowProps) {
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat?.id, chat?.messages, isLoading])

  const title = chat?.title ?? 'Чаты'

  return (
    <section className="chat-window">
      <header className="chat-header">
        <button className="burger-button" type="button" onClick={onOpenSidebar}>
          ≡
        </button>
        <div className="chat-title">{title}</div>
        <button
          className="icon-button settings-button"
          type="button"
          onClick={onOpenSettings}
        >
          ⚙
        </button>
      </header>

      {error ? (
        <div className="chat-error-banner">
          <ErrorMessage message={error} />
          <button className="btn secondary" type="button" onClick={onClearError}>
            Закрыть
          </button>
        </div>
      ) : null}

      {chat ? (
        <>
          <MessageList messages={chat.messages} isTyping={isLoading} endRef={endRef} />
          <InputArea isLoading={isLoading} onSend={onSend} onStop={onStop} />
        </>
      ) : (
        <div className="chat-empty-screen">
          <EmptyState
            title="Выберите чат или создайте новый"
            description="История сохранится в localStorage, а ответы будут приходить из GigaChat API."
          />
          <button className="btn primary chat-empty-action" type="button" onClick={onCreateChat}>
            Создать новый чат
          </button>
        </div>
      )}
    </section>
  )
}

import type { RefObject } from 'react'
import type { Message } from '../../types/chat'
import { EmptyState } from '../ui/EmptyState'
import { Message as ChatMessage } from './Message'
import { TypingIndicator } from './TypingIndicator'

type MessageListProps = {
  messages: Message[]
  isTyping?: boolean
  endRef: RefObject<HTMLDivElement | null>
}

export function MessageList({ messages, isTyping, endRef }: MessageListProps) {
  const visibleMessages = messages.filter(
    (message): message is Message & { role: 'user' | 'assistant' } => message.role !== 'system',
  )

  if (messages.length === 0) {
    return (
      <div className="message-list empty">
        <EmptyState
          title="Диалог пока пуст"
          description="Отправьте первое сообщение, и название чата сгенерируется автоматически."
        />
        <div ref={endRef} />
      </div>
    )
  }

  return (
    <div className="message-list">
      {visibleMessages.map((message) => (
        <ChatMessage key={message.id} message={message} variant={message.role} />
      ))}
      <TypingIndicator isVisible={Boolean(isTyping)} />
      <div ref={endRef} />
    </div>
  )
}

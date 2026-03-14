import type { MessageData } from '../../data/mockData'
import { EmptyState } from '../ui/EmptyState'
import { Message } from './Message'
import { TypingIndicator } from './TypingIndicator'

type MessageListProps = {
  messages: MessageData[]
  isTyping?: boolean
}

export function MessageList({ messages, isTyping }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="message-list empty">
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
      <TypingIndicator isVisible={Boolean(isTyping)} />
    </div>
  )
}

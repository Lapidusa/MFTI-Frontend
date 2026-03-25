import type { RefObject } from 'react'
import type { MessageData } from '../../data/mockData'
import { EmptyState } from '../ui/EmptyState'
import { Message } from './Message'
import { TypingIndicator } from './TypingIndicator'

type MessageListProps = {
  messages: MessageData[]
  isTyping?: boolean
  endRef: RefObject<HTMLDivElement | null>
}

export function MessageList({ messages, isTyping, endRef }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="message-list empty">
        <EmptyState />
        <div ref={endRef} />
      </div>
    )
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <Message key={message.id} message={message} variant={message.role} />
      ))}
      <TypingIndicator isVisible={Boolean(isTyping)} />
      <div ref={endRef} />
    </div>
  )
}

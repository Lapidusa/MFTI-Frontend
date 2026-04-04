import { useEffect, useRef, useState } from 'react'
import type { MessageData } from '../../data/mockData'
import { InputArea } from './InputArea'
import { MessageList } from './MessageList'

type ChatWindowProps = {
  chatId: string
  title: string
  messages: MessageData[]
  onMessagesChange: (messages: MessageData[]) => void
  onOpenSidebar: () => void
  onOpenSettings: () => void
}

const assistantReplies = [
  'Принял. Могу развить эту мысль и предложить следующий шаг.',
  'Сообщение получено. Если нужно, продолжу диалог в том же стиле.',
  'Вижу контекст. Могу ответить подробнее следующим сообщением.',
]

export function ChatWindow({
  chatId,
  title,
  messages,
  onMessagesChange,
  onOpenSidebar,
  onOpenSettings,
}: ChatWindowProps) {
  const [isLoading, setIsLoading] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    setIsLoading(false)

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [chatId, title])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatId, messages, isLoading])

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleSend = (content: string) => {
    const userMessage: MessageData = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }

    const nextMessages = [...messages, userMessage]
    onMessagesChange(nextMessages)
    setIsLoading(true)

    const delay = 1000 + Math.floor(Math.random() * 1000)

    timeoutRef.current = window.setTimeout(() => {
      const assistantMessage: MessageData = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: assistantReplies[Math.floor(Math.random() * assistantReplies.length)],
        timestamp: new Date().toISOString(),
      }

      onMessagesChange([...nextMessages, assistantMessage])
      setIsLoading(false)
      timeoutRef.current = null
    }, delay)
  }

  const handleStop = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    setIsLoading(false)
  }

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
      <MessageList messages={messages} isTyping={isLoading} endRef={endRef} />
      <InputArea isLoading={isLoading} onSend={handleSend} onStop={handleStop} />
    </section>
  )
}

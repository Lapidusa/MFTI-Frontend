import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import type { MessageData } from '../../data/mockData'

type MessageProps = {
  message: MessageData
  variant: 'user' | 'assistant'
}

const messageNames: Record<MessageProps['variant'], string> = {
  assistant: 'GigaChat',
  user: 'Вы',
}

export function Message({ message, variant }: MessageProps) {
  const [copied, setCopied] = useState(false)
  const resetTimeoutRef = useRef<number | null>(null)
  const formattedTime = new Date(message.timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current)
      }
    }
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)

      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current)
      }

      resetTimeoutRef.current = window.setTimeout(() => {
        setCopied(false)
        resetTimeoutRef.current = null
      }, 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className={`message ${variant}`}>
      <div className="message-meta">
        {variant === 'assistant' ? <span className="message-avatar">G</span> : null}
        <span className="message-name">{messageNames[variant]}</span>
        <span className="message-time">{formattedTime}</span>
      </div>
      <div className="message-bubble">
        <div className="message-content">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        {variant === 'assistant' ? (
          <button
            className={`copy-button ${copied ? 'is-copied' : ''}`}
            type="button"
            onClick={handleCopy}
            aria-label={copied ? 'Сообщение скопировано' : 'Копировать сообщение'}
          >
            {copied ? 'Скопировано' : 'Копировать'}
          </button>
        ) : null}
      </div>
    </div>
  )
}

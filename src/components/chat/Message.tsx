import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { Message as MessageData, MessageRole } from '../../types/chat'

const RichMessageContent = lazy(() => import('./RichMessageContent'))

type MessageProps = {
  message: MessageData
  variant: Extract<MessageRole, 'user' | 'assistant'>
}

const messageNames: Record<MessageProps['variant'], string> = {
  assistant: 'GigaChat',
  user: 'Вы',
}

export function Message({ message, variant }: MessageProps) {
  const [copied, setCopied] = useState(false)
  const resetTimeoutRef = useRef<number | null>(null)
  const formattedTime = new Date(message.createdAt).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const hasContent = message.content.trim().length > 0
  const hasCopyButton = hasContent

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current)
      }
    }
  }, [])

  const handleCopy = async () => {
    if (!hasContent) return

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
      <div className={`message-shell ${hasCopyButton ? 'has-copy-action' : ''}`}>
        <div className="message-bubble">
          {message.attachments?.length ? (
            <div className="message-attachments">
              {message.attachments.map((attachment) =>
                attachment.previewUrl ? (
                  <img
                    key={attachment.id}
                    src={attachment.previewUrl}
                    alt={attachment.name}
                    className="message-image-preview"
                  />
                ) : null,
              )}
            </div>
          ) : null}
          <div className="message-content">
            {variant === 'assistant' ? (
              <Suspense fallback={<p>{message.content}</p>}>
                <RichMessageContent content={message.content} />
              </Suspense>
            ) : hasContent ? (
              <p>{message.content}</p>
            ) : null}
          </div>
        </div>
        {hasCopyButton ? (
          <div className="message-actions">
            <button
              className={`copy-button ${copied ? 'is-copied' : ''}`}
              type="button"
              onClick={handleCopy}
              aria-label={copied ? 'Сообщение скопировано' : 'Копировать сообщение'}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="9" y="3" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.8" />
                <rect x="3" y="9" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

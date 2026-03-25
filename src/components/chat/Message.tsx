import { useState } from 'react'
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
  const formattedTime = new Date(message.timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
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
        <button className="copy-button" type="button" onClick={handleCopy}>
          {copied ? 'Скопировано' : 'Копировать'}
        </button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import type { MessageData } from '../../data/mockData'

type MessageProps = {
  message: MessageData
}

export function Message({ message }: MessageProps) {
  const [copied, setCopied] = useState(false)

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
    <div className={`message ${message.role}`}>
      <div className="message-meta">
        {message.role === 'assistant' ? (
          <span className="message-avatar">G</span>
        ) : null}
        <span className="message-name">{message.name}</span>
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

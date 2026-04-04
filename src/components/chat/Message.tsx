import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import type { Message as MessageData, MessageRole } from '../../types/chat'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)

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
          <ReactMarkdown
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className ?? '')
                const code = String(children).replace(/\n$/, '')

                if (!match) {
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                }

                const language = match[1]
                const highlighted = hljs.getLanguage(language)
                  ? hljs.highlight(code, { language }).value
                  : hljs.highlightAuto(code).value

                return (
                  <code
                    {...props}
                    className={`hljs language-${language}`}
                    dangerouslySetInnerHTML={{ __html: highlighted }}
                  />
                )
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
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

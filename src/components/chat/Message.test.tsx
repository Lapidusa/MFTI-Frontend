import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { Message } from './Message'
import type { Message as MessageData } from '../../types/chat'

const baseMessage: MessageData = {
  id: 'message-1',
  chatId: 'chat-1',
  role: 'user',
  content: 'Текст сообщения',
  createdAt: '2026-04-12T10:00:00.000Z',
}

describe('Message', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn(),
      },
    })
  })

  it('renders user message text with user class and without copy button', () => {
    const { container } = render(<Message message={baseMessage} variant="user" />)

    expect(screen.getByText('Текст сообщения')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('message', 'user')
    expect(screen.queryByRole('button', { name: /копировать/i })).not.toBeInTheDocument()
  })

  it('renders assistant message text with assistant class and copy button', () => {
    const { container } = render(
      <Message message={{ ...baseMessage, role: 'assistant' }} variant="assistant" />,
    )

    expect(screen.getByText('Текст сообщения')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('message', 'assistant')
    expect(screen.getByRole('button', { name: 'Копировать сообщение' })).toBeInTheDocument()
  })
})

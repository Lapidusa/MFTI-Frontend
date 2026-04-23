import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('renders user message text with user class and copy button', () => {
    const { container } = render(<Message message={baseMessage} variant="user" />)

    expect(screen.getByText('Текст сообщения')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('message', 'user')
    expect(screen.getByRole('button', { name: 'Копировать сообщение' })).toBeInTheDocument()
  })

  it('renders assistant message text with assistant class and copy button', () => {
    const { container } = render(
      <Message message={{ ...baseMessage, role: 'assistant' }} variant="assistant" />,
    )

    expect(screen.getByText('Текст сообщения')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('message', 'assistant')
    expect(screen.getByRole('button', { name: 'Копировать сообщение' })).toBeInTheDocument()
  })

  it('updates copy button label after copy button click', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    render(<Message message={{ ...baseMessage, role: 'assistant' }} variant="assistant" />)

    await user.click(screen.getByRole('button', { name: 'Копировать сообщение' }))

    expect(writeText).toHaveBeenCalledWith('Текст сообщения')
    expect(screen.getByRole('button', { name: 'Сообщение скопировано' })).toBeInTheDocument()
  })

  it('copies user message text after copy button click', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    render(<Message message={baseMessage} variant="user" />)

    await user.click(screen.getByRole('button', { name: 'Копировать сообщение' }))

    expect(writeText).toHaveBeenCalledWith('Текст сообщения')
    expect(screen.getByRole('button', { name: 'Сообщение скопировано' })).toBeInTheDocument()
  })
})

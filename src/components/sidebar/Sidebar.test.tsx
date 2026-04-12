import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { filterChats } from '../../lib/chat-utils'
import type { Chat } from '../../types/chat'
import { Sidebar } from './Sidebar'

const chats: Chat[] = [
  {
    id: 'chat-1',
    title: 'React chat',
    createdAt: '2026-04-12T09:00:00.000Z',
    updatedAt: '2026-04-12T10:00:00.000Z',
    messages: [],
  },
  {
    id: 'chat-2',
    title: 'Vue notes',
    createdAt: '2026-04-12T09:10:00.000Z',
    updatedAt: '2026-04-12T10:10:00.000Z',
    messages: [],
  },
]

describe('Sidebar', () => {
  beforeEach(() => {
    vi.stubGlobal('confirm', vi.fn())
  })

  it('filters chats by search query', async () => {
    const onSearch = vi.fn()
    const { rerender } = render(
      <Sidebar
        chats={chats}
        activeChatId={null}
        searchQuery=""
        isOpen
        onCreateChat={vi.fn()}
        onSelectChat={vi.fn()}
        onRenameChat={vi.fn()}
        onDeleteChat={vi.fn()}
        onSearch={onSearch}
        onClose={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByPlaceholderText('Поиск по чатам'), {
      target: { value: 'react' },
    })

    expect(onSearch).toHaveBeenLastCalledWith('react')

    rerender(
      <Sidebar
        chats={filterChats(chats, 'react')}
        activeChatId={null}
        searchQuery="react"
        isOpen
        onCreateChat={vi.fn()}
        onSelectChat={vi.fn()}
        onRenameChat={vi.fn()}
        onDeleteChat={vi.fn()}
        onSearch={onSearch}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByText('React chat')).toBeInTheDocument()
    expect(screen.queryByText('Vue notes')).not.toBeInTheDocument()
  })

  it('shows all chats when search query is empty', () => {
    render(
      <Sidebar
        chats={filterChats(chats, '')}
        activeChatId={null}
        searchQuery=""
        isOpen
        onCreateChat={vi.fn()}
        onSelectChat={vi.fn()}
        onRenameChat={vi.fn()}
        onDeleteChat={vi.fn()}
        onSearch={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByText('React chat')).toBeInTheDocument()
    expect(screen.getByText('Vue notes')).toBeInTheDocument()
  })

  it('asks for confirmation before deleting a chat', async () => {
    const user = userEvent.setup()
    const onDeleteChat = vi.fn()
    const confirmMock = vi.mocked(window.confirm)
    confirmMock.mockReturnValue(true)

    render(
      <Sidebar
        chats={chats}
        activeChatId={null}
        searchQuery=""
        isOpen
        onCreateChat={vi.fn()}
        onSelectChat={vi.fn()}
        onRenameChat={vi.fn()}
        onDeleteChat={onDeleteChat}
        onSearch={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    await user.click(screen.getAllByRole('button', { name: 'Удалить чат' })[0])

    expect(confirmMock).toHaveBeenCalledWith('Удалить чат без возможности восстановления?')
    expect(onDeleteChat).toHaveBeenCalledWith('chat-1')
  })
})

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { chatReducer, emptyChatState } from './chat-reducer'
import type { Chat, ChatState, Message } from '../types/chat'

function createMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: 'message-1',
    chatId: 'chat-1',
    role: 'user',
    content: 'Привет',
    createdAt: '2026-04-12T10:00:00.000Z',
    ...overrides,
  }
}

function createChat(overrides: Partial<Chat> = {}): Chat {
  const id = overrides.id ?? 'chat-1'

  return {
    id,
    title: 'Диалог 1',
    createdAt: '2026-04-12T09:00:00.000Z',
    updatedAt: '2026-04-12T09:00:00.000Z',
    messages: [],
    ...overrides,
  }
}

function createState(overrides: Partial<ChatState> = {}): ChatState {
  return {
    ...emptyChatState,
    ...overrides,
  }
}

describe('chatReducer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-12T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('adds a message to the end of chat messages', () => {
    const existingMessage = createMessage()
    const newMessage = createMessage({
      id: 'message-2',
      content: 'Как дела?',
      createdAt: '2026-04-12T11:00:00.000Z',
    })
    const state = createState({
      chats: [createChat({ messages: [existingMessage] })],
      activeChatId: 'chat-1',
      currentMessages: [existingMessage],
    })

    const nextState = chatReducer(state, {
      type: 'chats/addMessage',
      payload: {
        chatId: 'chat-1',
        message: newMessage,
      },
    })

    expect(nextState.chats[0].messages).toHaveLength(2)
    expect(nextState.chats[0].messages.at(-1)).toEqual(newMessage)
    expect(nextState.currentMessages.at(-1)).toEqual(newMessage)
  })

  it('creates a new chat and makes it active', () => {
    const newChat = createChat({ id: 'chat-2', title: 'Диалог 2' })
    const state = createState({
      chats: [createChat()],
      activeChatId: 'chat-1',
    })

    const nextState = chatReducer(state, {
      type: 'chats/create',
      payload: { chat: newChat },
    })

    expect(nextState.chats[0]).toEqual(newChat)
    expect(nextState.chats.map((chat) => chat.id)).toEqual(['chat-2', 'chat-1'])
    expect(nextState.activeChatId).toBe('chat-2')
  })

  it('deletes the active chat and resets activeChatId when no chats remain', () => {
    const state = createState({
      chats: [createChat()],
      activeChatId: 'chat-1',
      currentMessages: [createMessage()],
    })

    const nextState = chatReducer(state, {
      type: 'chats/delete',
      payload: { chatId: 'chat-1' },
    })

    expect(nextState.chats).toEqual([])
    expect(nextState.activeChatId).toBeNull()
    expect(nextState.currentMessages).toEqual([])
  })

  it('renames a chat by id', () => {
    const state = createState({
      chats: [createChat()],
    })

    const nextState = chatReducer(state, {
      type: 'chats/rename',
      payload: { chatId: 'chat-1', title: 'Новый заголовок' },
    })

    expect(nextState.chats[0].title).toBe('Новый заголовок')
    expect(nextState.chats[0].updatedAt).toBe('2026-04-12T12:00:00.000Z')
  })
})

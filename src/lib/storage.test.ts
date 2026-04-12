import { afterEach, describe, expect, it, vi } from 'vitest'
import { CHAT_STORAGE_KEY, defaultSettings } from './chat-utils'
import { loadChatState, saveChatState } from './storage'
import { emptyChatState } from '../context/chat-reducer'
import type { ChatState } from '../types/chat'

type StorageMock = {
  getItem: ReturnType<typeof vi.fn>
  setItem: ReturnType<typeof vi.fn>
  removeItem: ReturnType<typeof vi.fn>
  clear: ReturnType<typeof vi.fn>
}

function createLocalStorageMock(): StorageMock {
  return {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }
}

function setLocalStorageMock(mock: StorageMock) {
  vi.stubGlobal('localStorage', mock)
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: mock,
  })
}

describe('storage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('saves chats, activeChatId and settings to localStorage', () => {
    const localStorageMock = createLocalStorageMock()
    setLocalStorageMock(localStorageMock)
    const state: ChatState = {
      ...emptyChatState,
      chats: [
        {
          id: 'chat-1',
          title: 'Диалог 1',
          createdAt: '2026-04-12T09:00:00.000Z',
          updatedAt: '2026-04-12T10:00:00.000Z',
          messages: [],
        },
      ],
      activeChatId: 'chat-1',
    }

    saveChatState(state)

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      CHAT_STORAGE_KEY,
      JSON.stringify({
        chats: state.chats,
        activeChatId: state.activeChatId,
        settings: state.settings,
      }),
    )
  })

  it('restores valid state from localStorage on initialization', () => {
    const localStorageMock = createLocalStorageMock()
    setLocalStorageMock(localStorageMock)
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({
        chats: [
          {
            id: 'chat-1',
            title: 'Диалог 1',
            createdAt: '2026-04-12T09:00:00.000Z',
            updatedAt: '2026-04-12T10:00:00.000Z',
            messages: [
              {
                id: 'message-1',
                chatId: 'chat-1',
                role: 'user',
                content: 'Привет',
                createdAt: '2026-04-12T10:00:00.000Z',
              },
            ],
          },
        ],
        activeChatId: 'chat-1',
        settings: {
          theme: 'dark',
          temperature: 0.3,
        },
      }),
    )

    const state = loadChatState()

    expect(state.chats).toHaveLength(1)
    expect(state.activeChatId).toBe('chat-1')
    expect(state.currentMessages).toHaveLength(1)
    expect(state.settings).toEqual({
      ...defaultSettings,
      theme: 'dark',
      temperature: 0.3,
    })
  })

  it('returns empty state when localStorage contains invalid JSON', () => {
    const localStorageMock = createLocalStorageMock()
    setLocalStorageMock(localStorageMock)
    localStorageMock.getItem.mockReturnValue('{broken json')

    expect(loadChatState()).toEqual(emptyChatState)
  })
})

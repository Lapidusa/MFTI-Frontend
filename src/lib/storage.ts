import { CHAT_STORAGE_KEY, defaultSettings } from './chat-utils'
import type { Chat, ChatState, Message } from '../types/chat'

const emptyState: ChatState = {
  chats: [],
  activeChatId: null,
  currentMessages: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  settings: defaultSettings,
}

function isMessage(value: unknown): value is Message {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.chatId === 'string' &&
    typeof candidate.role === 'string' &&
    typeof candidate.content === 'string' &&
    typeof candidate.createdAt === 'string'
  )
}

function isChat(value: unknown): value is Chat {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string' &&
    Array.isArray(candidate.messages) &&
    candidate.messages.every(isMessage)
  )
}

export function loadChatState(): ChatState {
  try {
    const raw = window.localStorage.getItem(CHAT_STORAGE_KEY)

    if (!raw) return emptyState

    const parsed = JSON.parse(raw) as Partial<ChatState>
    const chats = Array.isArray(parsed.chats) ? parsed.chats.filter(isChat) : []
    const activeChatId =
      typeof parsed.activeChatId === 'string' && chats.some((chat) => chat.id === parsed.activeChatId)
        ? parsed.activeChatId
        : null

    return {
      chats,
      activeChatId,
      currentMessages: chats.find((chat) => chat.id === activeChatId)?.messages ?? [],
      isLoading: false,
      error: null,
      searchQuery: '',
      settings: {
        ...defaultSettings,
        ...(parsed.settings ?? {}),
      },
    }
  } catch {
    return emptyState
  }
}

export function saveChatState(state: ChatState) {
  const payload = {
    chats: state.chats,
    activeChatId: state.activeChatId,
    settings: state.settings,
  }

  try {
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Ignore storage quota and private mode failures.
  }
}

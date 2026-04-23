import { CHAT_STORAGE_KEY, defaultSettings } from './chat-utils'
import type { Chat, ChatAttachment, ChatState, Message } from '../types/chat'
import { emptyChatState } from '../context/chat-reducer'

function isAttachment(value: unknown): value is ChatAttachment {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.mimeType === 'string' &&
    typeof candidate.size === 'number' &&
    (candidate.fileId === undefined || typeof candidate.fileId === 'string') &&
    (candidate.previewUrl === undefined || typeof candidate.previewUrl === 'string')
  )
}

function isMessage(value: unknown): value is Message {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.chatId === 'string' &&
    typeof candidate.role === 'string' &&
    typeof candidate.content === 'string' &&
    typeof candidate.createdAt === 'string' &&
    (candidate.attachments === undefined ||
      (Array.isArray(candidate.attachments) && candidate.attachments.every(isAttachment)))
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

    if (!raw) return emptyChatState

    const parsed = JSON.parse(raw) as Partial<ChatState>
    const chats = Array.isArray(parsed.chats) ? parsed.chats.filter(isChat) : []
    const activeChatId =
      typeof parsed.activeChatId === 'string' && chats.some((chat) => chat.id === parsed.activeChatId)
        ? parsed.activeChatId
        : null

    return {
      ...emptyChatState,
      chats,
      activeChatId,
      currentMessages: chats.find((chat) => chat.id === activeChatId)?.messages ?? [],
      settings: {
        ...defaultSettings,
        ...(parsed.settings ?? {}),
      },
    }
  } catch {
    return emptyChatState
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

import type { Chat, ChatAction, ChatState } from '../types/chat'
import { defaultSettings } from '../lib/chat-utils'

export const emptyChatState: ChatState = {
  chats: [],
  activeChatId: null,
  currentMessages: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  settings: defaultSettings,
}

export function getCurrentMessages(chats: Chat[], activeChatId: string | null) {
  return chats.find((chat) => chat.id === activeChatId)?.messages ?? []
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'chats/hydrate':
      return action.payload
    case 'chats/create':
      return {
        ...state,
        chats: [action.payload.chat, ...state.chats],
        activeChatId: action.payload.chat.id,
        currentMessages: action.payload.chat.messages,
      }
    case 'chats/setActive':
      return {
        ...state,
        activeChatId: action.payload.chatId,
        currentMessages: getCurrentMessages(state.chats, action.payload.chatId),
      }
    case 'chats/rename':
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat.id === action.payload.chatId
            ? { ...chat, title: action.payload.title, updatedAt: new Date().toISOString() }
            : chat,
        ),
      }
    case 'chats/delete': {
      const chats = state.chats.filter((chat) => chat.id !== action.payload.chatId)
      const activeChatId =
        state.activeChatId === action.payload.chatId ? (chats[0]?.id ?? null) : state.activeChatId

      return {
        ...state,
        chats,
        activeChatId,
        currentMessages: getCurrentMessages(chats, activeChatId),
      }
    }
    case 'chats/addMessage': {
      const chats = state.chats
        .map((chat) => {
          if (chat.id !== action.payload.chatId) return chat

          return {
            ...chat,
            title: action.payload.title ?? chat.title,
            updatedAt: action.payload.message.createdAt,
            messages: [...chat.messages, action.payload.message],
          }
        })
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))

      return {
        ...state,
        chats,
        currentMessages: getCurrentMessages(chats, state.activeChatId),
      }
    }
    case 'chats/deleteMessage': {
      const chats = state.chats.map((chat) => {
        if (chat.id !== action.payload.chatId) return chat

        return {
          ...chat,
          messages: chat.messages.filter((message) => message.id !== action.payload.messageId),
        }
      })

      return {
        ...state,
        chats,
        currentMessages: getCurrentMessages(chats, state.activeChatId),
      }
    }
    case 'chats/updateMessage': {
      const chats = state.chats.map((chat) => {
        if (chat.id !== action.payload.chatId) return chat

        return {
          ...chat,
          messages: chat.messages.map((message) =>
            message.id === action.payload.messageId
              ? { ...message, content: action.payload.content }
              : message,
          ),
          updatedAt: new Date().toISOString(),
        }
      })

      return {
        ...state,
        chats,
        currentMessages: getCurrentMessages(chats, state.activeChatId),
      }
    }
    case 'ui/setSearchQuery':
      return {
        ...state,
        searchQuery: action.payload.value,
      }
    case 'ui/setLoading':
      return {
        ...state,
        isLoading: action.payload.value,
      }
    case 'ui/setError':
      return {
        ...state,
        error: action.payload.value,
      }
    case 'settings/update':
    case 'settings/reset':
      return {
        ...state,
        settings: action.payload,
      }
    default:
      return state
  }
}

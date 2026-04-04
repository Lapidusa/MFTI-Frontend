import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import type { PropsWithChildren } from 'react'
import {
  createMessage,
  createNewChat,
  defaultSettings,
  filterChats,
  generateChatTitle,
  shouldAutoRenameChat,
} from '../lib/chat-utils'
import { requestChatCompletion } from '../lib/gigachat'
import { loadChatState, saveChatState } from '../lib/storage'
import type { Chat, ChatAction, ChatSettings, ChatState } from '../types/chat'
import { ChatContext } from './chat-context-instance'

export type ChatContextValue = {
  state: ChatState
  filteredChats: Chat[]
  activeChat: Chat | null
  createChat: () => string
  setActiveChat: (chatId: string | null) => void
  renameChat: (chatId: string, title: string) => void
  deleteChat: (chatId: string) => void
  setSearchQuery: (value: string) => void
  updateSettings: (next: ChatSettings) => void
  resetSettings: () => void
  clearError: () => void
  sendMessage: (chatId: string, content: string) => Promise<void>
  stopGeneration: () => void
}

function getCurrentMessages(chats: Chat[], activeChatId: string | null) {
  return chats.find((chat) => chat.id === activeChatId)?.messages ?? []
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
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

export function ChatProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(chatReducer, undefined, () => loadChatState())
  const stateRef = useRef(state)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    stateRef.current = state
    saveChatState(state)
    document.documentElement.setAttribute('data-theme', state.settings.theme)
  }, [state])

  const createChatHandler = useCallback(() => {
    const chat = createNewChat(stateRef.current.chats)
    dispatch({ type: 'chats/create', payload: { chat } })
    dispatch({ type: 'ui/setError', payload: { value: null } })

    return chat.id
  }, [])

  const setActiveChat = useCallback((chatId: string | null) => {
    dispatch({ type: 'chats/setActive', payload: { chatId } })
  }, [])

  const renameChat = useCallback((chatId: string, title: string) => {
    const nextTitle = title.trim()

    if (!nextTitle) return

    dispatch({ type: 'chats/rename', payload: { chatId, title: nextTitle } })
  }, [])

  const deleteChat = useCallback((chatId: string) => {
    dispatch({ type: 'chats/delete', payload: { chatId } })
  }, [])

  const setSearchQuery = useCallback((value: string) => {
    dispatch({ type: 'ui/setSearchQuery', payload: { value } })
  }, [])

  const updateSettings = useCallback((next: ChatSettings) => {
    dispatch({ type: 'settings/update', payload: next })
  }, [])

  const resetSettings = useCallback(() => {
    dispatch({ type: 'settings/reset', payload: defaultSettings })
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: 'ui/setError', payload: { value: null } })
  }, [])

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    dispatch({ type: 'ui/setLoading', payload: { value: false } })
  }, [])

  const sendMessage = useCallback(async (chatId: string, content: string) => {
    const currentState = stateRef.current
    const chat = currentState.chats.find((item) => item.id === chatId)

    if (!chat) return

    const trimmedContent = content.trim()

    if (!trimmedContent) return

    const userMessage = createMessage(chatId, 'user', trimmedContent)
    const title = shouldAutoRenameChat(chat)
      ? generateChatTitle(trimmedContent, chat.title)
      : undefined

    dispatch({ type: 'chats/addMessage', payload: { chatId, message: userMessage, title } })
    dispatch({ type: 'ui/setLoading', payload: { value: true } })
    dispatch({ type: 'ui/setError', payload: { value: null } })

    const nextMessages = [...chat.messages, userMessage]
    const controller = new AbortController()
    abortControllerRef.current = controller
    const assistantMessage = createMessage(chatId, 'assistant', '')

    dispatch({
      type: 'chats/addMessage',
      payload: {
        chatId,
        message: assistantMessage,
      },
    })

    try {
      const assistantText = await requestChatCompletion(
        nextMessages,
        stateRef.current.settings,
        (chunk) => {
          dispatch({
            type: 'chats/updateMessage',
            payload: {
              chatId,
              messageId: assistantMessage.id,
              content: chunk,
            },
          })
        },
        controller.signal,
      )

      dispatch({
        type: 'chats/updateMessage',
        payload: {
          chatId,
          messageId: assistantMessage.id,
          content: assistantText,
        },
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        if (!stateRef.current.chats
          .find((item) => item.id === chatId)
          ?.messages.find((message) => message.id === assistantMessage.id)?.content) {
          dispatch({
            type: 'chats/deleteMessage',
            payload: { chatId, messageId: assistantMessage.id },
          })
        }
        return
      }

      if (!stateRef.current.chats
        .find((item) => item.id === chatId)
        ?.messages.find((message) => message.id === assistantMessage.id)?.content) {
        dispatch({
          type: 'chats/deleteMessage',
          payload: { chatId, messageId: assistantMessage.id },
        })
      }

      const message = error instanceof Error ? error.message : 'Не удалось получить ответ GigaChat.'
      dispatch({ type: 'ui/setError', payload: { value: message } })
    } finally {
      abortControllerRef.current = null
      dispatch({ type: 'ui/setLoading', payload: { value: false } })
    }
  }, [])

  const value = useMemo<ChatContextValue>(() => {
    const filtered = filterChats(state.chats, state.searchQuery)

    return {
      state,
      filteredChats: filtered,
      activeChat: state.chats.find((chat) => chat.id === state.activeChatId) ?? null,
      createChat: createChatHandler,
      setActiveChat,
      renameChat,
      deleteChat,
      setSearchQuery,
      updateSettings,
      resetSettings,
      clearError,
      sendMessage,
      stopGeneration,
    }
  }, [
    clearError,
    createChatHandler,
    deleteChat,
    renameChat,
    sendMessage,
    setActiveChat,
    setSearchQuery,
    state,
    stopGeneration,
    updateSettings,
    resetSettings,
  ])

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

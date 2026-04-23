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
import { requestChatCompletion, uploadAttachment } from '../lib/gigachat'
import { loadChatState, saveChatState } from '../lib/storage'
import type { Chat, ChatAttachment, ChatSettings, ChatState, PendingAttachment } from '../types/chat'
import { ChatContext } from './chat-context-instance'
import { chatReducer } from './chat-reducer'

export type SendMessagePayload = {
  content: string
  attachments?: PendingAttachment[]
}

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
  sendMessage: (chatId: string, payload: SendMessagePayload) => Promise<void>
  stopGeneration: () => void
}

function getLatestAssistantMessage(chat: Chat | null | undefined) {
  if (!chat) return null

  return [...chat.messages].reverse().find((message) => message.role === 'assistant') ?? null
}

function removeMessageFromState(state: ChatState, chatId: string, messageId: string): ChatState {
  const chats = state.chats.map((chat) => {
    if (chat.id !== chatId) return chat

    return {
      ...chat,
      messages: chat.messages.filter((message) => message.id !== messageId),
    }
  })

  return {
    ...state,
    chats,
    currentMessages: chats.find((chat) => chat.id === state.activeChatId)?.messages ?? [],
  }
}

function buildRequestMessages(chat: Chat, nextUserMessage: Chat['messages'][number]) {
  const messages = [...chat.messages]

  while (messages.at(-1)?.role === 'user') {
    messages.pop()
  }

  return [...messages, nextUserMessage]
}

async function uploadMessageAttachments(attachments: PendingAttachment[], signal?: AbortSignal) {
  const uploadedAttachments: ChatAttachment[] = []

  for (const attachment of attachments) {
    const fileId = await uploadAttachment(attachment, signal)

    uploadedAttachments.push({
      id: attachment.id,
      fileId,
      name: attachment.name,
      mimeType: attachment.mimeType,
      size: attachment.size,
      previewUrl: attachment.previewUrl,
    })
  }

  return uploadedAttachments
}

export function ChatProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(chatReducer, undefined, () => loadChatState())
  const stateRef = useRef(state)
  const abortControllerRef = useRef<AbortController | null>(null)
  const activeRequestIdRef = useRef(0)
  const activeAssistantMessageRef = useRef<{ chatId: string; messageId: string } | null>(null)

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
    activeRequestIdRef.current += 1
    abortControllerRef.current?.abort()
    abortControllerRef.current = null

    if (activeAssistantMessageRef.current) {
      stateRef.current = removeMessageFromState(
        stateRef.current,
        activeAssistantMessageRef.current.chatId,
        activeAssistantMessageRef.current.messageId,
      )

      dispatch({
        type: 'chats/deleteMessage',
        payload: {
          chatId: activeAssistantMessageRef.current.chatId,
          messageId: activeAssistantMessageRef.current.messageId,
        },
      })
      activeAssistantMessageRef.current = null
    }

    dispatch({ type: 'ui/setLoading', payload: { value: false } })
  }, [])

  const sendMessage = useCallback(async (chatId: string, payload: SendMessagePayload) => {
    const currentState = stateRef.current
    const chat = currentState.chats.find((item) => item.id === chatId)

    if (!chat) return

    const trimmedContent = payload.content.trim()
    const pendingAttachments = payload.attachments ?? []

    if (!trimmedContent && pendingAttachments.length === 0) return

    dispatch({ type: 'ui/setLoading', payload: { value: true } })
    dispatch({ type: 'ui/setError', payload: { value: null } })

    const controller = new AbortController()
    const requestId = activeRequestIdRef.current + 1
    activeRequestIdRef.current = requestId
    abortControllerRef.current = controller

    try {
      const uploadedAttachments = pendingAttachments.length
        ? await uploadMessageAttachments(pendingAttachments, controller.signal)
        : undefined

      const userMessage = {
        ...createMessage(chatId, 'user', trimmedContent),
        ...(uploadedAttachments?.length ? { attachments: uploadedAttachments } : {}),
      }

      const title = shouldAutoRenameChat(chat)
        ? generateChatTitle(trimmedContent || uploadedAttachments?.[0]?.name || '', chat.title)
        : undefined

      dispatch({ type: 'chats/addMessage', payload: { chatId, message: userMessage, title } })

      const nextMessages = buildRequestMessages(chat, userMessage)
      const assistantMessage = createMessage(chatId, 'assistant', '')
      activeAssistantMessageRef.current = { chatId, messageId: assistantMessage.id }

      dispatch({
        type: 'chats/addMessage',
        payload: {
          chatId,
          message: assistantMessage,
        },
      })

      const assistantText = await requestChatCompletion(
        nextMessages,
        stateRef.current.settings,
        (chunk) => {
          if (activeRequestIdRef.current !== requestId || controller.signal.aborted) {
            return
          }

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

      if (activeRequestIdRef.current !== requestId || controller.signal.aborted) {
        return
      }

      dispatch({
        type: 'chats/updateMessage',
        payload: {
          chatId,
          messageId: assistantMessage.id,
          content: assistantText,
        },
      })
    } catch (error) {
      const currentChat = stateRef.current.chats.find((item) => item.id === chatId)
      const latestAssistantMessage = getLatestAssistantMessage(currentChat)

      if (latestAssistantMessage?.role === 'assistant' && !latestAssistantMessage.content) {
        dispatch({
          type: 'chats/deleteMessage',
          payload: { chatId, messageId: latestAssistantMessage.id },
        })
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        activeAssistantMessageRef.current = null
        return
      }

      const message = error instanceof Error ? error.message : 'Не удалось получить ответ GigaChat.'
      dispatch({ type: 'ui/setError', payload: { value: message } })
    } finally {
      if (activeRequestIdRef.current === requestId) {
        activeAssistantMessageRef.current = null
        abortControllerRef.current = null
        dispatch({ type: 'ui/setLoading', payload: { value: false } })
      }
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

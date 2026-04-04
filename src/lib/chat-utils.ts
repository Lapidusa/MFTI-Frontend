import type { Chat, ChatSettings, Message, MessageRole } from '../types/chat'

export const CHAT_STORAGE_KEY = 'mfti-chat-state'

export const defaultSettings: ChatSettings = {
  model: 'GigaChat',
  temperature: 0.8,
  topP: 0.95,
  maxTokens: 1024,
  systemPrompt: 'Ты дружелюбный ассистент, помогающий с интерфейсом.',
  theme: 'light',
}

export function createChat(title: string): Chat {
  const now = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    title,
    createdAt: now,
    updatedAt: now,
    messages: [],
  }
}

export function createMessage(chatId: string, role: MessageRole, content: string): Message {
  return {
    id: crypto.randomUUID(),
    chatId,
    role,
    content,
    createdAt: new Date().toISOString(),
  }
}

export function getDefaultChatTitle(chats: Chat[]): string {
  return `Диалог ${chats.length + 1}`
}

export function createNewChat(chats: Chat[]): Chat {
  return createChat(getDefaultChatTitle(chats))
}

export function isUntitledChatTitle(title: string): boolean {
  return title === 'Новый чат' || /^Диалог \d+$/.test(title)
}

export function generateChatTitle(content: string, fallbackTitle: string): string {
  const normalized = content.replace(/\s+/g, ' ').trim()

  if (normalized.length >= 4) {
    return normalized.length > 38 ? `${normalized.slice(0, 38).trimEnd()}...` : normalized
  }

  return fallbackTitle
}

export function shouldAutoRenameChat(chat: Chat): boolean {
  return chat.messages.filter((message) => message.role === 'user').length === 0 && isUntitledChatTitle(chat.title)
}

export function getLastMessagePreview(chat: Chat): string {
  return chat.messages.at(-1)?.content ?? ''
}

export function filterChats(chats: Chat[], query: string): Chat[] {
  const normalized = query.trim().toLowerCase()

  if (!normalized) return chats

  return chats.filter((chat) => {
    const titleMatch = chat.title.toLowerCase().includes(normalized)
    const lastMessageMatch = getLastMessagePreview(chat).toLowerCase().includes(normalized)

    return titleMatch || lastMessageMatch
  })
}

export function formatChatDate(value: string): string {
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

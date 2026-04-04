export type MessageRole = 'system' | 'user' | 'assistant'

export type ThemeMode = 'light' | 'dark'

export type ModelName = 'GigaChat' | 'GigaChat-Plus' | 'GigaChat-Pro' | 'GigaChat-Max'

export type Message = {
  id: string
  chatId: string
  role: MessageRole
  content: string
  createdAt: string
}

export type Chat = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages: Message[]
}

export type ChatSettings = {
  model: ModelName
  temperature: number
  topP: number
  maxTokens: number
  systemPrompt: string
  theme: ThemeMode
}

export type ChatState = {
  chats: Chat[]
  activeChatId: string | null
  currentMessages: Message[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  settings: ChatSettings
}

export type ChatAction =
  | { type: 'chats/hydrate'; payload: ChatState }
  | { type: 'chats/create'; payload: { chat: Chat } }
  | { type: 'chats/setActive'; payload: { chatId: string | null } }
  | { type: 'chats/rename'; payload: { chatId: string; title: string } }
  | { type: 'chats/delete'; payload: { chatId: string } }
  | { type: 'chats/addMessage'; payload: { chatId: string; message: Message; title?: string } }
  | { type: 'chats/deleteMessage'; payload: { chatId: string; messageId: string } }
  | { type: 'chats/updateMessage'; payload: { chatId: string; messageId: string; content: string } }
  | { type: 'ui/setSearchQuery'; payload: { value: string } }
  | { type: 'ui/setLoading'; payload: { value: boolean } }
  | { type: 'ui/setError'; payload: { value: string | null } }
  | { type: 'settings/update'; payload: ChatSettings }
  | { type: 'settings/reset'; payload: ChatSettings }

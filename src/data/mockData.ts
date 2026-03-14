export type ChatItemData = {
  id: string
  title: string
  lastMessageAt: string
}

export type MessageData = {
  id: string
  role: 'user' | 'assistant'
  name: string
  content: string
}

export const mockChats: ChatItemData[] = [
  { id: 'chat-1', title: 'Проект: архитектура интерфейса', lastMessageAt: '12.03.2026' },
  { id: 'chat-2', title: 'Идеи для дизайна онбординга', lastMessageAt: '11.03.2026' },
  { id: 'chat-3', title: 'Технические требования и дедлайны', lastMessageAt: '10.03.2026' },
  { id: 'chat-4', title: 'Вопросы по API и авторизации', lastMessageAt: '09.03.2026' },
  { id: 'chat-5', title: 'Подготовка презентации продукта', lastMessageAt: '08.03.2026' },
]

export const mockMessages: MessageData[] = [
  {
    id: 'msg-1',
    role: 'assistant',
    name: 'GigaChat',
    content:
      'Привет! Я могу помочь с планированием интерфейса. **Что обсудим?**',
  },
  {
    id: 'msg-2',
    role: 'user',
    name: 'Вы',
    content: 'Нужен скелет приложения: sidebar, чат и настройки.',
  },
  {
    id: 'msg-3',
    role: 'assistant',
    name: 'GigaChat',
    content:
      'Отлично. Могу предложить структуру:\n\n- Layout с гибкой сеткой\n- Список чатов\n- Область сообщений',
  },
  {
    id: 'msg-4',
    role: 'user',
    name: 'Вы',
    content:
      'Добавь поддержку markdown. Например:\n\n```ts\nconst ready = true\n```',
  },
  {
    id: 'msg-5',
    role: 'assistant',
    name: 'GigaChat',
    content:
      'Готово. *Курсив* и **жирный** поддерживаются, списки и код тоже.',
  },
  {
    id: 'msg-6',
    role: 'user',
    name: 'Вы',
    content: 'Супер, продолжай в том же духе.',
  },
]

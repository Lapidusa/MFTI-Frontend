import { createContext } from 'react'
import type { ChatContextValue } from './ChatContext'

export const ChatContext = createContext<ChatContextValue | null>(null)

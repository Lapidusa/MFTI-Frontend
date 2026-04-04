import { useContext } from 'react'
import { ChatContext } from './chat-context-instance'

export function useChatContext() {
  const value = useContext(ChatContext)

  if (!value) {
    throw new Error('useChatContext must be used inside ChatProvider.')
  }

  return value
}

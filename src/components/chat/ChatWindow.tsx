import type { MessageData } from '../../data/mockData'
import { InputArea } from './InputArea'
import { MessageList } from './MessageList'

type ChatWindowProps = {
  title: string
  messages: MessageData[]
  onOpenSidebar: () => void
  onOpenSettings: () => void
}

export function ChatWindow({
  title,
  messages,
  onOpenSidebar,
  onOpenSettings,
}: ChatWindowProps) {
  return (
    <section className="chat-window">
      <header className="chat-header">
        <button className="burger-button" type="button" onClick={onOpenSidebar}>
          ☰
        </button>
        <div className="chat-title">{title}</div>
        <button
          className="icon-button settings-button"
          type="button"
          onClick={onOpenSettings}
        >
          ⚙
        </button>
      </header>
      <MessageList messages={messages} isTyping />
      <InputArea />
    </section>
  )
}

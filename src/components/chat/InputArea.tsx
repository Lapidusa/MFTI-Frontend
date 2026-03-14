import { useRef, useState } from 'react'

export function InputArea() {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const resize = () => {
    const el = textareaRef.current
    if (!el) return
    const styles = window.getComputedStyle(el)
    const lineHeight = Number.parseFloat(styles.lineHeight)
    const maxHeight = lineHeight * 5 + 24
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`
  }

  const handleChange = (next: string) => {
    setValue(next)
    requestAnimationFrame(resize)
  }

  const handleSend = () => {
    if (!value.trim()) return
    setValue('')
    requestAnimationFrame(resize)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="input-area">
      <button className="icon-button attach-button" type="button">
        📎
      </button>
      <textarea
        ref={textareaRef}
        value={value}
        rows={1}
        placeholder="Введите сообщение"
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        className="stop-button"
        type="button"
        disabled
        title="Функция остановки появится позже"
      >
        Стоп
      </button>
      <button
        className="send-button"
        type="button"
        disabled={!value.trim()}
        onClick={handleSend}
      >
        Отправить
      </button>
    </div>
  )
}

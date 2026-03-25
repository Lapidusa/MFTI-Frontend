import { useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'

type InputAreaProps = {
  isLoading: boolean
  onSend: (value: string) => void
}

export function InputArea({ isLoading, onSend }: InputAreaProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const resize = () => {
    const element = textareaRef.current

    if (!element) return

    const styles = window.getComputedStyle(element)
    const lineHeight = Number.parseFloat(styles.lineHeight)
    const maxHeight = lineHeight * 5 + 24

    element.style.height = 'auto'
    element.style.height = `${Math.min(element.scrollHeight, maxHeight)}px`
  }

  const handleChange = (next: string) => {
    setValue(next)
    requestAnimationFrame(resize)
  }

  const handleSend = () => {
    const trimmedValue = value.trim()

    if (!trimmedValue || isLoading) return

    onSend(trimmedValue)
    setValue('')
    requestAnimationFrame(resize)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleSend()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <form className="input-area" onSubmit={handleSubmit}>
      <button className="icon-button attach-button" type="button" aria-label="Прикрепить">
        +
      </button>
      <textarea
        ref={textareaRef}
        value={value}
        rows={1}
        placeholder="Введите сообщение"
        disabled={isLoading}
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
      <button className="send-button" type="submit" disabled={!value.trim() || isLoading}>
        Отправить
      </button>
    </form>
  )
}

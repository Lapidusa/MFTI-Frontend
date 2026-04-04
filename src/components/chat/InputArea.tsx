import { useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'

type InputAreaProps = {
  isLoading: boolean
  onSend: (value: string) => void | Promise<void>
  onStop: () => void
}

export function InputArea({ isLoading, onSend, onStop }: InputAreaProps) {
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
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      handleSend()
    }
  }

  const isSubmitDisabled = !value.trim() || isLoading

  return (
    <form className="input-area" onSubmit={handleSubmit}>
      <button className="icon-button attach-button" type="button" aria-label="Прикрепить">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 12H20M12 4V20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <textarea
        ref={textareaRef}
        value={value}
        rows={1}
        placeholder="Введите сообщение"
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      {isLoading ? (
        <button className="stop-button" type="button" onClick={onStop}>
          Стоп
        </button>
      ) : (
        <button className="send-button" type="submit" disabled={isSubmitDisabled}>
          Отправить
        </button>
      )}
    </form>
  )
}

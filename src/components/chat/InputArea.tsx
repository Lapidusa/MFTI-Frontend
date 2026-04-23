import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react'
import type { PendingAttachment } from '../../types/chat'

type InputAreaProps = {
  isLoading: boolean
  onSend: (payload: { value: string; attachments: PendingAttachment[] }) => void | Promise<void>
  onStop: () => void
}

async function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Не удалось прочитать файл.'))
    reader.readAsDataURL(file)
  })
}

export function InputArea({ isLoading, onSend, onStop }: InputAreaProps) {
  const [value, setValue] = useState('')
  const [attachments, setAttachments] = useState<PendingAttachment[]>([])
  const [attachmentError, setAttachmentError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const formRef = useRef<HTMLFormElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const measureRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const resizeFrameRef = useRef<number | null>(null)

  const scheduleResize = (hasText = value.length > 0) => {
    if (resizeFrameRef.current !== null) {
      window.cancelAnimationFrame(resizeFrameRef.current)
    }

    resizeFrameRef.current = window.requestAnimationFrame(() => {
      resizeFrameRef.current = null
      resize(hasText)
    })
  }

  const resize = (hasText = value.length > 0) => {
    const element = textareaRef.current
    const form = formRef.current
    const measure = measureRef.current

    if (!element || !form || !measure) return

    const styles = window.getComputedStyle(element)
    const formStyles = window.getComputedStyle(form)
    const lineHeight = Number.parseFloat(styles.lineHeight)
    const maxHeight = lineHeight * 5 + 24
    const singleLineThreshold = lineHeight + 1
    const shouldExpand = Boolean(attachments.length) || Boolean(attachmentError)
    const formPaddingLeft = Number.parseFloat(formStyles.paddingLeft) || 0
    const formPaddingRight = Number.parseFloat(formStyles.paddingRight) || 0
    const columnGap = Number.parseFloat(formStyles.columnGap) || 0
    const compactWidth = Math.max(
      form.clientWidth - formPaddingLeft - formPaddingRight - 42 - 42 - columnGap * 2,
      0,
    )

    measure.style.width = `${compactWidth}px`
    measure.value = element.value
    measure.style.height = 'auto'

    const compactScrollHeight = measure.scrollHeight
    const exceedsCompactSingleLine = compactScrollHeight > singleLineThreshold

    element.style.height = 'auto'
    element.style.height = `${Math.min(element.scrollHeight, maxHeight)}px`
    element.style.overflowY = element.scrollHeight > maxHeight ? 'auto' : 'hidden'
    element.scrollTop = element.scrollHeight
    const exceedsCurrentSingleLine = element.scrollHeight > singleLineThreshold

    if (shouldExpand) {
      setIsExpanded(true)
      return
    }

    if (!hasText) {
      setIsExpanded(false)
      return
    }

    setIsExpanded(isExpanded ? exceedsCompactSingleLine : exceedsCurrentSingleLine)
  }

  useEffect(() => {
    scheduleResize(value.length > 0)
  }, [attachments.length, attachmentError])

  useEffect(() => {
    scheduleResize(value.length > 0)
  }, [isExpanded])

  useEffect(() => {
    const form = formRef.current

    if (!form) return

    const handleResize = () => {
      scheduleResize(value.length > 0)
    }

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(handleResize)
      observer.observe(form)

      return () => observer.disconnect()
    }

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [value, attachments.length, attachmentError, isExpanded])

  useEffect(() => {
    return () => {
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current)
      }
    }
  }, [])

  const handleChange = (next: string) => {
    setValue(next)
    scheduleResize(next.length > 0)
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = Array.from(event.target.files ?? [])

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setAttachmentError('Можно прикрепить только изображение.')
      event.target.value = ''
      return
    }

    if (file.size > 15 * 1024 * 1024) {
      setAttachmentError('Размер изображения не должен превышать 15 МБ.')
      event.target.value = ''
      return
    }

    try {
      const previewUrl = await readFileAsDataUrl(file)

      setAttachments([
        {
          id: crypto.randomUUID(),
          file,
          name: file.name,
          mimeType: file.type,
          size: file.size,
          previewUrl,
        },
      ])
      setAttachmentError(null)
    } catch (error) {
      setAttachmentError(error instanceof Error ? error.message : 'Не удалось прочитать файл.')
    } finally {
      event.target.value = ''
    }
  }

  const handleSend = async () => {
    const trimmedValue = value.trim()
    const nextAttachments = [...attachments]

    if ((!trimmedValue && nextAttachments.length === 0) || isLoading) return

    setValue('')
    setAttachments([])
    setAttachmentError(null)
    setIsExpanded(false)
    scheduleResize(false)

    await onSend({ value: trimmedValue, attachments: nextAttachments })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void handleSend()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      void handleSend()
    }
  }

  const isSubmitDisabled = (!value.trim() && attachments.length === 0) || isLoading

  return (
    <form ref={formRef} className={`input-area ${isExpanded ? 'is-expanded' : 'is-compact'}`} onSubmit={handleSubmit}>
      <input
        ref={fileInputRef}
        className="sr-only-file-input"
        type="file"
        accept="image/png,image/jpeg,image/bmp,image/tiff"
        onChange={handleFileChange}
      />
      <button
        className="icon-button attach-button"
        type="button"
        aria-label="Прикрепить изображение"
        onClick={() => fileInputRef.current?.click()}
      >
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
      <div className="input-main">
        {attachments.length ? (
          <div className="input-attachments">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="attachment-chip">
                {attachment.previewUrl ? (
                  <img src={attachment.previewUrl} alt={attachment.name} className="attachment-chip-preview" />
                ) : null}
                <div className="attachment-chip-meta">
                  <span>{attachment.name}</span>
                  <span>{Math.round(attachment.size / 1024)} KB</span>
                </div>
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Удалить вложение"
                  onClick={() => setAttachments([])}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : null}
        <textarea
          ref={textareaRef}
          value={value}
          rows={1}
          placeholder="Введите сообщение"
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        {attachmentError ? <div className="input-help error">{attachmentError}</div> : null}
        {!attachmentError && attachments.length ? (
          <div className="input-help">GigaChat принимает не более одного изображения на сообщение.</div>
        ) : null}
        <textarea ref={measureRef} className="input-textarea-measure" rows={1} tabIndex={-1} aria-hidden="true" />
      </div>
      {isLoading ? (
        <button className="stop-button" type="button" onClick={onStop} aria-label="Стоп">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" />
          </svg>
        </button>
      ) : (
        <button className="send-button" type="submit" disabled={isSubmitDisabled} aria-label="Отправить">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 18V7M12 7L7.75 11.25M12 7L16.25 11.25"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </form>
  )
}

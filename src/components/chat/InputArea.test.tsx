import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { InputArea } from './InputArea'

describe('InputArea', () => {
  it('calls onSend with trimmed text on submit button click', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()

    render(<InputArea isLoading={false} onSend={onSend} onStop={vi.fn()} />)

    await user.type(screen.getByPlaceholderText('Введите сообщение'), '  Привет, мир  ')
    await user.click(screen.getByRole('button', { name: 'Отправить' }))

    expect(onSend).toHaveBeenCalledWith({
      value: 'Привет, мир',
      attachments: [],
    })
    expect(screen.getByPlaceholderText('Введите сообщение')).toHaveValue('')
  })

  it('calls onSend when Enter is pressed without Shift', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()

    render(<InputArea isLoading={false} onSend={onSend} onStop={vi.fn()} />)

    await user.type(screen.getByPlaceholderText('Введите сообщение'), 'Тест{enter}')

    expect(onSend).toHaveBeenCalledWith({
      value: 'Тест',
      attachments: [],
    })
  })

  it('disables submit button when textarea is empty', () => {
    render(<InputArea isLoading={false} onSend={vi.fn()} onStop={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Отправить' })).toBeDisabled()
  })
})

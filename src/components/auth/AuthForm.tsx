import { useState } from 'react'
import { Button } from '../ui/Button'
import { ErrorMessage } from '../ui/ErrorMessage'

type AuthFormProps = {
  onSuccess: () => void
}

type ScopeValue = 'GIGACHAT_API_PERS' | 'GIGACHAT_API_B2B' | 'GIGACHAT_API_CORP'

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [credentials, setCredentials] = useState('')
  const [scope, setScope] = useState<ScopeValue>('GIGACHAT_API_PERS')
  const [error, setError] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!credentials.trim()) {
      setError('Введите credentials в формате Base64.')
      return
    }
    setError('')
    onSuccess()
  }

  return (
    <div className="auth-screen">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Вход в GigaChat</h1>
        <label>
          Credentials (Base64)
          <input
            type="password"
            value={credentials}
            onChange={(event) => setCredentials(event.target.value)}
            placeholder="Введите ключ"
          />
        </label>
        {error ? <ErrorMessage message={error} /> : null}
        <fieldset>
          <legend>Scope</legend>
          <label className="radio">
            <input
              type="radio"
              name="scope"
              checked={scope === 'GIGACHAT_API_PERS'}
              onChange={() => setScope('GIGACHAT_API_PERS')}
            />
            GIGACHAT_API_PERS
          </label>
          <label className="radio">
            <input
              type="radio"
              name="scope"
              checked={scope === 'GIGACHAT_API_B2B'}
              onChange={() => setScope('GIGACHAT_API_B2B')}
            />
            GIGACHAT_API_B2B
          </label>
          <label className="radio">
            <input
              type="radio"
              name="scope"
              checked={scope === 'GIGACHAT_API_CORP'}
              onChange={() => setScope('GIGACHAT_API_CORP')}
            />
            GIGACHAT_API_CORP
          </label>
        </fieldset>
        <Button variant="primary" type="submit">
          Войти
        </Button>
      </form>
    </div>
  )
}

import
{ useState } from 'react'
import './App.css'
import { AppLayout } from './components/layout/AppLayout'
import { AuthForm } from './components/auth/AuthForm'

function App() {
  const [isAuthed, setIsAuthed] = useState(false)

  return (
    <div className="app-root">
      {isAuthed ? (
        <AppLayout />
      ) : (
        <AuthForm onSuccess={() => setIsAuthed(true)} />
      )}
    </div>
  )
}

export default App

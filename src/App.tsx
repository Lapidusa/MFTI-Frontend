import './App.css'
import { BrowserRouter } from 'react-router-dom'
import { ChatProvider } from './context/ChatContext'
import { AppLayout } from './components/layout/AppLayout'

function App() {
  return (
    <BrowserRouter>
      <ChatProvider>
        <div className="app-root">
          <AppLayout />
        </div>
      </ChatProvider>
    </BrowserRouter>
  )
}

export default App

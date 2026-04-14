import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'
import { ErrorMessage } from './ErrorMessage'

type ErrorBoundaryProps = {
  children: ReactNode
  onRetry?: () => void
}

type ErrorBoundaryState = {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Message area render failed', error, info)
  }

  handleRetry = () => {
    this.setState({ hasError: false })
    this.props.onRetry?.()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="message-error-fallback" role="alert">
          <ErrorMessage message="Не удалось отрисовать сообщения. Попробуйте повторить." />
          <button className="btn secondary" type="button" onClick={this.handleRetry}>
            Повторить
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

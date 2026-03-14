type TypingIndicatorProps = {
  isVisible?: boolean
}

export function TypingIndicator({ isVisible = true }: TypingIndicatorProps) {
  if (!isVisible) return null

  return (
    <div className="typing-indicator">
      <span />
      <span />
      <span />
    </div>
  )
}

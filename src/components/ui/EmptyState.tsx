type EmptyStateProps = {
  title?: string
  description?: string
}

export function EmptyState({
  title = 'Начните новый диалог',
  description,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-illustration">💬</div>
      <div className="empty-state-title">{title}</div>
      {description ? <div className="empty-state-description">{description}</div> : null}
    </div>
  )
}

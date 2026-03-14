type ToggleProps = {
  label: string
  leftLabel: string
  rightLabel: string
  value: 'light' | 'dark'
  onChange: (value: 'light' | 'dark') => void
}

export function Toggle({
  label,
  leftLabel,
  rightLabel,
  value,
  onChange,
}: ToggleProps) {
  return (
    <label className="theme-toggle">
      {label}
      <div className="toggle">
        <button
          type="button"
          className={value === 'light' ? 'is-active' : ''}
          onClick={() => onChange('light')}
        >
          {leftLabel}
        </button>
        <button
          type="button"
          className={value === 'dark' ? 'is-active' : ''}
          onClick={() => onChange('dark')}
        >
          {rightLabel}
        </button>
      </div>
    </label>
  )
}

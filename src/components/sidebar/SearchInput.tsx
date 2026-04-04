type SearchInputProps = {
  value: string
  onChange: (value: string) => void
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="search-input">
      <input
        type="text"
        placeholder="Поиск по чатам"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

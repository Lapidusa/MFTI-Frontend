type SliderProps = {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
}

export function Slider({ label, min, max, step, value, onChange }: SliderProps) {
  return (
    <label>
      {label}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number.parseFloat(event.target.value))}
      />
    </label>
  )
}

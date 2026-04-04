import { useEffect } from 'react'
import { Button } from '../ui/Button'
import { Slider } from '../ui/Slider'
import { Toggle } from '../ui/Toggle'
import type { ChatSettings } from '../../types/chat'

export type SettingsState = ChatSettings

type SettingsPanelProps = {
  isOpen: boolean
  settings: SettingsState
  onChange: (next: SettingsState) => void
  onClose: () => void
  onSave: () => void
  onReset: () => void
}

export function SettingsPanel({
  isOpen,
  settings,
  onChange,
  onClose,
  onSave,
  onReset,
}: SettingsPanelProps) {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme)
  }, [settings.theme])

  return (
    <div className={`settings-panel ${isOpen ? 'is-open' : ''}`}>
      <div className="settings-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="settings-drawer" role="dialog" aria-modal="true">
        <div className="settings-header">
          <h2>Настройки</h2>
          <button className="icon-button" type="button" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="settings-body">
          <label>
            Модель
            <select
              value={settings.model}
              onChange={(event) =>
                onChange({
                  ...settings,
                  model: event.target.value as SettingsState['model'],
                })
              }
            >
              <option value="GigaChat">GigaChat</option>
              <option value="GigaChat-Plus">GigaChat-Plus</option>
              <option value="GigaChat-Pro">GigaChat-Pro</option>
              <option value="GigaChat-Max">GigaChat-Max</option>
            </select>
          </label>
          <Slider
            label={`Temperature: ${settings.temperature.toFixed(1)}`}
            min={0}
            max={2}
            step={0.1}
            value={settings.temperature}
            onChange={(value) =>
              onChange({ ...settings, temperature: value })
            }
          />
          <Slider
            label={`Top-P: ${settings.topP.toFixed(2)}`}
            min={0}
            max={1}
            step={0.01}
            value={settings.topP}
            onChange={(value) => onChange({ ...settings, topP: value })}
          />
          <label>
            Max Tokens
            <input
              type="number"
              min={1}
              max={4096}
              value={settings.maxTokens}
              onChange={(event) =>
                onChange({
                  ...settings,
                  maxTokens: Number.parseInt(event.target.value || '0', 10),
                })
              }
            />
          </label>
          <label>
            System Prompt
            <textarea
              value={settings.systemPrompt}
              rows={4}
              onChange={(event) =>
                onChange({ ...settings, systemPrompt: event.target.value })
              }
            />
          </label>
          <Toggle
            label="Тема"
            leftLabel="Светлая"
            rightLabel="Темная"
            value={settings.theme}
            onChange={(next) => onChange({ ...settings, theme: next })}
          />
        </div>
        <div className="settings-footer">
          <Button variant="secondary" type="button" onClick={onReset}>
            Сбросить
          </Button>
          <Button variant="primary" type="button" onClick={onSave}>
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  )
}

# Bundle Summary

Отчёт сгенерирован командой:

```bash
npm run analyze
```

Файл визуализатора:

- [bundle-stats.html](./bundle-stats.html)

Наблюдения по сборке от 2026-04-12:

- основной чанк `index` около `235 kB`
- markdown-чанк около `161 kB`
- `react-markdown` и `highlight.js` вынесены из стартового чанка
- `Sidebar` и `SettingsPanel` грузятся отдельными чанками
- route views для `/` и `/chat/:id` грузятся отдельными чанками

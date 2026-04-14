# MFTI Frontend Chat

Учебное приложение-чата на `React + TypeScript + Vite` с интеграцией `GigaChat`, локальным сохранением истории, lazy loading, тестами и подготовкой к деплою на Vercel.

## Демо

- Public demo: добавьте ссылку после деплоя в Vercel, например `https://your-project.vercel.app`
- Bundle report: [docs/bundle-stats.html](./docs/bundle-stats.html)
- Bundle notes: [docs/bundle-summary.md](./docs/bundle-summary.md)

## Что сделано для ДЗ 9

- вынесены тяжёлые зависимости `react-markdown` и `highlight.js` в отдельный чанк `markdown`
- `Sidebar`, `SettingsPanel` и route views загружаются через `React.lazy + Suspense`
- `ChatItem` обёрнут в `React.memo`
- стабилизированы ключевые обработчики через `useCallback`
- добавлен `ErrorBoundary` вокруг области сообщений
- для UI-ошибок добавлена кнопка `Повторить`
- добавлен bundle analyzer и сохранён отчёт в `docs/`
- добавлен `vercel.json` для SPA routing
- добавлена serverless proxy-функция для GigaChat в `api/gigachat/chat/completions.ts`

## Стек

| Технология | Версия |
| --- | --- |
| React | 19.2.4 |
| React DOM | 19.2.4 |
| TypeScript | 5.9.3 |
| Vite | 8.0.0 |
| React Router DOM | 7.9.5 |
| Vitest | 4.1.4 |
| React Testing Library | 16.3.2 |
| user-event | 14.6.1 |
| jsdom | 29.0.2 |
| rollup-plugin-visualizer | 7.0.1 |

## Запуск локально

1. Клонируйте репозиторий:

```bash
git clone https://github.com/Lapidusa/MFTI-Frontend.git
cd MFTI-Frontend
```

2. Установите зависимости:

```bash
npm install
```

3. Создайте `.env` на основе `.env.example`.

4. Для локальной разработки заполните минимум `VITE_GIGACHAT_AUTH_KEY`.

5. Запустите проект:

```bash
npm run dev
```

6. Дополнительно:

```bash
npm test
npm run build
npm run analyze
```

## Переменные окружения

| Переменная | Где используется | Обязательна | Описание |
| --- | --- | --- | --- |
| `VITE_GIGACHAT_AUTH_KEY` | локальная разработка | да, только для `npm run dev` | Base64 строка `client_id:client_secret` для прямой работы через Vite proxy |
| `VITE_GIGACHAT_SCOPE` | локальная разработка | нет | Scope для OAuth, по умолчанию `GIGACHAT_API_PERS` |
| `VITE_GIGACHAT_OAUTH_URL` | локальная разработка | нет | URL OAuth endpoint, по умолчанию `/api/gigachat/oauth` |
| `VITE_GIGACHAT_CHAT_URL` | локальная разработка и prod | нет | URL chat endpoint, по умолчанию `/api/gigachat/chat/completions` |
| `GIGACHAT_AUTH_KEY` | Vercel Function | да для production | Секрет GigaChat, хранится только в настройках Vercel |
| `GIGACHAT_SCOPE` | Vercel Function | нет | Scope для production proxy, по умолчанию `GIGACHAT_API_PERS` |

## Деплой в Vercel

Проект подготовлен под Vercel: есть `vercel.json` для deep links и `api/gigachat/chat/completions.ts`, чтобы не держать секрет в клиентском бандле.

### Вариант через UI

1. Откройте [Vercel Dashboard](https://vercel.com/new).
2. Импортируйте репозиторий `Lapidusa/MFTI-Frontend`.
3. Framework Preset: `Vite`.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Добавьте env-переменные:
   - `GIGACHAT_AUTH_KEY`
   - `GIGACHAT_SCOPE`
7. Нажмите `Deploy`.

### Вариант через CLI

```bash
npm i -g vercel
vercel
vercel --prod
```

При первом запуске CLI попросит авторизацию и привязку проекта.

## Что проверить после деплоя

1. Откройте `/` и `/chat/test-route` напрямую в новой вкладке: SPA rewrite должен работать.
2. Проверьте приложение в режиме инкогнито.
3. Отправьте сообщение и убедитесь, что ответы приходят через production proxy.
4. Убедитесь, что в собранном клиентском JS нет `GIGACHAT_AUTH_KEY`.
5. Добавьте реальную публичную ссылку в секцию `Демо`.

## Бандл

После `npm run analyze` отчёт сохраняется в `docs/bundle-stats.html`.

Ключевой результат текущей сборки:

- `dist/assets/index-*.js` около `235 kB`
- `dist/assets/markdown-*.js` около `161 kB`
- `Sidebar`, `SettingsPanel`, `ChatRouteView`, `EmptyChatRouteView` вынесены в отдельные чанки

Это означает, что `react-markdown` и `highlight.js` больше не попадают в стартовый UI-чанк.

## Самопроверка

- `npm test` проходит
- `npm run build` проходит
- lazy loading настроен
- `ErrorBoundary` добавлен
- Vercel deployment config добавлен
- bundle analyzer добавлен

## Ограничения

- Публичный URL не добавлен автоматически, потому что деплой требует авторизации в вашем аккаунте Vercel.
- Для полного соответствия чек-листу добавьте после деплоя скриншоты работающего приложения в README или `docs/`.

# MFTI Frontend Chat

Чат-приложение на `React + TypeScript + Vite` с интерфейсом в стиле ChatGPT и интеграцией с `GigaChat API`.

Реализовано под итоговое домашнее задание:

- чат с историей сообщений и разным оформлением ролей `user/assistant`
- markdown-рендеринг ответов и подсветка кода
- streaming-ответы через SSE с кнопкой остановки генерации
- автоматический скролл к последнему сообщению
- копирование ответа ассистента
- sidebar со списком чатов, поиском, переименованием и удалением
- автогенерация названия чата по первому сообщению
- сохранение чатов и настроек в `localStorage`
- настройки модели: `temperature`, `top_p`, `max_tokens`, `repetition_penalty`, `system prompt`
- получение списка моделей через `GET /api/v1/models`
- загрузка изображений и отправка multimodal-запросов в GigaChat
- serverless proxy для production (`chat/completions`, `models`, `files`)

## Стек

- React 19
- TypeScript
- Vite
- Context API + `useReducer`
- CSS
- `react-markdown`
- `highlight.js`
- Vitest + Testing Library

## Запуск

1. Установите зависимости.

```bash
npm install
```

2. Создайте `.env` по примеру `.env.example`.

3. Для локальной разработки заполните минимум:

```env
VITE_GIGACHAT_AUTH_KEY=...
```

4. Запустите проект:

```bash
npm run dev
```

## Переменные окружения

### Клиент / локальная разработка

- `VITE_GIGACHAT_AUTH_KEY` - Base64 строка `client_id:client_secret`
- `VITE_GIGACHAT_SCOPE` - scope OAuth, по умолчанию `GIGACHAT_API_PERS`
- `VITE_GIGACHAT_OAUTH_URL` - URL OAuth proxy
- `VITE_GIGACHAT_CHAT_URL` - URL chat completions proxy
- `VITE_GIGACHAT_MODELS_URL` - URL списка моделей
- `VITE_GIGACHAT_FILES_URL` - URL загрузки файлов

### Production / Vercel

- `GIGACHAT_AUTH_KEY`
- `GIGACHAT_SCOPE`

## API

Приложение использует:

- `POST /api/v1/chat/completions`
- `GET /api/v1/models`
- `POST /api/v1/files`
- `POST /api/v2/oauth`

В development запросы идут через Vite proxy, в production через serverless-функции в папке [api](./api).

## Проверка

Основные команды:

```bash
npm test
npm run build
```

## Что показать при сдаче

- ссылку на репозиторий
- README с инструкцией запуска
- демо-скриншоты или видео работы приложения
- при наличии деплоя ссылку на опубликованную версию

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GIGACHAT_AUTH_KEY?: string
  readonly VITE_GIGACHAT_SCOPE?: string
  readonly VITE_GIGACHAT_OAUTH_URL?: string
  readonly VITE_GIGACHAT_CHAT_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

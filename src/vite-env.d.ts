/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_USE_MOCK_DATA?: string;
  readonly VITE_ALLOW_API_FALLBACK?: string;
  readonly VITE_API_TIMEOUT_MS?: string;
  readonly VITE_API_RETRY_COUNT?: string;
  readonly VITE_DEBUG_LOGS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

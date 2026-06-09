/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_BASE_PATH: string;
  readonly VITE_REFRESH_MS: string;
  readonly VITE_PROXY_API_TARGET: string;
  readonly VITE_CONTACT_FACEBOOK_URL: string;
   readonly VITE_CONTACT_PHONE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

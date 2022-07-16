/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_ENDPOINT: string
    readonly VITE_RECAPTCHA_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

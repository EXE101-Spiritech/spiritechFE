/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SPIRIBE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Global define injected by vite.config.ts from .env `spiribe`
declare const __API_DOMAIN__: string;

// Allow importing SVGs, PNGs, and other assets as strings
/// <reference types="vite/types/importMeta" />

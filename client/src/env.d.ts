interface ImportMetaEnv {
  readonly PUBLIC_API_URL: string;
  readonly PUBLIC_HUB_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
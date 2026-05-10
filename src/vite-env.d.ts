/// <reference types="vite/client" />

/** 生产环境填 Railway 公网根 URL，勿带尾斜杠，如 https://xxx.up.railway.app */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
}

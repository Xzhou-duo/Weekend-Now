import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/** 从 `.env` 按行解析，避免 `loadEnv(..., '')` 被外层 `process.env` 覆盖 */
function readDotEnvKey(cwd: string, key: string): string | undefined {
  try {
    const raw = fs.readFileSync(path.join(cwd, '.env'), 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const eq = t.indexOf('=')
      if (eq === -1) continue
      const k = t.slice(0, eq).trim()
      if (k !== key) continue
      let v = t.slice(eq + 1).trim()
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1)
      }
      return v || undefined
    }
    return undefined
  } catch {
    return undefined
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), '')
  const cwd = process.cwd()
  const API_PORT =
    readDotEnvKey(cwd, 'MIMO_API_SERVER_PORT') ??
    process.env.MIMO_API_SERVER_PORT ??
    '8788'

  const devPort = Number(
    readDotEnvKey(cwd, 'VITE_DEV_PORT') ?? process.env.VITE_DEV_PORT ?? '5173',
  )

  return {
    plugins: [react()],
    server: {
      port: Number.isFinite(devPort) ? devPort : 5173,
      /** 占用时直接报错，避免静默跳到 5174 却还用旧书签 */
      strictPort: true,
      proxy: {
        '/api/recommend': {
          target: `http://127.0.0.1:${API_PORT}`,
          changeOrigin: true,
          timeout: 120_000,
          proxyTimeout: 120_000,
        },
      },
    },
  }
})

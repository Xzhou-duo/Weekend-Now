# 拍了拍 · Web（MVP 脚手架）

Vite + React + TypeScript + Tailwind CSS。视觉规范与令牌对齐仓库内 **`docs/design-system.md`**。

## 开发与构建

```bash
npm install
npm run dev
npm run build
```

## 设计令牌去哪看

| 位置 | 说明 |
|------|------|
| `tailwind.config.js` | Tailwind `theme.extend`：**颜色 / 间距 / 圆角 / 字号层级 / 字体栈** |
| `src/tokens/design-tokens.ts` | 同色值与间距的 TS 常量（图表、运行时逻辑用） |
| `src/index.css` | `@tailwind` 与轻量 `@layer base` |

### Tailwind 类名示例

- 背景：`bg-surface-bg`、`bg-brand-purple`、`bg-surface-card`
- 文字：`text-text-primary`、`text-text-secondary`、`text-title-page`、`text-body`
- 间距：`px-page-h`、`p-card-inner`、`gap-element`、`gap-section`
- 圆角：`rounded-card-main`、`rounded-block`、`rounded-badge`

产品范围见 **`docs/MVP-validation.md`**。

## MVP 已实现功能

`src/mvp/`：**8 张滑卡** → **今日三题** → **Top3 推荐（优先 MiMo-V2.5-Pro）** → **整体反馈**。  
`npm run dev` + 本地 API 时会先请求 `POST /api/recommend`（MiMo），失败或未配置密钥则自动使用 `src/mvp/recommend.ts` 规则兜底。

### 本地 MiMo API 示例

1. 复制 `cp .env.example .env`，填入 `MIMO_API_KEY`（不要将真实 key 提交仓库）。
2. **一条命令同时起 Vite + API**（推荐）：

   ```bash
   npm run dev:all
   ```

   `dev:all` **不会**在 API 退出时自动关掉 Vite（便于你先看到前端报错再排查）。PowerShell 也可用环境变量覆盖密钥：

   ```powershell
   $env:MIMO_API_KEY="你的key"; npm run dev:all
   ```

3. 实现文件：`server/recommend-api.mjs`，默认监听 `.env` 里的 `MIMO_API_SERVER_PORT`（常用 `8788`），模型 `mimo-v2.5-pro`；请求头同时带 `Authorization: Bearer` 与 `api-key`。`npm run dev:api` 使用 `node --env-file=.env`。Vite **默认固定 `http://localhost:5173`**（`strictPort`），若端口被占用会直接报错——请关掉占用进程或改 `.env` 里的 `VITE_DEV_PORT`。`/api/recommend` 代理到上述 API 端口（见 `vite.config.ts`）。

仅跑前端、不启 API 时：**仍会完整可用**，推荐语走本地规则。

构建产物 `npm run build` 为纯静态站，**不包含**该 Node 服务；上线需将同类接口部署到自建后端/Serverless。

开发环境会在控制台输出 `mvp_*` 埋点事件；亦派发 `window` 事件 `mvp-analytics`。

---

以下为 Vite 模板自带的 TypeScript ESLint 说明（可选阅读）。

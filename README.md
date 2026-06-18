# 拍了拍 · Web（MVP demo）

Vite + React + TypeScript + Tailwind CSS。视觉规范与令牌对齐仓库内 **`docs/design-system.md`**。

## 项目定位

Weekend-Now 是一个 AI 驱动的周末本地生活推荐 Demo，用于验证「轻量问答 + AI 推荐解释」的产品体验。

当前版本并未接入真实高德地图 / Google Places API，而是使用固定 POI 候选池模拟地点数据。推荐接口会根据用户的滑卡偏好、三题情境问答和候选 POI 信息，让模型从候选池中选择 3 个最匹配的地点，并生成推荐理由。

因此，本项目重点验证的是：
- 用户是否愿意通过轻量问题表达周末偏好
- AI 是否能基于候选池生成合理推荐
- 推荐理由是否能提升用户理解和决策效率
- MVP 交互链路是否完整

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

`src/mvp/` 主流程（详见 **`docs/MVP-validation.md`**）：

1. **冷启动** `SwipeStep`：20 张口味卡，≥8 张解锁推荐；白底引导区 + 紫色进度条；滑卡倾斜 + 渐变反馈；底部按钮带标签  
2. **今日三题** `QuizStep`：默认预填，可直接提交  
3. **推荐决策**：默认 **RecoSwipe** 刷卡（可切列表）；8 条池 + 实时重排；AI 理由 2 行展示  
4. **详情** `VenueDetailSheet`：地址 / 价格 / 营业时间  
5. **决定去处** → `DepartStep` 出发祝福 → 写入 `pendingFeedback` → 回访时 Quiz 页横幅触发出行反馈  
6. **出行反馈** `VisitFeedbackStep`：按店回收信号，更新口味画像（无整体感受页、无外链问卷）  
7. 底部 Tab：**发现 / 收藏 / 我的口味** · 候选 POI 22 条（上海 mock）

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

构建产物 `npm run build` 为静态前端；**推荐 API** 需单独托管（见下文 Railway）。

开发环境会在控制台输出 `mvp_*` 埋点事件；亦派发 `window` 事件 `mvp-analytics`。

---

## 部署：Vercel（前端）+ Railway（API）

### 1. Railway — `POST /api/recommend`

1. [Railway](https://railway.app) 新建项目 → **Deploy from GitHub**（或 CLI），选中本仓库。
2. **Root Directory** 设为 **`web`**（重要）。
3. **Variables**（示例）：

   | 变量 | 说明 |
   |------|------|
   | `MIMO_API_KEY` | 必填 |
   | `ALLOWED_ORIGINS` | **必填（生产）**：Vercel 站点完整 URL，逗号分隔多个，如 `https://paipa.vercel.app` |
   | `MIMO_BASE_URL` | 与小米控制台一致（默认见 `.env.example`） |
   | `MIMO_MODEL` | 可选 |

   **勿**在 Railway 配置 `PORT`，由平台注入。

4. **Settings → Networking → Generate Domain**，记下公网地址，例如 `https://paipa-api-production-xxxx.up.railway.app`。
5. 自检：浏览器打开 `https://…/health` 应返回 JSON `{ ok: true }`。

### 2. Vercel — 静态前端

1. [Vercel](https://vercel.com) Import 仓库，**Root Directory** 选 **`web`**。
2. Build：**默认** `npm run build`，Output **`dist`**（Vite 预设）。
3. **Environment Variables（Production）**：

   - `VITE_API_BASE_URL` = Railway 公网根 URL，**无尾斜杠**，例如 `https://paipa-api-production-xxxx.up.railway.app`

4. Deploy。此后前端会向 `${VITE_API_BASE_URL}/api/recommend` 发请求；本地开发不设该变量时仍走 Vite 代理的 `/api/recommend`。

### 3. 顺序与 CORS

先拿到 **Railway URL**，再填 **Vercel 的 `VITE_API_BASE_URL`** 并 redeploy。  
`ALLOWED_ORIGINS` 必须包含最终用户访问的 **Vercel 域名**（含 `https://`），否则会触发浏览器的跨域拦截。

仓库内 **`web/vercel.json`** 仅含 SPA fallback rewrite；**`web/railway.toml`** 指定 `npm run start`（即 `node ./server/recommend-api.mjs`）。

---

以下为 Vite 模板自带的 TypeScript ESLint 说明（可选阅读）。

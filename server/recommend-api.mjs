/**
 * 本地示例：POST /api/recommend → MiMo V2.5 Pro（OpenAI 兼容 `/v1/chat/completions`）
 * 运行：`MIMO_API_KEY=xxx node server/recommend-api.mjs`
 * Token Plan：`api-key` + `Authorization: Bearer`（与控制台 OpenAI 兼容示例一致）
 * 模型 id：`mimo-v2.5-pro`（可用 `MIMO_MODEL` 覆盖）
 */
import http from 'node:http'

function envTrim(name, fallback = '') {
  const v = process.env[name]
  if (v === undefined || v === null) return fallback
  return String(v).trim()
}

/** Railway / Fly 等会注入 PORT；本地仍可用 MIMO_API_SERVER_PORT */
const PORT =
  Number(envTrim('PORT')) ||
  Number(envTrim('MIMO_API_SERVER_PORT', '8788')) ||
  8788
/** 有 PORT（常见于云平台）时默认监听全网卡；本地仅 8788 时默认本机 */
const LISTEN_HOST =
  envTrim('LISTEN_HOST') ||
  (envTrim('PORT') ? '0.0.0.0' : '127.0.0.1')

const MIMO_API_KEY = envTrim('MIMO_API_KEY')
const MIMO_MODEL = envTrim('MIMO_MODEL', 'mimo-v2.5-pro')
const MIMO_BASE_RAW = envTrim(
  'MIMO_BASE_URL',
  'https://token-plan-cn.xiaomimimo.com/v1',
).replace(/\/$/, '')

const SYSTEM = `你是「拍了拍」周末本地出行的推荐助手。你必须且只能输出一个合法 JSON 对象（不要 Markdown、不要多余解释），格式严格为：
{"items":[{"id":"候选里的venue id","reason":"一两句中文推荐语（50～120字）"},{"id":"...","reason":"..."},{"id":"...","reason":"..."}]}
规则：
1）items 必须恰好 3 个；每个 id 必须原样选自用户给出的候选列表。
2）reason 要结合用户滑卡体现的偏好向量 + 今日三题的情境来写，通俗易懂。
3）不得编造候选列表里没有的店名或 id。
4）若无法在候选中挑出 3 个，也请输出你能给出的最贴切 3 个 id（仍须来自候选），不要道歉废话。`

/** 从 start 起截取 balanced `{...}`，字符串内的括号不计入深度 */
function sliceBalancedObject(s, start) {
  if (!s || start < 0 || start >= s.length || s[start] !== '{') return null
  let depth = 0
  let inStr = false
  let esc = false
  for (let i = start; i < s.length; i++) {
    const c = s[i]
    if (esc) {
      esc = false
      continue
    }
    if (inStr) {
      if (c === '\\') esc = true
      else if (c === '"') inStr = false
      continue
    }
    if (c === '"') {
      inStr = true
      continue
    }
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) return s.slice(start, i + 1)
    }
  }
  return null
}

function parseRecommendItems(text) {
  let s = String(text ?? '').trim()
  const fenced = /^```(?:json)?\s*([\s\S]*?)```$/im.exec(s)
  if (fenced) s = fenced[1].trim()

  let searchFrom = 0
  while (searchFrom < s.length) {
    const pos = s.indexOf('{', searchFrom)
    if (pos === -1) break
    const chunk = sliceBalancedObject(s, pos)
    if (chunk) {
      try {
        const o = JSON.parse(chunk)
        if (o && typeof o === 'object' && Array.isArray(o.items)) return o
      } catch {
        /* 尝试下一个 `{` */
      }
    }
    searchFrom = pos + 1
  }
  throw new Error('no_json_object')
}

function normalizeVenueId(row) {
  if (!row || row.id === undefined || row.id === null) return ''
  return String(row.id).trim()
}

function sanitizeItems(parsed, venuesById) {
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.items)) {
    return null
  }
  const seen = new Set()
  const out = []
  for (const row of parsed.items) {
    const id = normalizeVenueId(row)
    if (!id) continue
    const reasonRaw =
      typeof row.reason === 'string'
        ? row.reason
        : row.reason != null
          ? String(row.reason)
          : ''
    if (!reasonRaw) continue
    if (!venuesById.has(id) || seen.has(id)) continue
    seen.add(id)
    const reason = reasonRaw.trim().slice(0, 400)
    if (!reason) continue
    out.push({ id, reason })
    if (out.length >= 3) break
  }
  return out.length === 3 ? out : null
}

function buildUserPayload(body) {
  const { swipeRecords, quiz, venues } = body
  if (
    !Array.isArray(swipeRecords) ||
    !quiz ||
    typeof quiz !== 'object' ||
    !Array.isArray(venues)
  ) {
    return { error: 'INVALID_BODY', status: 400 }
  }
  if (venues.length < 3) {
    return { error: 'NEED_AT_LEAST_3_VENUES', status: 400 }
  }
  const user = JSON.stringify(
    {
      swipeRecords,
      quiz,
      candidates: venues.map((v) => ({
        id: v.id,
        name: v.name,
        categoryLine: v.categoryLine,
        tags: v.tags,
      })),
    },
    null,
    0,
  )
  return { user }
}

function upstreamApiError(data) {
  if (!data || typeof data !== 'object') return null
  const err = data.error
  if (!err) return null
  if (typeof err === 'string') return err
  return (
    err.message ||
    err.msg ||
    err.code ||
    JSON.stringify(err).slice(0, 240)
  )
}

/** OpenAI 兼容：content 可能是 string，也可能是 [{type,text}] */
function extractFromMessage(msg) {
  if (!msg || typeof msg !== 'object') return ''
  const c = msg.content
  if (typeof c === 'string' && c.trim()) return c.trim()
  if (Array.isArray(c)) {
    let acc = ''
    for (const part of c) {
      if (!part) continue
      if (typeof part === 'string') acc += part
      else if (typeof part.text === 'string') acc += part.text
      else if (part.type === 'text' && typeof part.content === 'string')
        acc += part.content
    }
    const t = acc.trim()
    if (t) return t
  }
  if (
    typeof msg.reasoning_content === 'string' &&
    msg.reasoning_content.trim()
  ) {
    return msg.reasoning_content.trim()
  }
  return ''
}

function extractFromCompletionJson(data) {
  const choices = data?.choices
  if (!Array.isArray(choices)) return ''
  for (const ch of choices) {
    const t = extractFromMessage(ch?.message)
    if (t) return t
  }
  return ''
}

function buildAuthHeaders(mode) {
  const h = { 'Content-Type': 'application/json' }
  if (mode === 'both' || mode === 'bearer') {
    h.Authorization = `Bearer ${MIMO_API_KEY}`
  }
  if (mode === 'both' || mode === 'api-key') {
    h['api-key'] = MIMO_API_KEY
  }
  return h
}

async function callMiMoOnce(userContent, { temperature }) {
  const url = `${MIMO_BASE_RAW}/chat/completions`
  const messages = [
    { role: 'system', content: SYSTEM },
    { role: 'user', content: userContent },
  ]

  const extraBodies = [
    {
      max_completion_tokens: 1200,
      temperature,
      top_p: 0.95,
      stream: false,
    },
    {
      max_tokens: 1200,
      temperature,
      top_p: 0.95,
      stream: false,
    },
  ]

  const authModes = ['both', 'api-key', 'bearer']
  let lastErr = /** @type {Error | null} */ (null)

  for (const authMode of authModes) {
    for (const extra of extraBodies) {
      const payload = {
        model: MIMO_MODEL,
        messages,
        response_format: { type: 'json_object' },
        ...extra,
      }
      let res
      let text
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: buildAuthHeaders(authMode),
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(120_000),
        })
        text = await res.text()
      } catch (e) {
        lastErr = new Error(`MIMO_FETCH: ${String(e?.message ?? e)}`)
        continue
      }

      if (!res.ok) {
        lastErr = new Error(`MIMO_${res.status}: ${text.slice(0, 500)}`)
        if (res.status >= 500) throw lastErr
        continue
      }

      let data
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error('MIMO_RESPONSE_NOT_JSON')
      }

      const apiErr = upstreamApiError(data)
      if (apiErr) {
        throw new Error(`MIMO_UPSTREAM_ERROR: ${apiErr}`)
      }

      const content = extractFromCompletionJson(data)
      if (envTrim('NODE_ENV') !== 'production') {
        console.log('\n===== MiMo RAW CONTENT =====\n')
        console.log(content)
        console.log('\n============================\n')
      }
      if (!content) {
        lastErr = new Error(
          `MIMO_EMPTY_CONTENT snippet=${text.slice(0, 220)}`,
        )
        continue
      }

      return parseRecommendItems(content)
    }
  }

  throw lastErr ?? new Error('MIMO_REQUEST_FAILED')
}

/** 首次调用失败后降低温度再试一次，减少「ID 格式漂移」导致的 MALFORMED */
async function callMiMo(userContent) {
  try {
    return await callMiMoOnce(userContent, { temperature: 0.45 })
  } catch (e1) {
    try {
      return await callMiMoOnce(userContent, { temperature: 0.2 })
    } catch {
      throw e1
    }
  }
}

/** 逗号分隔；留空则 `*`（仅适合本地）。生产请填 Vercel 域名，如 https://xxx.vercel.app */
function corsAllowOrigin(req) {
  const origin = req.headers.origin
  const raw = envTrim('ALLOWED_ORIGINS')
  if (!raw) return '*'
  const allowed = raw.split(',').map((s) => s.trim()).filter(Boolean)
  if (origin && allowed.includes(origin)) return origin
  if (!origin && allowed.length === 1) return allowed[0]
  return null
}

function corsHeaders(req) {
  const ao = corsAllowOrigin(req)
  if (!ao) {
    return {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      Vary: 'Origin',
    }
  }
  return {
    'Access-Control-Allow-Origin': ao,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
}

function json(res, status, obj, req) {
  const payload = Buffer.from(JSON.stringify(obj), 'utf8')
  const base = req ? corsHeaders(req) : {}
  res.writeHead(status, {
    ...base,
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': payload.length,
  })
  res.end(payload)
}

const server = http.createServer(async (req, res) => {
  const urlPath = req.url?.split('?')[0] ?? ''

  if (req.method === 'OPTIONS' && urlPath === '/api/recommend') {
    if (!corsAllowOrigin(req) && envTrim('ALLOWED_ORIGINS')) {
      res.writeHead(403, corsHeaders(req))
      res.end()
      return
    }
    res.writeHead(204, corsHeaders(req))
    res.end()
    return
  }

  if (req.method === 'GET' && urlPath === '/health') {
    json(
      res,
      200,
      { ok: true, service: 'paipa-api', ts: Date.now() },
      req,
    )
    return
  }

  if (req.method !== 'POST' || urlPath !== '/api/recommend') {
    res.writeHead(404, req ? corsHeaders(req) : {})
    res.end()
    return
  }

  if (!corsAllowOrigin(req) && envTrim('ALLOWED_ORIGINS')) {
    json(res, 403, { ok: false, error: 'CORS_ORIGIN_NOT_ALLOWED' }, req)
    return
  }

  let body = ''
  for await (const chunk of req) body += chunk
  let parsedBody
  try {
    parsedBody = JSON.parse(body || '{}')
  } catch {
    json(res, 400, { ok: false, error: 'INVALID_JSON' }, req)
    return
  }

  const built = buildUserPayload(parsedBody)
  if ('error' in built) {
    json(res, built.status ?? 400, { ok: false, error: built.error }, req)
    return
  }

  const venuesById = new Map()
  for (const v of parsedBody.venues) {
    if (v && v.id !== undefined && v.id !== '') {
      venuesById.set(String(v.id), v)
    }
  }

  if (!MIMO_API_KEY) {
    json(res, 200, { ok: false, error: 'MISSING_API_KEY' }, req)
    return
  }

  try {
    let rawItems = await callMiMo(built.user)
    let items = sanitizeItems(rawItems, venuesById)
    if (!items) {
      rawItems = await callMiMo(
        `${built.user}\n\n【再次强调】每条 item 的 id 必须是候选 JSON 里某个对象的 id 字段的完全一致字符串（区分大小写），不要加空格或改写。`,
      )
      items = sanitizeItems(rawItems, venuesById)
    }
    if (!items) {
      json(
        res,
        200,
        {
          ok: false,
          error: 'MALFORMED_MODEL_OUTPUT',
        },
        req,
      )
      return
    }
    json(res, 200, { ok: true, items }, req)
  } catch (e) {
    json(
      res,
      200,
      {
        ok: false,
        error: 'MIMO_FAILED',
        message: String((e)?.message ?? e),
      },
      req,
    )
  }
})

server.listen(PORT, LISTEN_HOST, () => {
  console.info(
    `[recommend-api] listening http://${LISTEN_HOST}:${PORT} | POST /api/recommend | MiMo ${MIMO_API_KEY ? 'key=***' : 'NO_KEY（前端将走本地规则）'}`,
  )
  console.info(`[recommend-api] 上游 ${MIMO_BASE_RAW} model=${MIMO_MODEL}`)
  if (envTrim('ALLOWED_ORIGINS')) {
    console.info(`[recommend-api] CORS ALLOWED_ORIGINS=${envTrim('ALLOWED_ORIGINS')}`)
  }
})

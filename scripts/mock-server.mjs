/**
 * 本地开发模拟后端（内存存储）
 * 用途：本地验证 /api/rsvp、/api/wall、/wall/:id 交互（含增删改）
 * 运行：node scripts/mock-server.mjs [port]
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const PORT = Number(process.argv[2] || 8788)

/** 内存 KV */
const kv = new Map()
let seq = 0

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon'
}

function json(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  })
  res.end(JSON.stringify(data))
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

function seedDemo() {
  const now = Date.now()
  const days = [0, 0, 1, 2, 3, 5]
  days.forEach((offset, i) => {
    const id = `seed-rsvp-${i + 1}`
    const t = new Date(now - offset * 86400000).toISOString()
    kv.set(
      `rsvp:${id}`,
      JSON.stringify({
        id,
        name: ['阿宁', '小林', '老张', '小美', '阿杰', '圆圆'][i],
        phone: `1380000${1000 + i}`,
        num: String([1, 2, 2, 3, 4, 1][i]),
        attend: i === 4 ? 'no' : 'yes',
        msg: ['新婚快乐！', '早生贵子', '百年好合', '幸福美满', '抱歉无法到场', '婚礼见！'][i],
        time: t
      })
    )
  })

  // 1x1 jpeg
  const tiny =
    '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGcP//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEABj8Cf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8hf//Z'
  for (let i = 0; i < 4; i++) {
    const id = `seed-wall-${i + 1}`
    const createdAt = new Date(now - i * 86400000).toISOString()
    kv.set(
      `wall:${id}`,
      JSON.stringify({
        id,
        name: ['宾客A', '宾客B', '宾客C', '宾客D'][i],
        caption: ['仪式瞬间', '合影', '花房', '泳池'][i],
        width: 8,
        height: 8,
        likes: [3, 1, 5, 0][i],
        mime: 'image/jpeg',
        createdAt
      })
    )
    kv.set(`wallimg:${id}`, tiny)
  }
}

seedDemo()

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const { pathname } = url

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    })
    return res.end()
  }

  /* ---------- API: RSVP ---------- */
  const rsvpItem = pathname.match(/^\/api\/rsvp\/([^/]+)$/)
  if (rsvpItem) {
    const id = decodeURIComponent(rsvpItem[1])
    const key = `rsvp:${id}`
    if (req.method === 'PUT') {
      const body = await readBody(req)
      const prev = kv.has(key) ? JSON.parse(kv.get(key)) : null
      if (!prev) return json(res, { ok: false, error: '记录不存在' }, 404)
      if (body.name != null && !String(body.name).trim()) {
        return json(res, { ok: false, error: '缺少姓名' }, 400)
      }
      const record = {
        ...prev,
        ...body,
        id,
        name: (body.name ?? prev.name).toString().trim().slice(0, 40),
        attend: (body.attend ?? prev.attend) === 'no' ? 'no' : 'yes'
      }
      kv.set(key, JSON.stringify(record))
      return json(res, { ok: true, id })
    }
    if (req.method === 'DELETE') {
      kv.delete(key)
      return json(res, { ok: true, id })
    }
    return json(res, { ok: false, error: 'Method Not Allowed' }, 405)
  }

  if (pathname === '/api/rsvp' && req.method === 'GET') {
    const nameFilter = (url.searchParams.get('name') || '').trim()
    const items = [...kv.entries()]
      .filter(([k]) => k.startsWith('rsvp:'))
      .map(([, v]) => JSON.parse(v))
      .filter((r) => !nameFilter || (r.name || '').trim() === nameFilter)
      .sort((a, b) => String(b.time || '').localeCompare(String(a.time || '')))
    return json(res, items)
  }
  if (pathname === '/api/rsvp' && req.method === 'POST') {
    const body = await readBody(req)
    if (!body.name?.trim()) return json(res, { ok: false, error: '缺少姓名' }, 400)
    const id = `mock-${Date.now()}-${++seq}`
    const record = {
      id,
      name: body.name.trim().slice(0, 40),
      phone: (body.phone ?? '').toString().slice(0, 30),
      num: (body.num ?? '').toString().slice(0, 10),
      attend: body.attend === 'no' ? 'no' : 'yes',
      msg: (body.msg ?? '').toString().slice(0, 300),
      time: body.time || new Date().toISOString()
    }
    kv.set(`rsvp:${id}`, JSON.stringify(record))
    return json(res, { ok: true, id })
  }

  /* ---------- API: 图片墙 ---------- */
  const wallLike = pathname.match(/^\/api\/wall\/([^/]+)\/like$/)
  if (wallLike) {
    const id = decodeURIComponent(wallLike[1])
    const key = `wall:${id}`
    if (req.method === 'POST') {
      const prev = kv.has(key) ? JSON.parse(kv.get(key)) : null
      if (!prev) return json(res, { ok: false, error: '记录不存在' }, 404)
      const likes = Math.max(0, Number(prev.likes) || 0) + 1
      kv.set(key, JSON.stringify({ ...prev, likes }))
      return json(res, { ok: true, id, likes })
    }
    return json(res, { ok: false, error: 'Method Not Allowed' }, 405)
  }

  const wallItem = pathname.match(/^\/api\/wall\/([^/]+)$/)
  if (wallItem) {
    const id = decodeURIComponent(wallItem[1])
    const key = `wall:${id}`
    if (req.method === 'PUT') {
      const body = await readBody(req)
      const prev = kv.has(key) ? JSON.parse(kv.get(key)) : null
      if (!prev) return json(res, { ok: false, error: '记录不存在' }, 404)
      const name = (body.name ?? prev.name).toString().trim().slice(0, 20)
      if (!name) return json(res, { ok: false, error: '缺少昵称' }, 400)
      const meta = {
        ...prev,
        name,
        caption:
          body.caption != null ? String(body.caption).trim().slice(0, 60) : prev.caption,
        width: body.width || prev.width,
        height: body.height || prev.height
      }
      if (typeof body.image === 'string' && body.image.startsWith('data:image')) {
        const [header, b64] = body.image.split(',')
        meta.mime = header.replace('data:', '').replace(';base64', '') || 'image/jpeg'
        kv.set(`wallimg:${id}`, b64)
      }
      kv.set(key, JSON.stringify(meta))
      return json(res, { ok: true, id })
    }
    if (req.method === 'DELETE') {
      kv.delete(key)
      kv.delete(`wallimg:${id}`)
      return json(res, { ok: true, id })
    }
    return json(res, { ok: false, error: 'Method Not Allowed' }, 405)
  }

  if (pathname === '/api/wall' && req.method === 'GET') {
    const items = [...kv.entries()]
      .filter(([k]) => k.startsWith('wall:'))
      .map(([, v]) => {
        const m = JSON.parse(v)
        return {
          id: m.id,
          name: m.name,
          caption: m.caption,
          url: `/wall/${m.id}`,
          width: m.width,
          height: m.height,
          likes: Math.max(0, Number(m.likes) || 0),
          createdAt: m.createdAt
        }
      })
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
    return json(res, items)
  }
  if (pathname === '/api/wall' && req.method === 'POST') {
    const body = await readBody(req)
    if (!body.name?.trim() || typeof body.image !== 'string' || !body.image.startsWith('data:image')) {
      return json(res, { ok: false, error: '参数不合法' }, 400)
    }
    const [header, b64] = body.image.split(',')
    const mime = header.replace('data:', '').replace(';base64', '') || 'image/jpeg'
    const id = `mock-${Date.now()}-${++seq}`
    const meta = {
      id,
      name: body.name.trim().slice(0, 20),
      caption: (body.caption ?? '').trim().slice(0, 60),
      width: body.width || 1280,
      height: body.height || 853,
      likes: 0,
      mime,
      createdAt: new Date().toISOString()
    }
    kv.set(`wall:${id}`, JSON.stringify(meta))
    kv.set(`wallimg:${id}`, b64)
    return json(res, { ok: true, id })
  }

  /* ---------- 图片读取 ---------- */
  const wallMatch = pathname.match(/^\/wall\/(.+)$/)
  if (wallMatch && req.method === 'GET') {
    const id = decodeURIComponent(wallMatch[1])
    const meta = kv.get(`wall:${id}`)
    const b64 = kv.get(`wallimg:${id}`)
    if (!meta || !b64) {
      res.writeHead(404)
      return res.end('Not Found')
    }
    const m = JSON.parse(meta)
    const buf = Buffer.from(b64, 'base64')
    res.writeHead(200, {
      'Content-Type': m.mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*'
    })
    return res.end(buf)
  }

  /* ---------- 静态文件 ---------- */
  if (!fs.existsSync(DIST)) {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' })
    return res.end('dist 不存在，请先 pnpm build')
  }
  const decoded = decodeURIComponent(pathname)
  let filePath = path.join(DIST, decoded === '/' ? 'index.html' : decoded)
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html') // SPA fallback
  }
  if (!filePath.startsWith(DIST)) {
    res.writeHead(403)
    return res.end('Forbidden')
  }
  const ext = path.extname(filePath).toLowerCase()
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
  fs.createReadStream(filePath).pipe(res)
})

server.listen(PORT, () => {
  console.log(`[mock-server] http://localhost:${PORT}  (本地模拟 API)`)
})

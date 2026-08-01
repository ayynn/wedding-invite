/**
 * 本地开发模拟后端（模拟 Cloudflare Pages Functions + KV）
 * 用途：在无 Cloudflare 环境时本地验证 /api/rsvp、/api/wall、/wall/:id 交互
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
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(data))
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const { pathname } = url

  /* ---------- API: RSVP ---------- */
  if (pathname === '/api/rsvp' && req.method === 'GET') {
    const items = [...kv.entries()]
      .filter(([k]) => k.startsWith('rsvp:'))
      .map(([, v]) => JSON.parse(v))
    return json(res, items)
  }
  if (pathname === '/api/rsvp' && req.method === 'POST') {
    const body = await readBody(req)
    if (!body.name?.trim()) return json(res, { ok: false, error: '缺少姓名' }, 400)
    const id = `mock-${Date.now()}-${++seq}`
    const record = { id, ...body, time: new Date().toISOString() }
    kv.set(`rsvp:${id}`, JSON.stringify(record))
    return json(res, { ok: true, id })
  }

  /* ---------- API: 图片墙 ---------- */
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
          createdAt: m.createdAt
        }
      })
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
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
      'Cache-Control': 'public, max-age=31536000, immutable'
    })
    return res.end(buf)
  }

  /* ---------- 静态文件 ---------- */
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
  console.log(`[mock-server] http://localhost:${PORT}  (模拟 Cloudflare Pages + KV)`)
})

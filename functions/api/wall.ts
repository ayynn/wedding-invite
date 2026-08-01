import type { PagesFunction } from '@cloudflare/workers-types'
import { json, KEYS, type Env } from '../_lib'

interface WallMeta {
  id: string
  name: string
  caption: string
  width: number
  height: number
  mime: string
  createdAt: string
}

interface WallRecord extends WallMeta {
  data: string
}

const MAX_IMG_BYTES = 3 * 1024 * 1024 // 3MB，前端已压缩至 ~1MB 内

/** GET /api/wall —— 图片墙列表（仅元数据，图片走 /wall/:id） */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { WEDDING_KV } = context.env
  const list = await WEDDING_KV.list({ prefix: KEYS.wallMeta })
  const items = await Promise.all(
    list.keys.map(async (k) => {
      const raw = await WEDDING_KV.get(k.name)
      if (!raw) return null
      try {
        const meta = JSON.parse(raw) as WallMeta
        return {
          id: meta.id,
          name: meta.name,
          caption: meta.caption,
          url: `/wall/${meta.id}`,
          width: meta.width,
          height: meta.height,
          createdAt: meta.createdAt
        }
      } catch {
        return null
      }
    })
  )
  return json(items.filter(Boolean))
}

/** POST /api/wall —— 上传图片 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { WEDDING_KV } = context.env
  const body = (await context.request.json().catch(() => null)) as {
    name?: string
    caption?: string
    image?: string
    width?: number
    height?: number
  } | null

  if (!body || typeof body.name !== 'string' || !body.name.trim()) {
    return json({ ok: false, error: '缺少昵称' }, 400)
  }
  if (typeof body.image !== 'string' || !body.image.startsWith('data:image')) {
    return json({ ok: false, error: '缺少图片数据' }, 400)
  }

  const [header, b64] = body.image.split(',')
  const mime = header.replace('data:', '').replace(';base64', '') || 'image/jpeg'
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mime)) {
    return json({ ok: false, error: '仅支持 JPG / PNG / WebP' }, 400)
  }
  // base64 长度 → 字节数近似
  if (Math.round(b64.length * 0.75) > MAX_IMG_BYTES) {
    return json({ ok: false, error: '图片过大' }, 400)
  }

  const id = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
  const createdAt = new Date().toISOString()
  const meta: WallMeta = {
    id,
    name: body.name.trim().slice(0, 20),
    caption: (body.caption ?? '').trim().slice(0, 60),
    width: Math.max(1, Math.round(body.width ?? 1280)),
    height: Math.max(1, Math.round(body.height ?? 853)),
    mime,
    createdAt
  }
  // 图片数据与元数据分键存储：列表读取不加载图片体积
  await WEDDING_KV.put(`${KEYS.wallMeta}${id}`, JSON.stringify(meta))
  await WEDDING_KV.put(`${KEYS.wallImg}${id}`, b64)
  return json({ ok: true, id })
}

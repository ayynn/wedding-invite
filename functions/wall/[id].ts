import type { PagesFunction } from '@cloudflare/workers-types'
import { base64ToBytes, KEYS, type Env } from '../_lib'

/** GET /wall/:id —— 读取图片（KV → 二进制响应，浏览器可直接 <img> 引用） */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { WEDDING_KV } = context.env
  const id = context.params.id as string

  const metaRaw = await WEDDING_KV.get(`${KEYS.wallMeta}${id}`)
  if (!metaRaw) {
    return new Response('Not Found', { status: 404 })
  }
  const meta = JSON.parse(metaRaw) as { mime: string }
  const b64 = await WEDDING_KV.get(`${KEYS.wallImg}${id}`)
  if (!b64) {
    return new Response('Not Found', { status: 404 })
  }

  return new Response(base64ToBytes(b64), {
    headers: {
      'Content-Type': meta.mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*'
    }
  })
}

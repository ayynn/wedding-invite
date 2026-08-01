import type { PagesFunction } from '@cloudflare/workers-types'
import { json, KEYS, type Env } from '../_lib'

interface RsvpRecord {
  id: string
  name: string
  phone: string
  num: string
  attend: 'yes' | 'no'
  msg: string
  time: string
}

/** GET /api/rsvp —— 获取全部 RSVP */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { WEDDING_KV } = context.env
  const list = await WEDDING_KV.list({ prefix: KEYS.rsvp })
  const records = await Promise.all(
    list.keys.map(async (k) => {
      const raw = await WEDDING_KV.get(k.name)
      if (!raw) return null
      try {
        return JSON.parse(raw) as RsvpRecord
      } catch {
        return null
      }
    })
  )
  return json(records.filter(Boolean))
}

/** POST /api/rsvp —— 新增 RSVP */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { WEDDING_KV } = context.env
  const body = (await context.request.json().catch(() => null)) as Partial<RsvpRecord> | null
  if (!body || typeof body.name !== 'string' || !body.name.trim()) {
    return json({ ok: false, error: '缺少姓名' }, 400)
  }
  const id = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
  const record: RsvpRecord = {
    id,
    name: body.name.trim().slice(0, 40),
    phone: (body.phone ?? '').toString().slice(0, 30),
    num: (body.num ?? '').toString().slice(0, 10),
    attend: body.attend === 'no' ? 'no' : 'yes',
    msg: (body.msg ?? '').toString().slice(0, 300),
    time: body.time ?? new Date().toISOString()
  }
  await WEDDING_KV.put(`${KEYS.rsvp}${id}`, JSON.stringify(record))
  return json({ ok: true, id })
}

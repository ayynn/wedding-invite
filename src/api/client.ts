import type { RsvpPayload, WallItem, WallUploadPayload } from '@/types'

export type RsvpRecord = RsvpPayload & { id?: string }

const isOk = (r: Response): boolean => r.ok

/** 通用 JSON 请求 */
async function jsonRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init
  })
  if (!isOk(res)) {
    const text = await res.text().catch(() => '')
    throw new Error(`请求失败(${res.status}): ${text.slice(0, 120)}`)
  }
  return (await res.json()) as T
}

/** 提交 RSVP */
export function submitRsvp(endpoint: string, payload: RsvpPayload): Promise<{ ok: boolean; id?: string }> {
  return jsonRequest(endpoint, { method: 'POST', body: JSON.stringify(payload) })
}

/** 获取登记列表 */
export function fetchRsvpList(endpoint: string): Promise<RsvpRecord[]> {
  return jsonRequest<RsvpRecord[]>(endpoint)
}

/** 按姓名查找已登记人员（同名检查） */
export function lookupRsvpByName(endpoint: string, name: string): Promise<RsvpRecord[]> {
  const url = `${endpoint}?name=${encodeURIComponent(name.trim())}`
  return jsonRequest<RsvpRecord[]>(url)
}

/** 更新登记 */
export function updateRsvp(
  endpoint: string,
  id: string,
  payload: Partial<RsvpPayload>
): Promise<{ ok: boolean }> {
  return jsonRequest(`${endpoint}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
}

/** 删除登记 */
export function deleteRsvp(endpoint: string, id: string): Promise<{ ok: boolean }> {
  return jsonRequest(`${endpoint}/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

/** 批量删除登记 */
export async function deleteRsvpBatch(endpoint: string, ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => deleteRsvp(endpoint, id)))
}

/** 获取图片墙列表 */
export async function fetchWall(endpoint: string): Promise<WallItem[]> {
  return jsonRequest<WallItem[]>(endpoint)
}

/**
 * 上传图片到图片墙
 * CloudBase 对 application/json 请求体限制约 100KB；
 * 图片 base64 必须用 octet-stream（非文本通道，上限约 6MB）。
 */
export async function uploadWall(
  endpoint: string,
  payload: WallUploadPayload
): Promise<{ ok: boolean; id?: string }> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: JSON.stringify(payload)
  })
  if (!isOk(res)) {
    const text = await res.text().catch(() => '')
    throw new Error(`请求失败(${res.status}): ${text.slice(0, 120)}`)
  }
  return (await res.json()) as { ok: boolean; id?: string }
}

/** 更新图片墙元信息（昵称/文案，可选换图） */
export async function updateWall(
  endpoint: string,
  id: string,
  payload: Partial<WallUploadPayload>
): Promise<{ ok: boolean }> {
  const hasImage = typeof payload.image === 'string' && payload.image.startsWith('data:image')
  const res = await fetch(`${endpoint}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': hasImage ? 'application/octet-stream' : 'application/json'
    },
    body: JSON.stringify(payload)
  })
  if (!isOk(res)) {
    const text = await res.text().catch(() => '')
    throw new Error(`请求失败(${res.status}): ${text.slice(0, 120)}`)
  }
  return (await res.json()) as { ok: boolean }
}

/** 删除图片墙条目 */
export function deleteWall(endpoint: string, id: string): Promise<{ ok: boolean }> {
  return jsonRequest(`${endpoint}/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

/** 批量删除图片墙条目 */
export async function deleteWallBatch(endpoint: string, ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => deleteWall(endpoint, id)))
}

/** 给图片墙点赞 */
export function likeWall(
  endpoint: string,
  id: string
): Promise<{ ok: boolean; likes: number }> {
  return jsonRequest(`${endpoint}/${encodeURIComponent(id)}/like`, { method: 'POST', body: '{}' })
}

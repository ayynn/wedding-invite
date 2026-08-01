import type { RsvpPayload, WallItem, WallUploadPayload } from '@/types'

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

/** 获取图片墙列表 */
export async function fetchWall(endpoint: string): Promise<WallItem[]> {
  return jsonRequest<WallItem[]>(endpoint)
}

/** 上传图片到图片墙 */
export function uploadWall(endpoint: string, payload: WallUploadPayload): Promise<{ ok: boolean; id?: string }> {
  return jsonRequest(endpoint, { method: 'POST', body: JSON.stringify(payload) })
}

/**
 * Cloudflare Pages Functions 共享环境类型
 * 部署前需在 wrangler.toml 中配置 KV namespace（见 README）
 */
export interface Env {
  /** KV 命名空间：RSVP 与图片墙数据 */
  WEDDING_KV: KVNamespace
}

/** KV 键前缀 */
export const KEYS = {
  rsvp: 'rsvp:',
  wallMeta: 'wall:',
  wallImg: 'wallimg:'
} as const

/** 统一 JSON 响应 */
export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  })
}

/** base64 → Uint8Array */
export function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

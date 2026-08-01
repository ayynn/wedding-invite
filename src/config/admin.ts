/** 后台本地验证配置（前端硬编码，无服务端鉴权） */
export const ADMIN_CREDENTIALS = {
  username: '916631729',
  password: '2026-10-18'
} as const

/** 封面隐藏入口：新郎名改为该值并保持满 10 秒即可进入登录页 */
export const ADMIN_SECRET_NAME = '长安新郎'
export const ADMIN_SECRET_HOLD_MS = 10_000

export const ADMIN_SESSION_KEY = 'wedding_admin_session'

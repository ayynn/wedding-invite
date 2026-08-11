/** 将跨域网页字体嵌入为 data URL，供 modern-screenshot 长图导出使用 */

const GOOGLE_FONT_CSS =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Great+Vibes&family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@300;400;500;600&display=swap'

const WENKAI_CSS =
  'https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/lxgwwenkai-regular.css'

/** Google Fonts text= 参数过长会被截断，按字符分片请求 */
const GOOGLE_TEXT_CHUNK = 90

const cache = new Map<string, string>()

function collectPageText(root: HTMLElement): string {
  const raw = `${root.innerText || ''}${document.title || ''}`
  // 去重字符，保留导出所需字形
  return [...new Set(raw.replace(/\s+/g, ''))].join('')
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error('read failed'))
    reader.readAsDataURL(blob)
  })
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { mode: 'cors', credentials: 'omit', cache: 'force-cache' })
  if (!res.ok) throw new Error(`字体 CSS 拉取失败: ${res.status}`)
  return await res.text()
}

async function urlToDataUrl(url: string, base?: string): Promise<string> {
  const abs = new URL(url, base).href
  const res = await fetch(abs, { mode: 'cors', credentials: 'omit', cache: 'force-cache' })
  if (!res.ok) throw new Error(`字体文件拉取失败: ${res.status}`)
  return await blobToDataUrl(await res.blob())
}

async function embedCssUrls(cssText: string, baseUrl: string): Promise<string> {
  const re = /url\((['"]?)([^'")]+)\1\)/g
  const jobs: Array<Promise<void>> = []
  const map = new Map<string, string>()

  for (const match of cssText.matchAll(re)) {
    const raw = match[2]
    if (!raw || raw.startsWith('data:')) continue
    if (map.has(raw)) continue
    map.set(raw, '')
    jobs.push(
      urlToDataUrl(raw, baseUrl)
        .then((dataUrl) => {
          map.set(raw, dataUrl)
        })
        .catch((err) => {
          console.warn('[embedFonts] skip', raw, err)
          map.delete(raw)
        })
    )
  }

  await Promise.all(jobs)

  return cssText.replace(re, (full, quote: string, raw: string) => {
    const data = map.get(raw)
    if (!data) return full
    return `url(${quote || ''}${data}${quote || ''})`
  })
}

/** 解析 unicode-range，判断是否覆盖页面用字 */
function rangeCoversText(rangeDecl: string, text: string): boolean {
  if (!rangeDecl) return true
  const cps = [...text].map((ch) => ch.codePointAt(0) || 0)
  const parts = rangeDecl.split(',').map((s) => s.trim())
  for (const part of parts) {
    const m = part.match(/^U\+([0-9A-Fa-f]+)(?:-([0-9A-Fa-f]+))?$/)
    if (!m) continue
    const from = parseInt(m[1], 16)
    const to = m[2] ? parseInt(m[2], 16) : from
    if (cps.some((cp) => cp >= from && cp <= to)) return true
  }
  return false
}

/** 只保留与页面文字有交集的 @font-face（文楷子集很多） */
function filterFontFacesByText(cssText: string, text: string): string {
  const blocks = cssText.split('@font-face').slice(1)
  const kept: string[] = []
  for (const block of blocks) {
    const body = `@font-face${block}`
    const rangeMatch = body.match(/unicode-range\s*:\s*([^;]+);/i)
    const range = rangeMatch?.[1]?.trim() || ''
    if (!range || rangeCoversText(range, text)) kept.push(body.trim())
  }
  return kept.join('\n\n')
}

async function fetchGoogleFontCss(text: string): Promise<string> {
  const chars = text || '婚礼邀请'
  const chunks: string[] = []
  for (let i = 0; i < chars.length; i += GOOGLE_TEXT_CHUNK) {
    chunks.push(chars.slice(i, i + GOOGLE_TEXT_CHUNK))
  }
  const parts = await Promise.all(
    chunks.map((chunk) => fetchText(`${GOOGLE_FONT_CSS}&text=${encodeURIComponent(chunk)}`))
  )
  return parts.join('\n')
}

/**
 * 生成可嵌入 SVG foreignObject 的 @font-face CSS（data URL）。
 * Google 字体用 text= 子集；文楷按 unicode-range 过滤后再嵌入。
 */
export async function buildEmbeddedFontCss(root: HTMLElement): Promise<string> {
  const text = collectPageText(root)
  const cacheKey = text
  const hit = cache.get(cacheKey)
  if (hit) return hit

  const [googleCss, wenkaiCss] = await Promise.all([
    fetchGoogleFontCss(text),
    fetchText(WENKAI_CSS).catch((err) => {
      console.warn('[embedFonts] WenKai CSS failed', err)
      return ''
    })
  ])

  const filteredWenkai = wenkaiCss ? filterFontFacesByText(wenkaiCss, text) : ''
  const [embeddedGoogle, embeddedWenkai] = await Promise.all([
    embedCssUrls(googleCss, 'https://fonts.googleapis.com/'),
    filteredWenkai ? embedCssUrls(filteredWenkai, WENKAI_CSS) : Promise.resolve('')
  ])

  const css = [embeddedGoogle, embeddedWenkai].filter(Boolean).join('\n\n')
  cache.set(cacheKey, css)
  return css
}

/** 导出前尽量确保页面字体已就绪 */
export async function ensureInviteFontsReady(): Promise<void> {
  try {
    await document.fonts.ready
    const families = [
      '400 16px "Noto Serif SC"',
      '400 16px "Ma Shan Zheng"',
      '400 16px "LXGW WenKai"',
      '400 24px "Great Vibes"',
      '400 20px "Cormorant Garamond"',
      '600 20px "Cormorant Garamond"'
    ]
    await Promise.all(families.map((f) => document.fonts.load(f).catch(() => undefined)))
  } catch {
    /* ignore */
  }
}

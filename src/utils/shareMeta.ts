import { weddingConfig } from '@/config/wedding'

function absUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  const base = weddingConfig.share.url.replace(/\/$/, '')
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return `${base}${path}`
}

function upsertMeta(
  attr: 'property' | 'name' | 'itemprop',
  key: string,
  content: string
): void {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/**
 * 将 weddingConfig.share 同步到 document meta。
 *
 * 说明：微信「··· → 发送给朋友 / 朋友圈」的卡片图，主要来自微信爬虫抓取
 * 页面 HTML 时的 og:image 等标签（见 index.html 静态 meta）。
 * 本函数可在 SPA 运行时保持 meta 与配置一致，便于调试与其它平台预览；
 * 若要在微信内已打开页面后由 JS 强制改写分享卡片，需公众号 appId +
 * wx.config 签名与 updateAppMessageShareData / updateTimelineShareData（本项目未接入）。
 */
export function applyShareMeta(): void {
  if (typeof document === 'undefined') return

  const { share } = weddingConfig
  const image = absUrl(share.image)
  const url = share.url

  document.title = share.title

  upsertMeta('name', 'description', share.text)
  upsertMeta('property', 'og:type', 'website')
  upsertMeta('property', 'og:url', url)
  upsertMeta('property', 'og:title', share.title)
  upsertMeta('property', 'og:description', share.text)
  upsertMeta('property', 'og:image', image)
  upsertMeta('property', 'og:image:width', '800')
  upsertMeta('property', 'og:image:height', '800')
  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', share.title)
  upsertMeta('name', 'twitter:description', share.text)
  upsertMeta('name', 'twitter:image', image)
  upsertMeta('itemprop', 'name', share.title)
  upsertMeta('itemprop', 'description', share.text)
  upsertMeta('itemprop', 'image', image)
}

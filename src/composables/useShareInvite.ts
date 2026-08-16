import { ref } from 'vue'

export interface ShareInviteOptions {
  url: string
  title: string
  text: string
}

export function isWeChatBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  return /MicroMessenger/i.test(navigator.userAgent)
}

export function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through */
  }

  try {
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    return ok
  } catch {
    return false
  }
}

/**
 * 婚礼邀请分享：
 * - 微信内：展示右上角菜单引导（无 JS-SDK 时无法调起原生分享）
 * - 站外：优先 Web Share API，否则复制链接 / 展示二维码卡片
 *
 * 分享卡片缩略图：微信爬虫读页面 og:image 等 meta（见 index.html / weddingConfig.share.image）。
 * 若需在微信内打开后由 JS 定制 updateAppMessageShareData，须接入公众号 JS-SDK（appId + 后端签名）。
 */
export function useShareInvite(options: ShareInviteOptions) {
  const showWeChatTip = ref(false)
  const showFallback = ref(false)
  const copyOk = ref(false)
  let copyTimer: number | undefined

  function closeAll(): void {
    showWeChatTip.value = false
    showFallback.value = false
  }

  async function copyLink(): Promise<boolean> {
    const ok = await copyText(options.url)
    copyOk.value = ok
    window.clearTimeout(copyTimer)
    copyTimer = window.setTimeout(() => {
      copyOk.value = false
    }, 2200)
    return ok
  }

  async function share(): Promise<void> {
    if (isWeChatBrowser()) {
      showFallback.value = false
      showWeChatTip.value = true
      return
    }

    if (canNativeShare()) {
      try {
        await navigator.share({
          title: options.title,
          text: options.text,
          url: options.url
        })
        return
      } catch (err) {
        // 用户取消不打断；其它失败走备用面板
        if (err instanceof DOMException && err.name === 'AbortError') return
      }
    }

    showWeChatTip.value = false
    showFallback.value = true
  }

  return {
    showWeChatTip,
    showFallback,
    copyOk,
    share,
    copyLink,
    closeAll,
    isWeChat: isWeChatBrowser
  }
}

import { nextTick, ref, type Ref } from 'vue'
import { domToJpeg } from 'modern-screenshot'
import { buildEmbeddedFontCss, ensureInviteFontsReady } from '@/utils/embedFonts'

export interface ExportInviteImageOptions {
  /** 截图根节点（封面 + 正文） */
  root: Ref<HTMLElement | null>
  /** 是否已打开请柬；未打开时先打开再截 */
  opened: Ref<boolean>
  openInvite: () => void
  /** 文件名 */
  fileName?: string
}

async function waitImages(root: HTMLElement): Promise<void> {
  const imgs = [...root.querySelectorAll('img')]
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve()
            return
          }
          const done = () => resolve()
          img.addEventListener('load', done, { once: true })
          img.addEventListener('error', done, { once: true })
          window.setTimeout(done, 4000)
        })
    )
  )
}

function forceRevealVisible(root: HTMLElement): void {
  root.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'))
}

function downloadDataUrl(dataUrl: string, fileName: string): void {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = fileName
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
}

/** 截图前写入内联样式，避免克隆时丢失导出态布局 */
function prepareExportStyles(root: HTMLElement, restoreCoverLeaving: boolean): () => void {
  const restores: Array<() => void> = []

  const patch = (el: HTMLElement, styles: Partial<CSSStyleDeclaration>) => {
    const prev: Array<[string, string]> = []
    for (const [key, value] of Object.entries(styles)) {
      if (value == null) continue
      const cssKey = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
      prev.push([cssKey, el.style.getPropertyValue(cssKey)])
      el.style.setProperty(cssKey, String(value), 'important')
    }
    restores.push(() => {
      for (const [cssKey, old] of prev) {
        if (old) el.style.setProperty(cssKey, old)
        else el.style.removeProperty(cssKey)
      }
    })
  }

  const cover = root.querySelector('.cover') as HTMLElement | null
  if (cover) {
    const h = Math.max(window.innerHeight, 640)
    const hadLeaving = cover.classList.contains('leaving')
    // 先关掉离开动画，否则 transform/opacity 仍处在过渡中间态
    patch(cover, {
      transition: 'none',
      animation: 'none',
      position: 'relative',
      inset: 'auto',
      top: 'auto',
      left: 'auto',
      right: 'auto',
      bottom: 'auto',
      transform: 'translateY(0)',
      opacity: '1',
      minHeight: `${h}px`,
      height: `${h}px`,
      zIndex: '1',
      pointerEvents: 'none',
      overflow: 'hidden'
    })
    cover.classList.remove('leaving')
    restores.push(() => {
      if (restoreCoverLeaving || hadLeaving) cover.classList.add('leaving')
    })
  }

  root.querySelectorAll<HTMLElement>('.gold-text').forEach((el) => {
    const prevBg = el.style.getPropertyValue('background')
    const prevClip = el.style.getPropertyValue('background-clip')
    const prevWebkitClip = el.style.getPropertyValue('-webkit-background-clip')
    const prevFill = el.style.getPropertyValue('-webkit-text-fill-color')
    const prevColor = el.style.getPropertyValue('color')
    const prevFilter = el.style.getPropertyValue('filter')
    el.style.setProperty('background', 'none', 'important')
    el.style.setProperty('background-clip', 'border-box', 'important')
    el.style.setProperty('-webkit-background-clip', 'border-box', 'important')
    el.style.setProperty('-webkit-text-fill-color', '#e8c98a', 'important')
    el.style.setProperty('color', '#e8c98a', 'important')
    el.style.setProperty('filter', 'none', 'important')
    restores.push(() => {
      if (prevBg) el.style.setProperty('background', prevBg)
      else el.style.removeProperty('background')
      if (prevClip) el.style.setProperty('background-clip', prevClip)
      else el.style.removeProperty('background-clip')
      if (prevWebkitClip) el.style.setProperty('-webkit-background-clip', prevWebkitClip)
      else el.style.removeProperty('-webkit-background-clip')
      if (prevFill) el.style.setProperty('-webkit-text-fill-color', prevFill)
      else el.style.removeProperty('-webkit-text-fill-color')
      if (prevColor) el.style.setProperty('color', prevColor)
      else el.style.removeProperty('color')
      if (prevFilter) el.style.setProperty('filter', prevFilter)
      else el.style.removeProperty('filter')
    })
  })

  root.querySelectorAll<HTMLElement>('.cover-ring, .fv').forEach((el) => {
    patch(el, { animation: 'none' })
  })

  return () => {
    while (restores.length) restores.pop()?.()
  }
}

/**
 * 将请柬导出为静态长图：进入导出模式 → 截图 → 预览/下载。
 */
export function useExportInviteImage(options: ExportInviteImageOptions) {
  const exporting = ref(false)
  const previewUrl = ref('')
  const error = ref('')
  const showPreview = ref(false)

  function closePreview(): void {
    showPreview.value = false
    previewUrl.value = ''
    error.value = ''
  }

  function saveImage(): void {
    if (!previewUrl.value) return
    const name = options.fileName || '婚礼邀请函.jpg'
    downloadDataUrl(previewUrl.value, name)
  }

  async function exportImage(): Promise<void> {
    if (exporting.value) return
    error.value = ''
    exporting.value = true

    const prevScrollX = window.scrollX
    const prevScrollY = window.scrollY
    let restoreStyles: (() => void) | null = null

    try {
      if (!options.opened.value) {
        options.openInvite()
        await new Promise((r) => window.setTimeout(r, 500))
      }

      await nextTick()
      const root = options.root.value
      if (!root) throw new Error('未找到请柬内容')

      forceRevealVisible(root)
      restoreStyles = prepareExportStyles(root, options.opened.value)
      window.scrollTo(0, 0)
      await ensureInviteFontsReady()
      await waitImages(root)
      // 给布局/图片一帧稳定时间（已关闭 transition）
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      await new Promise((r) => window.setTimeout(r, 120))

      // 跨域 Google / jsDelivr 字体无法从 styleSheets 读取，需自行嵌入
      const fontCssText = await buildEmbeddedFontCss(root)

      const width = Math.min(root.scrollWidth || root.offsetWidth || 390, 640)
      const dataUrl = await domToJpeg(root, {
        width,
        scale: 2,
        quality: 0.88,
        backgroundColor: '#f8f5f0',
        // 不设 preferredFormat：data URL / truetype 子集都需保留，否则 src 会被滤空
        font: {
          cssText: fontCssText
        },
        filter(el) {
          if (!(el instanceof Element)) return true
          if (el instanceof HTMLElement && el.classList.contains('no-export')) return false
          if (el.id === 'petals' || el.id === 'fireflies' || el.id === 'cursor-glow') return false
          return true
        }
      })

      if (!dataUrl) throw new Error('生成图片失败')
      previewUrl.value = dataUrl
      showPreview.value = true
    } catch (err) {
      console.warn('[ExportInvite]', err)
      error.value = err instanceof Error && err.message ? err.message : '导出失败，请稍后重试'
      showPreview.value = true
    } finally {
      restoreStyles?.()
      exporting.value = false
      window.scrollTo(prevScrollX, prevScrollY)
    }
  }

  return {
    exporting,
    previewUrl,
    error,
    showPreview,
    exportImage,
    saveImage,
    closePreview
  }
}

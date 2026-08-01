import { onMounted, onUnmounted } from 'vue'

/**
 * 滚动渐显：为所有带 .reveal 的元素注册 IntersectionObserver
 * 进入视口后添加 .in 触发 CSS 过渡。
 * 使用 MutationObserver 覆盖异步渲染后新增的 .reveal（如图片墙列表）。
 */
export function useReveal() {
  let observer: IntersectionObserver | null = null
  let mutationObserver: MutationObserver | null = null

  function observeEl(el: Element): void {
    if (!el.classList.contains('reveal') || el.classList.contains('in')) return
    if (!observer) {
      el.classList.add('in')
      return
    }
    observer.observe(el)
  }

  function observeTree(root: ParentNode): void {
    if (root instanceof Element) observeEl(root)
    root.querySelectorAll('.reveal:not(.in)').forEach(observeEl)
  }

  onMounted(() => {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'))
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            observer?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    observeTree(document)

    mutationObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node instanceof Element || node instanceof DocumentFragment) {
            observeTree(node)
          }
        })
      }
    })
    mutationObserver.observe(document.body, { childList: true, subtree: true })
  })

  onUnmounted(() => {
    mutationObserver?.disconnect()
    observer?.disconnect()
    mutationObserver = null
    observer = null
  })
}

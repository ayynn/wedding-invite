import { onMounted, onUnmounted } from 'vue'

/**
 * 滚动渐显：为所有带 .reveal 的元素注册 IntersectionObserver
 * 进入视口后添加 .in 触发 CSS 过渡
 */
export function useReveal() {
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    const els = Array.from(document.querySelectorAll('.reveal'))
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'))
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
    els.forEach((el) => observer?.observe(el))
  })

  onUnmounted(() => observer?.disconnect())
}

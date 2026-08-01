import { onMounted, onUnmounted, type Ref } from 'vue'

interface ParticleOptions {
  /** 花瓣数量（初始） */
  petals?: number
  /** 萤火虫数量（初始） */
  fireflies?: number
  /** 花瓣颜色 */
  petalColors?: string[]
}

const DEFAULT_PETAL_COLORS = ['#f8d8c4', '#f0c9a8', '#e8c9a0', '#f6d8bc', '#ecd1b4', '#f2cba8']

/**
 * 飘落花瓣 + 漂浮萤火虫粒子层
 * 需要在模板中提供两个容器 ref：#petals / #fireflies
 */
export function useParticles(
  petalLayer: Ref<HTMLElement | null>,
  fireflyLayer: Ref<HTMLElement | null>,
  options: ParticleOptions = {}
) {
  const petalCount = options.petals ?? 12
  const fireflyCount = options.fireflies ?? 14
  const colors = options.petalColors ?? DEFAULT_PETAL_COLORS

  let petalTimer: number | undefined
  let fireflyTimer: number | undefined

  const spawnPetal = (): void => {
    const layer = petalLayer.value
    if (!layer) return
    const p = document.createElement('span')
    p.className = 'petal'
    p.style.left = `${Math.random() * 100}vw`
    const size = 8 + Math.random() * 10
    p.style.width = `${size}px`
    p.style.height = `${size}px`
    p.style.background = colors[Math.floor(Math.random() * colors.length)]
    p.style.borderRadius = '60% 18% 55% 22%'
    p.style.opacity = `${0.45 + Math.random() * 0.4}`
    p.style.setProperty('--drift', `${Math.random() * 140 - 70}px`)
    p.style.setProperty('--spin', `${Math.random() * 540 - 270}deg`)
    const dur = 9 + Math.random() * 9
    p.style.animationDuration = `${dur}s`
    p.style.animationDelay = `${Math.random() * 3}s`
    layer.appendChild(p)
    window.setTimeout(() => p.remove(), (dur + 4) * 1000)
  }

  const spawnFirefly = (): void => {
    const layer = fireflyLayer.value
    if (!layer) return
    const f = document.createElement('span')
    f.className = 'firefly'
    const size = 3 + Math.random() * 4
    f.style.width = `${size}px`
    f.style.height = `${size}px`
    f.style.left = `${Math.random() * 100}vw`
    f.style.top = `${20 + Math.random() * 70}vh`
    f.style.setProperty('--fx', `${Math.random() * 120 - 60}px`)
    f.style.setProperty('--fy', `${Math.random() * 100 - 50}px`)
    f.style.animationDuration = `${5 + Math.random() * 6}s`
    f.style.animationDelay = `${Math.random() * 4}s`
    layer.appendChild(f)
    window.setTimeout(() => f.remove(), 16000)
  }

  onMounted(() => {
    for (let i = 0; i < petalCount; i++) spawnPetal()
    for (let i = 0; i < fireflyCount; i++) spawnFirefly()
    petalTimer = window.setInterval(() => {
      if (!document.hidden) spawnPetal()
    }, 2800)
    fireflyTimer = window.setInterval(() => {
      if (!document.hidden) spawnFirefly()
    }, 1300)
  })

  onUnmounted(() => {
    if (petalTimer) window.clearInterval(petalTimer)
    if (fireflyTimer) window.clearInterval(fireflyTimer)
    petalLayer.value?.querySelectorAll('*').forEach((el) => el.remove())
    fireflyLayer.value?.querySelectorAll('*').forEach((el) => el.remove())
  })
}

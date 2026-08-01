import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export interface CountdownParts {
  days: Ref<string>
  hours: Ref<string>
  minutes: Ref<string>
  seconds: Ref<string>
  /** 是否已过期 */
  expired: Ref<boolean>
}

const pad = (n: number): string => String(n).padStart(2, '0')

/**
 * 婚礼倒计时
 * @param target ISO 时间字符串，如 '2026-10-18T14:00:00+08:00'
 */
export function useCountdown(target: string): CountdownParts {
  const days = ref('00')
  const hours = ref('00')
  const minutes = ref('00')
  const seconds = ref('00')
  const expired = ref(false)

  let timer: number | undefined

  const tick = (): void => {
    const diff = new Date(target).getTime() - Date.now()
    if (diff <= 0) {
      days.value = hours.value = minutes.value = seconds.value = '00'
      expired.value = true
      return
    }
    days.value = pad(Math.floor(diff / 86_400_000))
    hours.value = pad(Math.floor((diff % 86_400_000) / 3_600_000))
    minutes.value = pad(Math.floor((diff % 3_600_000) / 60_000))
    seconds.value = pad(Math.floor((diff % 60_000) / 1_000))
  }

  onMounted(() => {
    tick()
    timer = window.setInterval(tick, 1000)
  })
  onUnmounted(() => {
    if (timer) window.clearInterval(timer)
  })

  return { days, hours, minutes, seconds, expired }
}

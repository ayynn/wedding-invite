import { ref, onUnmounted } from 'vue'

export interface AudioOptions {
  /** BGM 地址 */
  src: string
  /** 默认音量 0-1 */
  volume?: number
}

/**
 * 配乐控制：
 * 1. 优先播放外部 BGM（Audio 元素）
 * 2. 加载/播放失败时自动回退到 Web Audio 实时合成的浪漫钢琴
 * 3. 提供 play / pause / toggle
 */
export function useAudio({ src, volume = 0.5 }: AudioOptions) {
  const playing = ref(false)
  const fallbackActive = ref(false)

  let bgm: HTMLAudioElement | null = null
  let ctx: AudioContext | null = null
  let master: GainNode | null = null
  let synthTimer: number | undefined
  let synthBar = 0
  let synthNextTime = 0
  let synthOn = false

  const CHORDS: number[][] = [
    [261.63, 329.63, 392.0], // C
    [196.0, 246.94, 293.66], // G
    [220.0, 261.63, 329.63], // Am
    [174.61, 220.0, 261.63]  // F
  ]

  const createBgm = (): void => {
    if (bgm) return
    bgm = new Audio(src)
    bgm.loop = true
    bgm.volume = volume
    bgm.preload = 'auto'
  }

  const playBgm = (): Promise<void> => {
    createBgm()
    if (!bgm) return Promise.resolve()
    const p = bgm.play()
    return p || Promise.resolve()
  }

  /* ---------- Web Audio 合成兜底 ---------- */
  const makeImpulse = (duration: number, decay: number): AudioBuffer => {
    if (!ctx) throw new Error('AudioContext 未初始化')
    const rate = ctx.sampleRate
    const len = Math.floor(rate * duration)
    const buffer = ctx.createBuffer(2, len, rate)
    for (let c = 0; c < 2; c++) {
      const data = buffer.getChannelData(c)
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
      }
    }
    return buffer
  }

  const initSynth = (): void => {
    if (ctx) return
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.16
    master.connect(ctx.destination)
    const conv = ctx.createConvolver()
    conv.buffer = makeImpulse(2.6, 2.2)
    const wet = ctx.createGain()
    wet.gain.value = 0.4
    const dry = ctx.createGain()
    dry.gain.value = 1
    master.connect(dry)
    dry.connect(ctx.destination)
    master.connect(conv)
    conv.connect(wet)
    wet.connect(ctx.destination)
  }

  const playNote = (freq: number, t: number, dur = 0.2, vol = 0.5): void => {
    if (!ctx || !master) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filt = ctx.createBiquadFilter()
    osc.type = 'triangle'
    osc.frequency.value = freq
    filt.type = 'lowpass'
    filt.frequency.value = 2600
    filt.Q.value = 1.1
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(vol, t + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0008, t + dur)
    osc.connect(filt)
    filt.connect(gain)
    gain.connect(master)
    osc.start(t)
    osc.stop(t + dur + 0.05)
    // 泛音增甜
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.value = freq * 2
    gain2.gain.setValueAtTime(0, t)
    gain2.gain.linearRampToValueAtTime(vol * 0.14, t + 0.03)
    gain2.gain.exponentialRampToValueAtTime(0.0008, t + dur * 0.65)
    osc2.connect(gain2)
    gain2.connect(master)
    osc2.start(t)
    osc2.stop(t + dur)
  }

  const playArp = (t: number): void => {
    if (!ctx) return
    const chord = CHORDS[synthBar % CHORDS.length]
    playNote(chord[0] / 2, t, 3.2, 0.5)
    chord.forEach((f, i) => playNote(f, t + 0.18 + i * 0.09, 2.6, 0.32))
    const hi = chord[Math.floor(Math.random() * 3)] * 2
    playNote(hi, t + 0.32, 1.6, 0.16)
    if (synthBar % 4 === 1) playNote(chord[1] * 2, t + 0.55, 2, 0.14)
    synthBar++
  }

  const synthLoop = (): void => {
    if (!synthOn || !ctx) return
    while (synthNextTime < ctx.currentTime + 0.35) {
      playArp(synthNextTime)
      synthNextTime += 3.6
    }
    synthTimer = window.setTimeout(synthLoop, 180)
  }

  const startSynth = (): void => {
    initSynth()
    if (!ctx) return
    if (ctx.state === 'suspended') void ctx.resume()
    if (synthOn) return
    synthOn = true
    synthBar = 0
    synthNextTime = ctx.currentTime + 0.06
    synthLoop()
    fallbackActive.value = true
  }

  const stopSynth = (): void => {
    synthOn = false
    if (synthTimer) window.clearTimeout(synthTimer)
    if (master && ctx) {
      const t = ctx.currentTime
      master.gain.cancelScheduledValues(t)
      master.gain.setValueAtTime(master.gain.value, t)
      master.gain.linearRampToValueAtTime(0, t + 0.4)
      window.setTimeout(() => {
        if (!synthOn && master) master.gain.value = 0.16
      }, 500)
    }
    fallbackActive.value = false
  }

  /* ---------- 对外接口 ---------- */
  const start = (): void => {
    playBgm()
      .then(() => {
        playing.value = true
      })
      .catch(() => {
        // BGM 不可用（如内嵌资源损坏 / 自动播放被拦截），回退合成
        startSynth()
        playing.value = true
      })
  }

  const stop = (): void => {
    if (bgm) {
      bgm.pause()
      bgm.currentTime = 0
    }
    stopSynth()
    playing.value = false
  }

  const toggle = (): void => {
    if (playing.value) stop()
    else start()
  }

  const setVolume = (v: number): void => {
    if (bgm) bgm.volume = v
    if (master && ctx) master.gain.value = v * 0.32
  }

  onUnmounted(() => {
    stop()
    if (ctx && ctx.state !== 'closed') void ctx.close()
  })

  return { playing, fallbackActive, start, stop, toggle, setVolume }
}

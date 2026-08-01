<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { weddingConfig } from '@/config/wedding'
import { useAudio } from '@/composables/useAudio'
import { useReveal } from '@/composables/useReveal'
import { useParticles } from '@/composables/useParticles'
import Cover from '@/components/Cover.vue'
import CoupleSection from '@/components/CoupleSection.vue'
import CountdownSection from '@/components/CountdownSection.vue'
import GallerySection from '@/components/GallerySection.vue'
import PhotoWallSection from '@/components/PhotoWallSection.vue'
import ScheduleSection from '@/components/ScheduleSection.vue'
import TipsSection from '@/components/TipsSection.vue'
import RsvpSection from '@/components/RsvpSection.vue'
import FinaleSection from '@/components/FinaleSection.vue'
import MusicButton from '@/components/MusicButton.vue'

const config = weddingConfig

/** 是否已进入（封面滑出） */
const opened = ref(false)

/** 粒子层容器 */
const petalLayer = ref<HTMLElement | null>(null)
const fireflyLayer = ref<HTMLElement | null>(null)

/** 配乐 */
const audio = useAudio({ src: config.bgm.src, volume: config.bgm.volume })

/** 滚动渐显 */
useReveal()

/** 花瓣 + 萤火虫 */
useParticles(petalLayer, fireflyLayer)

/** 光标光斑清理函数（赋值于 onMounted，于 onUnmounted 调用） */
let glowCleanup: (() => void) | null = null

/** 光标光斑（仅精细指针设备） */
onMounted(() => {
  if (window.matchMedia('(pointer:fine)').matches) {
    const glow = document.getElementById('cursor-glow')
    if (!glow) return
    const move = (e: PointerEvent): void => {
      glow.style.left = `${e.clientX}px`
      glow.style.top = `${e.clientY}px`
      glow.classList.add('on')
    }
    const leave = (): void => glow.classList.remove('on')
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerleave', leave)
    glowCleanup = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerleave', leave)
    }
  }
})
onUnmounted(() => glowCleanup?.())

/** 打开邀请函：封面滑出 + 正文淡入 + 回到顶部 */
function handleOpen(): void {
  if (opened.value) return
  opened.value = true
  window.scrollTo(0, 0)
  window.setTimeout(() => {
    if (opened.value) window.scrollTo(0, 0)
  }, 400)
  audio.start()
}
</script>

<template>
  <div id="cursor-glow"></div>
  <div ref="fireflyLayer" id="fireflies"></div>
  <div ref="petalLayer" id="petals"></div>

  <Cover :config="config" :opened="opened" @open="handleOpen" />

  <main class="main" :class="{ show: opened }">
    <CoupleSection
      :groom="config.couple.groom"
      :bride="config.couple.bride"
      :love-story="config.loveStory"
    />
    <CountdownSection :date-text="config.dateText" :date-sub-text="config.dateSubText" :target="config.weddingDate" />
    <GallerySection :items="config.gallery" />
    <PhotoWallSection
      :endpoint="config.api.wallEndpoint"
      :max-size="config.wall.maxSize"
      :max-bytes="config.wall.maxBytes"
      :title="config.wall.title"
      :en="config.wall.en"
      :sub="config.wall.sub"
    />
    <ScheduleSection :items="config.schedule" />
    <TipsSection :items="config.tips" :venue="config.venue" />
    <RsvpSection :endpoint="config.api.rsvpEndpoint" />
    <FinaleSection
      :logo-parts="config.couple.logoParts"
      :venue="config.venue"
      :bgm="{ title: config.bgm.title, artist: config.bgm.artist }"
    />
  </main>

  <MusicButton :playing="audio.playing.value" :fallback="audio.fallbackActive.value" @toggle="audio.toggle" />
</template>

<style scoped>
.main {
  position: relative;
  z-index: 1;
  background: var(--cream);
  opacity: 0;
  transition: opacity 1.2s ease;
}
.main.show {
  opacity: 1;
}
</style>

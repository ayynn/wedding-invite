<script setup lang="ts">
defineOptions({ name: 'invite-view' })

import { ref, onMounted, onUnmounted, provide } from 'vue'
import { weddingConfig } from '@/config/wedding'
import { useAudio } from '@/composables/useAudio'
import { useReveal } from '@/composables/useReveal'
import { useParticles } from '@/composables/useParticles'
import { useExportInviteImage } from '@/composables/useExportInviteImage'
import Cover from '@/components/Cover.vue'
import CoupleSection from '@/components/CoupleSection.vue'
import CountdownSection from '@/components/CountdownSection.vue'
import GallerySection from '@/components/GallerySection.vue'
import ScheduleSection from '@/components/ScheduleSection.vue'
import PortraitStorySection from '@/components/PortraitStorySection.vue'
import TipsSection from '@/components/TipsSection.vue'
import RsvpSection from '@/components/RsvpSection.vue'
import FinaleSection from '@/components/FinaleSection.vue'
import MusicButton from '@/components/MusicButton.vue'
import ExportLongImagePreview from '@/components/ExportLongImagePreview.vue'

const config = weddingConfig
const opened = ref(false)
const petalLayer = ref<HTMLElement | null>(null)
const fireflyLayer = ref<HTMLElement | null>(null)
const exportRoot = ref<HTMLElement | null>(null)
const audio = useAudio({ src: config.bgm.src, volume: config.bgm.volume })

useReveal()
useParticles(petalLayer, fireflyLayer)

function handleOpen(): void {
  if (opened.value) return
  opened.value = true
  window.scrollTo(0, 0)
  window.setTimeout(() => {
    if (opened.value) window.scrollTo(0, 0)
  }, 400)
  audio.start()
}

const {
  exporting,
  previewUrl,
  error: exportError,
  showPreview,
  exportImage,
  saveImage,
  closePreview
} = useExportInviteImage({
  root: exportRoot,
  opened,
  openInvite: handleOpen,
  fileName: `${config.couple.names.replace(/\s·\s/g, '-')}婚礼邀请函.jpg`
})

provide('exportInviteImage', { exporting, exportImage })

let glowCleanup: (() => void) | null = null

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
</script>

<template>
  <div id="cursor-glow" class="no-export"></div>
  <div ref="fireflyLayer" id="fireflies" class="no-export"></div>
  <div ref="petalLayer" id="petals" class="no-export"></div>

  <div ref="exportRoot" class="invite-export-root" :class="{ exporting }">
    <Cover :config="config" :opened="opened" @open="handleOpen" />

    <main class="main" :class="{ show: opened }">
      <CoupleSection
        :groom="config.couple.groom"
        :bride="config.couple.bride"
        :love-story="config.loveStory"
        :photo="config.portraits.intro"
      />
      <PortraitStorySection
        :src="config.portraits.formal"
        v-bind="config.portraitStories.formal"
        variant="formal"
        tone="light"
      />
      <CountdownSection :date-text="config.dateText" :date-sub-text="config.dateSubText" :target="config.weddingDate" />
      <GallerySection :items="config.gallery" />
      <ScheduleSection :items="config.schedule" />
      <PortraitStorySection
        :src="config.portraits.art"
        v-bind="config.portraitStories.art"
        variant="art"
        tone="light"
      />
      <TipsSection :items="config.tips" :venue="config.venue" />
      <RsvpSection class="no-export" :endpoint="config.api.rsvpEndpoint" />
      <FinaleSection
        :logo-parts="config.couple.logoParts"
        :venue="config.venue"
        :bgm="{ title: config.bgm.title, artist: config.bgm.artist }"
        :photo="config.portraits.finale"
      />
    </main>
  </div>

  <div class="no-export music-slot">
    <MusicButton
      :playing="audio.playing.value"
      :fallback="audio.fallbackActive.value"
      @toggle="audio.toggle"
    />
  </div>

  <div v-if="exporting" class="export-loading no-export" role="status" aria-live="polite">
    <div class="export-loading-card">
      <p class="export-loading-title">正在生成邀请长图</p>
      <p class="export-loading-sub">请稍候，完整请柬较长…</p>
    </div>
  </div>

  <ExportLongImagePreview
    :show="showPreview"
    :image-url="previewUrl"
    :error="exportError"
    :exporting="exporting"
    @close="closePreview"
    @save="saveImage"
  />
</template>

<style scoped>
.invite-export-root {
  position: relative;
}

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

/* 导出长图：封面并入文档流，强制内容可见，隐藏交互区 */
.invite-export-root.exporting :deep(.cover) {
  position: relative;
  inset: auto;
  z-index: 1;
  min-height: 100vh;
  min-height: 100dvh;
  transform: none !important;
  opacity: 1 !important;
  pointer-events: none;
}
.invite-export-root.exporting :deep(.cover.leaving) {
  transform: none !important;
  opacity: 1 !important;
}
.invite-export-root.exporting .main {
  opacity: 1;
}
.invite-export-root.exporting :deep(.reveal) {
  opacity: 1 !important;
  transform: none !important;
  transition: none !important;
}
.invite-export-root.exporting :deep(.no-export) {
  display: none !important;
}
/* background-clip 文字在截图里常失效，导出时改实色 */
.invite-export-root.exporting :deep(.gold-text) {
  background: none !important;
  -webkit-background-clip: border-box !important;
  background-clip: border-box !important;
  -webkit-text-fill-color: #e8c98a !important;
  color: #e8c98a !important;
  filter: none !important;
}
.invite-export-root.exporting :deep(.cover-ring),
.invite-export-root.exporting :deep(.fv) {
  animation: none !important;
}

.music-slot {
  display: contents;
}

.export-loading {
  position: fixed;
  inset: 0;
  z-index: 95;
  display: grid;
  place-items: center;
  background: rgba(92, 83, 72, 0.28);
  backdrop-filter: blur(4px);
}

.export-loading-card {
  min-width: 220px;
  padding: 22px 26px;
  border-radius: 16px;
  text-align: center;
  background: rgba(255, 250, 242, 0.96);
  border: 1px solid rgba(201, 168, 106, 0.45);
  box-shadow: 0 16px 40px rgba(16, 26, 20, 0.28);
}

.export-loading-title {
  font-size: 15px;
  letter-spacing: 0.18em;
  color: var(--green-deep);
}

.export-loading-sub {
  margin-top: 8px;
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--brown);
}
</style>

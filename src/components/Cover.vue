<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import type { WeddingConfig } from '@/types'

defineProps<{
  config: WeddingConfig
  opened: boolean
}>()

const emit = defineEmits<{
  (e: 'open'): void
}>()

let scrollFired = false
let scrollHandler: (() => void) | null = null
let touchHandler: (() => void) | null = null

function onScroll(): void {
  if (scrollFired || window.scrollY <= 34) return
  scrollFired = true
  emit('open')
}

onMounted(() => {
  scrollHandler = onScroll
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('wheel', onScroll, { passive: true })
  touchHandler = () => {
    if (window.scrollY > 0) onScroll()
  }
  window.addEventListener('touchmove', touchHandler, { passive: true })
})

onUnmounted(() => {
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
  window.removeEventListener('wheel', onScroll)
  if (touchHandler) window.removeEventListener('touchmove', touchHandler)
})
</script>

<template>
  <header class="cover" :class="{ leaving: opened }" @click="emit('open')">
    <div class="cover-top">INVITATION&nbsp;&nbsp;·&nbsp;&nbsp;婚礼邀请</div>
    <div class="cover-inner">
      <div class="cover-logo-wrap">
        <div class="cover-ring"></div>
        <div class="cover-ring r2"></div>
        <div class="cover-logo gold-text">
          <template v-for="(part, i) in config.couple.logoParts" :key="i">
            <span v-if="part === '&'" class="amp">&amp;</span>
            <template v-else>{{ part }}</template>
          </template>
        </div>
        <div class="cover-ornament">❦</div>
        <div class="cover-names">
          <b>{{ config.couple.groom.nameSpaced }}</b><span class="sep">·</span><b>{{ config.couple.bride.nameSpaced }}</b>
        </div>
      </div>
      <div class="cover-date">{{ config.dateText }}</div>
      <div class="cover-venue">{{ config.venue.name }}</div>
      <button class="cover-btn" @click.stop="emit('open')">✦ 打开这份邀请 ✦</button>
    </div>
    <div class="cover-hint">上滑进入我们的故事<span class="arr">⌃</span></div>
  </header>
</template>

<style scoped>
.cover {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background:
    linear-gradient(180deg, rgba(16, 28, 22, 0.42) 0%, rgba(16, 28, 22, 0.16) 55%, rgba(28, 46, 36, 0.58) 100%),
    url('/imgs/venue_01.jpg') center / cover no-repeat;
  color: var(--cream);
  overflow: hidden;
  cursor: pointer;
  transition: transform 1.05s cubic-bezier(0.72, 0.01, 0.24, 1), opacity 0.9s ease;
}
.cover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 58%, transparent 26%, rgba(16, 26, 20, 0.5) 100%);
}
.cover.leaving {
  transform: translateY(-101%);
  opacity: 0;
}
.cover-top {
  position: absolute;
  top: max(28px, env(safe-area-inset-top));
  width: 100%;
  text-align: center;
  z-index: 3;
  font-size: 13px;
  letter-spacing: 0.5em;
  color: rgba(250, 246, 238, 0.8);
}
.cover-inner {
  position: relative;
  z-index: 3;
  text-align: center;
  padding: 0 24px;
  max-width: 720px;
}
.cover-logo-wrap {
  position: relative;
  margin-bottom: 34px;
}
.cover-logo {
  font-family: 'Great Vibes', cursive;
  font-size: clamp(54px, 14vw, 104px);
  line-height: 1.4;
  letter-spacing: 0.02em;
  white-space: nowrap;
  display: inline-block;
  padding: 0.1em 0.18em;
  margin-top: -0.06em;
  margin-bottom: -0.1em;
}
.cover-logo .amp {
  font-size: 0.5em;
  vertical-align: 0.32em;
  margin: 0 0.06em;
  opacity: 0.85;
}
.cover-ornament {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 16px auto 0;
  color: var(--gold-light);
}
.cover-ornament::before,
.cover-ornament::after {
  content: '';
  height: 1px;
  width: min(90px, 24vw);
  background: linear-gradient(90deg, transparent, var(--gold-light));
}
.cover-ornament::after {
  background: linear-gradient(90deg, var(--gold-light), transparent);
}
.cover-names {
  font-family: 'Noto Serif SC', 'Songti SC', 'STSong', 'SimSun', serif;
  font-size: clamp(23px, 5.4vw, 28px);
  font-weight: 500;
  letter-spacing: 0.5em;
  color: var(--gold-bright);
  margin-top: 20px;
  text-indent: 0.5em;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.5);
}
.cover-names b {
  font-weight: 500;
}
.cover-names .sep {
  opacity: 0.7;
  margin: 0 0.1em;
}
.cover-ring {
  position: absolute;
  inset: -34px;
  margin: auto;
  border: 1px solid rgba(232, 213, 163, 0.35);
  border-radius: 50%;
  animation: ringSpin 38s linear infinite;
  pointer-events: none;
}
.cover-ring.r2 {
  inset: -50px;
  border-style: dashed;
  animation-duration: 58s;
  animation-direction: reverse;
  opacity: 0.45;
}
@keyframes ringSpin {
  to { transform: rotate(360deg); }
}
.cover-date {
  font-size: 15px;
  letter-spacing: 0.32em;
  color: var(--gold-light);
  margin-top: 22px;
}
.cover-venue {
  margin-top: 10px;
  font-size: 13px;
  color: rgba(243, 236, 221, 0.85);
  letter-spacing: 0.24em;
}
.cover-btn {
  margin-top: 36px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 15px 44px;
  border-radius: 60px;
  border: 1px solid rgba(232, 213, 163, 0.7);
  background: rgba(28, 46, 36, 0.38);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: var(--gold-light);
  letter-spacing: 0.4em;
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.45s cubic-bezier(0.2, 0.7, 0.2, 1);
  animation: btnBreathe 2.6s ease-in-out infinite;
}
.cover-btn:active {
  background: rgba(201, 168, 106, 0.65);
  color: #1c2e24;
  transform: scale(0.96);
  border-color: var(--gold);
  transition: all 0.15s ease;
}
@keyframes btnBreathe {
  0%, 100% { box-shadow: 0 0 0 0 rgba(232, 213, 163, 0.28); }
  50% { box-shadow: 0 0 0 13px rgba(232, 213, 163, 0); }
}
.cover-hint {
  position: absolute;
  bottom: max(26px, env(safe-area-inset-bottom));
  width: 100%;
  text-align: center;
  z-index: 3;
  font-size: 12px;
  letter-spacing: 0.3em;
  color: rgba(243, 236, 221, 0.62);
  animation: hintFloat 2.2s ease-in-out infinite;
}
.cover-hint .arr {
  display: block;
  font-size: 16px;
  margin-top: 4px;
}
@keyframes hintFloat {
  0%, 100% { transform: translateY(0); opacity: 0.55; }
  50% { transform: translateY(7px); opacity: 1; }
}
</style>

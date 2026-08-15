<script setup lang="ts">
defineOptions({ name: 'cover-section' })

import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import type { WeddingConfig } from '@/types'

defineProps<{
  config: WeddingConfig
  opened: boolean
}>()

const emit = defineEmits<{
  (e: 'open'): void
}>()

const router = useRouter()

/** 顶部「婚礼邀请」双击 / 双击进入后台登录页 */
const DOUBLE_TAP_MS = 320
let lastTitleTapAt = 0
let scrollFired = false
let scrollHandler: (() => void) | null = null
let touchHandler: (() => void) | null = null

function goAdminLogin(): void {
  lastTitleTapAt = 0
  void router.push({ name: 'admin-login' })
}

function onTitleTap(e: Event): void {
  e.stopPropagation()
  const now = Date.now()
  if (now - lastTitleTapAt <= DOUBLE_TAP_MS) {
    goAdminLogin()
    return
  }
  lastTitleTapAt = now
}

function onTitleDblClick(e: Event): void {
  e.stopPropagation()
  e.preventDefault()
  goAdminLogin()
}

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
    <img class="cover-bg" :src="config.portraits.cover" alt="" draggable="false" />
    <div class="cover-shade" aria-hidden="true"></div>
    <div
      class="cover-top"
      @click="onTitleTap"
      @dblclick="onTitleDblClick"
    >INVITATION&nbsp;&nbsp;·&nbsp;&nbsp;婚礼邀请</div>
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
          <b class="couple-name">{{ config.couple.groom.nameSpaced }}</b>
          <span class="sep">·</span>
          <b class="couple-name">{{ config.couple.bride.nameSpaced }}</b>
        </div>
      </div>
      <div class="cover-date">{{ config.dateText }}</div>
      <div class="cover-venue">{{ config.venue.name }}</div>
      <button class="cover-btn no-export" @click.stop="emit('open')">✦ 打开这份邀请 ✦</button>
    </div>
    <div class="cover-hint no-export">上滑进入我们的故事<span class="arr">⌃</span></div>
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
  background: #f4efe6;
  color: var(--green-deep);
  overflow: hidden;
  cursor: pointer;
  transition: transform 1.05s cubic-bezier(0.72, 0.01, 0.24, 1), opacity 0.9s ease;
}
.cover-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 42%;
  pointer-events: none;
  user-select: none;
  filter: saturate(0.92) contrast(1.02) brightness(1.04);
}
.cover-shade {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(
      180deg,
      rgba(251, 248, 243, 0.78) 0%,
      rgba(251, 248, 243, 0.28) 38%,
      rgba(244, 239, 230, 0.82) 100%
    );
}
.cover::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: radial-gradient(ellipse at 50% 48%, transparent 28%, rgba(244, 239, 230, 0.42) 100%);
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
  font-family: var(--font-hand);
  font-size: 15px;
  letter-spacing: 0.28em;
  color: rgba(92, 83, 72, 0.72);
  cursor: default;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  /* 扩大可点区域，方便移动端双击 */
  padding: 12px 16px;
  margin-top: -12px;
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
  font-family: var(--font-script);
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
  color: var(--gold);
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
  font-size: clamp(26px, 6vw, 34px);
  font-weight: 400;
  letter-spacing: 0.22em;
  color: var(--green-deep);
  margin-top: 20px;
  text-indent: 0.22em;
  text-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0;
}
.cover-names b {
  font-weight: 400;
}
.cover-names .sep {
  opacity: 0.7;
  margin: 0 0.1em;
}
.cover-ring {
  position: absolute;
  inset: -34px;
  margin: auto;
  border: 1px solid rgba(196, 174, 138, 0.42);
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
  font-family: var(--font-hand);
  font-size: 17px;
  letter-spacing: 0.18em;
  color: var(--brown);
  margin-top: 22px;
}
.cover-venue {
  font-family: var(--font-hand);
  margin-top: 10px;
  font-size: 15px;
  color: var(--brown);
  letter-spacing: 0.14em;
}
.cover-btn {
  margin-top: 36px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 15px 44px;
  border-radius: 60px;
  border: 1px solid rgba(196, 174, 138, 0.7);
  background: rgba(255, 255, 255, 0.58);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: var(--green-deep);
  letter-spacing: 0.22em;
  font-size: 16px;
  cursor: pointer;
  font-family: var(--font-hand);
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
  font-family: var(--font-hand);
  font-size: 14px;
  letter-spacing: 0.16em;
  color: rgba(92, 83, 72, 0.55);
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

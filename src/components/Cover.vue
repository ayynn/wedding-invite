<script setup lang="ts">
defineOptions({ name: 'cover-section' })

import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import type { WeddingConfig } from '@/types'

const props = defineProps<{
  config: WeddingConfig
  opened: boolean
}>()

const emit = defineEmits<{
  (e: 'open'): void
}>()

const router = useRouter()

/** 顶部标题双击进入后台登录页 */
const DOUBLE_TAP_MS = 320
let lastTitleTapAt = 0
let scrollFired = false
let scrollHandler: (() => void) | null = null
let touchHandler: (() => void) | null = null

const coverDate = computed(() => {
  const d = new Date(props.config.weddingDate)
  const months = [
    'JANUARY',
    'FEBRUARY',
    'MARCH',
    'APRIL',
    'MAY',
    'JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER'
  ]
  const year = d.getFullYear()
  return {
    month: months[d.getMonth()] || '',
    day: String(d.getDate()).padStart(2, '0'),
    yearLeft: 'TWENTY',
    yearRight: String(year).slice(-2)
  }
})

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

    <div class="cover-inner">
      <p
        class="cover-eyebrow"
        @click="onTitleTap"
        @dblclick="onTitleDblClick"
      >
        please join us for
      </p>
      <p class="cover-kicker">THE WEDDING OF</p>

      <h1 class="cover-script">
        <template v-for="(part, i) in config.couple.logoParts" :key="i">
          <span v-if="part === '&'" class="amp">&amp;</span>
          <template v-else>{{ part }}</template>
        </template>
      </h1>

      <p class="cover-names">
        <span class="couple-name">{{ config.couple.groom.nameSpaced }}</span>
        <span class="sep">&amp;</span>
        <span class="couple-name">{{ config.couple.bride.nameSpaced }}</span>
      </p>

      <div class="cover-date" aria-label="婚礼日期">
        <div class="date-side">
          <span class="date-label">{{ coverDate.month }}</span>
          <span class="date-num">{{ coverDate.day }}</span>
        </div>
        <div class="date-rule" aria-hidden="true"></div>
        <div class="date-side">
          <span class="date-label">{{ coverDate.yearLeft }}</span>
          <span class="date-num">{{ coverDate.yearRight }}</span>
        </div>
      </div>

      <div class="cover-venue">
        <p class="venue-name">{{ config.venue.name }}</p>
        <p class="venue-meta">{{ config.dateText }}</p>
        <p class="venue-addr">{{ config.venue.address }}</p>
      </div>

      <button class="cover-btn no-export" type="button" @click.stop="emit('open')">
        打开邀请
      </button>
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
  align-items: flex-start;
  justify-content: center;
  background: #ece7df;
  color: #4a433c;
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 1.05s cubic-bezier(0.72, 0.01, 0.24, 1),
    opacity 0.9s ease;
}
.cover-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 58%;
  pointer-events: none;
  user-select: none;
  filter: saturate(0.9) contrast(1.02) brightness(1.02);
  animation: bgDrift 18s ease-in-out infinite alternate;
}
@keyframes bgDrift {
  from {
    transform: scale(1.04) translate3d(0, 0, 0);
  }
  to {
    transform: scale(1.08) translate3d(0, -1.2%, 0);
  }
}
.cover-shade {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(
      180deg,
      rgba(255, 252, 247, 0.72) 0%,
      rgba(255, 252, 247, 0.28) 28%,
      rgba(255, 252, 247, 0.08) 48%,
      rgba(236, 231, 223, 0.18) 72%,
      rgba(60, 52, 44, 0.22) 100%
    );
}

.cover.leaving {
  transform: translateY(-101%);
  opacity: 0;
}

.cover-inner {
  position: relative;
  z-index: 3;
  width: min(560px, 100%);
  padding: max(56px, calc(env(safe-area-inset-top) + 36px)) 28px 120px;
  text-align: center;
  animation: coverRise 1.15s var(--ease) both;
}
@keyframes coverRise {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.cover-eyebrow {
  font-family: var(--font-display-en);
  font-size: 13px;
  font-style: italic;
  letter-spacing: 0.18em;
  text-transform: lowercase;
  color: rgba(74, 67, 60, 0.72);
  cursor: default;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  padding: 8px 12px;
  margin: -8px auto 0;
  display: inline-block;
}
.cover-kicker {
  margin-top: 10px;
  font-family: var(--font-display-en);
  font-size: clamp(12px, 3.2vw, 14px);
  letter-spacing: 0.42em;
  text-indent: 0.42em;
  text-transform: uppercase;
  color: rgba(74, 67, 60, 0.78);
}

.cover-script {
  margin-top: 18px;
  font-family: var(--font-script);
  font-size: clamp(64px, 16vw, 108px);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: 0.01em;
  color: #3f3832;
  white-space: nowrap;
  text-shadow: 0 10px 40px rgba(255, 252, 247, 0.55);
  animation: scriptIn 1.35s cubic-bezier(0.2, 0.7, 0.2, 1) 0.12s both;
}
@keyframes scriptIn {
  from {
    opacity: 0;
    letter-spacing: 0.08em;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    letter-spacing: 0.01em;
    transform: none;
  }
}
.cover-script .amp {
  display: inline-block;
  font-size: 0.52em;
  vertical-align: 0.18em;
  margin: 0 0.04em;
  opacity: 0.82;
}

.cover-names {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35em;
  font-size: clamp(15px, 3.8vw, 18px);
  letter-spacing: 0.22em;
  color: rgba(74, 67, 60, 0.88);
}
.cover-names .sep {
  font-family: var(--font-script);
  font-size: 1.15em;
  letter-spacing: 0;
  opacity: 0.7;
}

.cover-date {
  margin: 28px auto 0;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  width: min(320px, 86%);
  padding: 14px 0;
  border-top: 1px solid rgba(74, 67, 60, 0.28);
  border-bottom: 1px solid rgba(74, 67, 60, 0.28);
}
.date-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.date-label {
  font-family: var(--font-display-en);
  font-size: 11px;
  letter-spacing: 0.28em;
  text-indent: 0.28em;
  color: rgba(74, 67, 60, 0.7);
}
.date-num {
  font-family: var(--font-display-en);
  font-size: clamp(28px, 7vw, 36px);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: 0.06em;
  color: #3f3832;
}
.date-rule {
  width: 1px;
  height: 42px;
  background: linear-gradient(180deg, transparent, rgba(74, 67, 60, 0.35), transparent);
}

.cover-venue {
  margin-top: 22px;
}
.venue-name {
  font-family: var(--font-display-en);
  font-size: clamp(13px, 3.4vw, 15px);
  letter-spacing: 0.28em;
  text-indent: 0.28em;
  text-transform: uppercase;
  color: rgba(74, 67, 60, 0.88);
}
.venue-meta,
.venue-addr {
  margin-top: 8px;
  font-family: var(--font-display-en);
  font-size: 12px;
  letter-spacing: 0.16em;
  color: rgba(74, 67, 60, 0.68);
}
.venue-addr {
  font-family: var(--font-hand);
  letter-spacing: 0.12em;
}

.cover-btn {
  margin-top: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 168px;
  padding: 12px 28px;
  border-radius: 999px;
  border: 1px solid rgba(74, 67, 60, 0.35);
  background: rgba(255, 252, 247, 0.42);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #3f3832;
  letter-spacing: 0.28em;
  text-indent: 0.28em;
  font-size: 13px;
  cursor: pointer;
  font-family: var(--font-display-en);
  transition: all 0.35s var(--ease);
}
.cover-btn:active {
  transform: scale(0.97);
  background: rgba(255, 252, 247, 0.72);
}

.cover-hint {
  position: absolute;
  bottom: max(24px, env(safe-area-inset-bottom));
  left: 0;
  width: 100%;
  z-index: 3;
  text-align: center;
  font-family: var(--font-hand);
  font-size: 13px;
  letter-spacing: 0.16em;
  color: rgba(255, 252, 247, 0.88);
  text-shadow: 0 2px 12px rgba(40, 34, 28, 0.35);
  animation: hintFloat 2.2s ease-in-out infinite;
}
.cover-hint .arr {
  display: block;
  font-size: 15px;
  margin-top: 2px;
}
@keyframes hintFloat {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.65;
  }
  50% {
    transform: translateY(7px);
    opacity: 1;
  }
}

@media (max-width: 380px) {
  .cover-inner {
    padding-left: 18px;
    padding-right: 18px;
  }
  .cover-script {
    font-size: 58px;
  }
}
</style>

<script setup lang="ts">
defineOptions({ name: 'cover-section' })

import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { WeddingConfig } from '@/types'
import { ADMIN_SECRET_HOLD_MS, ADMIN_SECRET_NAME } from '@/config/admin'

defineProps<{
  config: WeddingConfig
  opened: boolean
}>()

const emit = defineEmits<{
  (e: 'open'): void
}>()

const router = useRouter()

/** 新郎名可编辑：改为「长安新郎」并保持 10 秒进入后台 */
const editing = ref(false)
const groomDraft = ref('')
const holdProgress = ref(0)
const holdReady = ref(false)

let holdTimer: number | null = null
let holdRaf: number | null = null
let holdStartedAt = 0
let scrollFired = false
let scrollHandler: (() => void) | null = null
let touchHandler: (() => void) | null = null

const progressDeg = computed(() => Math.round(holdProgress.value * 360))

function clearHold(): void {
  if (holdTimer != null) {
    window.clearTimeout(holdTimer)
    holdTimer = null
  }
  if (holdRaf != null) {
    window.cancelAnimationFrame(holdRaf)
    holdRaf = null
  }
  holdProgress.value = 0
  holdReady.value = false
}

function tickHold(): void {
  const elapsed = Date.now() - holdStartedAt
  holdProgress.value = Math.min(1, elapsed / ADMIN_SECRET_HOLD_MS)
  if (holdProgress.value < 1) {
    holdRaf = window.requestAnimationFrame(tickHold)
  }
}

function startHold(): void {
  clearHold()
  holdStartedAt = Date.now()
  holdReady.value = true
  holdRaf = window.requestAnimationFrame(tickHold)
  holdTimer = window.setTimeout(() => {
    clearHold()
    editing.value = false
    void router.push({ name: 'admin-login' })
  }, ADMIN_SECRET_HOLD_MS)
}

function onGroomDraftInput(): void {
  if (groomDraft.value.trim() === ADMIN_SECRET_NAME) startHold()
  else clearHold()
}

function beginEdit(e: Event): void {
  e.stopPropagation()
  e.preventDefault()
  editing.value = true
  groomDraft.value = ''
  clearHold()
}

function cancelEdit(e?: Event): void {
  e?.stopPropagation()
  editing.value = false
  groomDraft.value = ''
  clearHold()
}

function onScroll(): void {
  if (scrollFired || editing.value || window.scrollY <= 34) return
  scrollFired = true
  emit('open')
}

watch(editing, (v) => {
  if (v) scrollFired = true
})

onMounted(() => {
  scrollHandler = onScroll
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('wheel', onScroll, { passive: true })
  touchHandler = () => {
    if (!editing.value && window.scrollY > 0) onScroll()
  }
  window.addEventListener('touchmove', touchHandler, { passive: true })
})

onUnmounted(() => {
  clearHold()
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
  window.removeEventListener('wheel', onScroll)
  if (touchHandler) window.removeEventListener('touchmove', touchHandler)
})
</script>

<template>
  <header class="cover" :class="{ leaving: opened }" @click="!editing && emit('open')">
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
          <span
            v-if="!editing"
            class="groom-name"
            title="长按编辑"
            @click.stop="beginEdit"
            @pointerdown.stop
          >
            <b>{{ config.couple.groom.nameSpaced }}</b>
          </span>
          <span v-else class="groom-edit" @click.stop>
            <span
              class="hold-ring"
              :class="{ on: holdReady }"
              :style="{ '--deg': progressDeg + 'deg' }"
            ></span>
            <input
              v-model="groomDraft"
              class="groom-input"
              type="text"
              maxlength="12"
              placeholder="新郎之名"
              autofocus
              @input="onGroomDraftInput"
              @keydown.escape="cancelEdit"
              @click.stop
            />
            <button type="button" class="groom-cancel" @click="cancelEdit">✕</button>
          </span>
          <span class="sep">·</span>
          <b>{{ config.couple.bride.nameSpaced }}</b>
        </div>
        <p v-if="holdReady" class="hold-hint">已锁定密钥 · {{ Math.ceil((1 - holdProgress) * 10) }}s 进入后台</p>
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
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0;
}
.cover-names b {
  font-weight: 500;
}
.cover-names .sep {
  opacity: 0.7;
  margin: 0 0.1em;
}
.groom-name {
  cursor: text;
  border-radius: 4px;
  transition: background 0.2s ease;
}
.groom-name:hover {
  background: rgba(232, 213, 163, 0.12);
}
.groom-edit {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-indent: 0;
  letter-spacing: 0;
}
.hold-ring {
  position: absolute;
  inset: -10px -14px;
  border-radius: 12px;
  opacity: 0;
  pointer-events: none;
  background: conic-gradient(var(--gold-light) var(--deg), transparent 0);
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: xor;
  padding: 2px;
  transition: opacity 0.25s ease;
}
.hold-ring.on {
  opacity: 1;
}
.groom-input {
  width: 7.5em;
  padding: 4px 8px;
  border: 1px solid rgba(232, 213, 163, 0.65);
  border-radius: 8px;
  background: rgba(16, 28, 22, 0.55);
  color: var(--gold-bright);
  font: inherit;
  font-size: 0.85em;
  letter-spacing: 0.2em;
  text-align: center;
  outline: none;
}
.groom-input::placeholder {
  color: rgba(243, 236, 221, 0.45);
  letter-spacing: 0.12em;
}
.groom-cancel {
  border: none;
  background: transparent;
  color: rgba(243, 236, 221, 0.7);
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
  letter-spacing: 0;
}
.hold-hint {
  margin-top: 12px;
  font-size: 12px;
  letter-spacing: 0.18em;
  color: var(--gold-light);
  animation: holdPulse 1.2s ease-in-out infinite;
}
@keyframes holdPulse {
  0%, 100% { opacity: 0.65; }
  50% { opacity: 1; }
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

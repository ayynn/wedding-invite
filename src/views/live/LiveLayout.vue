<script setup lang="ts">
defineOptions({ name: 'live-layout' })

import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { weddingConfig } from '@/config/wedding'

const route = useRoute()
const router = useRouter()
const config = weddingConfig

const showBack = computed(() => route.name !== 'live-home')

function goHome(): void {
  void router.push({ name: 'live-home' })
}

function goInvite(): void {
  void router.push({ name: 'invite' })
}
</script>

<template>
  <div class="live-app">
    <div class="live-bg" aria-hidden="true"></div>
    <header class="live-header">
      <button
        v-if="showBack"
        type="button"
        class="live-back"
        aria-label="返回首页"
        @click="goHome"
      >
        ←
      </button>
      <div class="live-brand" @click="goHome">
        <span class="live-brand-en gold-text">{{ config.couple.logoParts.join(' ') }}</span>
        <span class="live-brand-cn">婚礼现场</span>
      </div>
      <button type="button" class="live-invite-link" @click="goInvite">请柬</button>
    </header>

    <main class="live-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.live-app {
  position: relative;
  min-height: 100dvh;
  color: var(--green-deep);
  overflow-x: hidden;
}

.live-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 80% 50% at 10% 0%, rgba(201, 168, 106, 0.22), transparent 55%),
    radial-gradient(ellipse 70% 45% at 90% 15%, rgba(74, 107, 82, 0.16), transparent 50%),
    linear-gradient(180deg, #f7f1e4 0%, var(--cream) 42%, #f0e8d6 100%);
}

.live-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image:
    radial-gradient(rgba(45, 74, 54, 0.06) 0.7px, transparent 0.7px);
  background-size: 18px 18px;
}

.live-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: 56px 1fr 56px;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  backdrop-filter: blur(12px);
  background: rgba(250, 246, 238, 0.78);
  border-bottom: 1px solid rgba(201, 168, 106, 0.28);
}

.live-back,
.live-invite-link {
  border: none;
  background: transparent;
  color: var(--green);
  font-family: inherit;
  cursor: pointer;
}

.live-back {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  font-size: 20px;
  line-height: 1;
  transition: background 0.25s var(--ease);
}

.live-back:hover {
  background: rgba(201, 168, 106, 0.16);
}

.live-invite-link {
  justify-self: end;
  padding: 8px 4px;
  font-size: 13px;
  letter-spacing: 0.12em;
  color: var(--brown);
}

.live-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  user-select: none;
}

.live-brand-en {
  font-family: var(--font-script);
  font-size: 26px;
  line-height: 1;
  letter-spacing: 0.04em;
}

.live-brand-cn {
  font-family: var(--font-hand);
  font-size: 13px;
  letter-spacing: 0.28em;
  color: var(--brown);
}

.live-main {
  position: relative;
  z-index: 1;
  padding: 8px 0 40px;
}
</style>

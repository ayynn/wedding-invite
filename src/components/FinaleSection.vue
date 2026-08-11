<script setup lang="ts">
defineOptions({ name: 'finale-section' })

import type { Venue } from '@/types'
import ExportLongImageButton from './ExportLongImageButton.vue'

defineProps<{
  logoParts: string[]
  venue: Venue
  bgm: { title: string; artist: string }
  photo: string
  exporting?: boolean
}>()

const emit = defineEmits<{
  (e: 'export'): void
}>()
</script>

<template>
  <footer class="finale">
    <img class="finale-bg" :src="photo" alt="" draggable="false" />
    <div class="finale-shade" aria-hidden="true"></div>
    <div class="wrap">
      <div class="fv gold-text">
        <template v-for="(part, i) in logoParts" :key="i">
          <span v-if="part === '&'" class="amp">&amp;</span>
          <template v-else>{{ part }}</template>
        </template>
      </div>
      <div class="f-sub">我们 · 结婚啦</div>
      <p class="f-addr">
        {{ venue.name }}<br />
        {{ venue.address }} ·
        <a :href="venue.mapUrl" target="_blank" rel="noopener">点击查看地图</a>
      </p>
      <div class="finale-actions no-export">
        <ExportLongImageButton variant="dark" :exporting="!!exporting" @export="emit('export')" />
      </div>
      <p class="music-note no-export">
        ♪ {{ bgm.title }} · {{ bgm.artist }} ｜ 可点击右下角音符开关
      </p>
    </div>
  </footer>
</template>

<style scoped>
.finale {
  min-height: 86vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #1b2430;
  color: var(--cream);
  position: relative;
  overflow: hidden;
}
.finale-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 30%;
  pointer-events: none;
  user-select: none;
  filter: saturate(0.8) contrast(1.02) blur(1.5px);
  transform: scale(1.04);
}
.finale-shade {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(21, 28, 38, 0.86), rgba(27, 36, 48, 0.72)),
    radial-gradient(90% 60% at 50% 42%, rgba(65, 83, 110, 0.32), transparent 70%);
}
.finale .wrap {
  position: relative;
  z-index: 2;
  padding: 0 24px 72px;
}
.fv {
  font-family: var(--font-script);
  font-size: clamp(58px, 12vw, 100px);
  line-height: 1.4;
  white-space: nowrap;
  display: inline-block;
  padding: 0.15em 0.35em;
  animation: fvGlow 4s ease-in-out infinite;
}
.fv .amp {
  font-size: 0.55em;
  vertical-align: 0.2em;
  margin: 0 0.04em;
}
@keyframes fvGlow {
  0%,
  100% {
    text-shadow:
      0 6px 40px rgba(0, 0, 0, 0.6),
      0 0 0 rgba(232, 213, 163, 0);
  }
  50% {
    text-shadow:
      0 6px 40px rgba(0, 0, 0, 0.6),
      0 0 44px rgba(232, 213, 163, 0.55);
  }
}
.f-sub {
  font-family: var(--font-hand);
  font-size: 20px;
  letter-spacing: 0.28em;
  margin-top: 18px;
  color: rgba(243, 236, 221, 0.85);
}
.f-addr {
  font-family: var(--font-hand);
  margin-top: 34px;
  font-size: 15px;
  color: rgba(243, 236, 221, 0.7);
  letter-spacing: 0.1em;
}
.f-addr a {
  color: var(--gold-light);
  text-decoration: none;
  border-bottom: 1px dotted var(--gold);
}
.finale-actions {
  max-width: 320px;
  margin: 28px auto 0;
}
.music-note {
  position: absolute;
  bottom: 50px;
  left: 0;
  z-index: 2;
  width: 100%;
  font-size: 12px;
  color: rgba(243, 236, 221, 0.5);
  letter-spacing: 0.2em;
}
</style>

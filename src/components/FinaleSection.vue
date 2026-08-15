<script setup lang="ts">
defineOptions({ name: 'finale-section' })

import type { Venue } from '@/types'

defineProps<{
  logoParts: string[]
  venue: Venue
  bgm: { title: string; artist: string }
  photo: string
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
  background: #f4efe6;
  color: var(--green-deep);
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
  object-position: 50% 28%;
  pointer-events: none;
  user-select: none;
  filter: saturate(0.92) contrast(1.02) brightness(1.04);
  transform: scale(1.04);
}
.finale-shade {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(251, 248, 243, 0.78), rgba(244, 239, 230, 0.72)),
    radial-gradient(90% 60% at 50% 42%, rgba(234, 217, 204, 0.28), transparent 70%);
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
      0 6px 28px rgba(196, 174, 138, 0.28),
      0 0 0 rgba(232, 213, 163, 0);
  }
  50% {
    text-shadow:
      0 6px 28px rgba(196, 174, 138, 0.28),
      0 0 36px rgba(196, 174, 138, 0.45);
  }
}
.f-sub {
  font-family: var(--font-hand);
  font-size: 20px;
  letter-spacing: 0.28em;
  margin-top: 18px;
  color: var(--brown);
}
.f-addr {
  font-family: var(--font-hand);
  margin-top: 34px;
  font-size: 15px;
  color: var(--brown);
  letter-spacing: 0.1em;
}
.f-addr a {
  color: var(--ink-blue);
  text-decoration: none;
  border-bottom: 1px dotted var(--gold);
}
.music-note {
  position: absolute;
  bottom: 50px;
  left: 0;
  z-index: 2;
  width: 100%;
  font-size: 12px;
  color: rgba(92, 83, 72, 0.48);
  letter-spacing: 0.2em;
}
</style>

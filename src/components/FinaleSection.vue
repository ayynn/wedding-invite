<script setup lang="ts">
import type { Venue } from '@/types'

defineProps<{
  logoParts: string[]
  venue: Venue
  bgm: { title: string; artist: string }
}>()
</script>

<template>
  <footer class="finale">
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
        {{ venue.address }} · <a :href="venue.mapUrl" target="_blank" rel="noopener">点击查看地图</a>
      </p>
      <p class="music-note">♪ {{ bgm.title }} · {{ bgm.artist }} ｜ 可点击右下角音符开关</p>
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
  background:
    linear-gradient(180deg, rgba(16, 28, 22, 0.52), rgba(16, 28, 22, 0.72)),
    url('/imgs/venue_33.jpg') center / cover no-repeat fixed;
  color: var(--cream);
  position: relative;
}
.fv {
  font-family: 'Great Vibes', cursive;
  font-size: clamp(58px, 12vw, 100px);
  white-space: nowrap;
  animation: fvGlow 4s ease-in-out infinite;
}
.fv .amp {
  font-size: 0.55em;
  vertical-align: 0.2em;
  margin: 0 0.04em;
}
@keyframes fvGlow {
  0%, 100% {
    text-shadow: 0 6px 40px rgba(0, 0, 0, 0.6), 0 0 0 rgba(232, 213, 163, 0);
  }
  50% {
    text-shadow: 0 6px 40px rgba(0, 0, 0, 0.6), 0 0 44px rgba(232, 213, 163, 0.55);
  }
}
.f-sub {
  font-size: 15px;
  letter-spacing: 0.5em;
  margin-top: 18px;
  color: rgba(243, 236, 221, 0.85);
}
.f-addr {
  margin-top: 34px;
  font-size: 13px;
  color: rgba(243, 236, 221, 0.7);
  letter-spacing: 0.16em;
}
.f-addr a {
  color: var(--gold-light);
  text-decoration: none;
  border-bottom: 1px dotted var(--gold);
}
.music-note {
  position: absolute;
  bottom: 34px;
  width: 100%;
  font-size: 12px;
  color: rgba(243, 236, 221, 0.5);
  letter-spacing: 0.2em;
}
</style>

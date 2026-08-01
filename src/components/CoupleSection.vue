<script setup lang="ts">
import type { CoupleMember } from '@/types'
import SectionTitle from './SectionTitle.vue'

defineProps<{
  groom: CoupleMember
  bride: CoupleMember
  loveStory: string[]
}>()
</script>

<template>
  <section class="section couple">
    <div class="wrap">
      <SectionTitle en="Beloved Couple" cn="新人 · 情定于此" />
      <div class="couple-card">
        <div class="couple-item reveal">
          <div class="avatar">
            <span class="halo"></span>
            <div class="initials">{{ groom.initial }}</div>
          </div>
          <h3>{{ groom.initial }}<span class="cn">{{ groom.name }}</span></h3>
          <div class="line"></div>
          <p>{{ groom.motto }}</p>
        </div>
        <div class="ampersand reveal d1">&amp;</div>
        <div class="couple-item reveal d2">
          <div class="avatar">
            <span class="halo"></span>
            <div class="initials">{{ bride.initial }}</div>
          </div>
          <h3>{{ bride.initial }}<span class="cn">{{ bride.name }}</span></h3>
          <div class="line"></div>
          <p>{{ bride.motto }}</p>
        </div>
      </div>
      <p class="couple-love reveal d2">
        <template v-for="(line, i) in loveStory" :key="i">
          {{ line }}<br v-if="i < loveStory.length - 1" />
        </template>
      </p>
    </div>
  </section>
</template>

<style scoped>
.couple-card {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: stretch;
  margin-top: 44px;
}
.couple-item {
  flex: 1 1 260px;
  max-width: 330px;
  text-align: center;
  padding: 34px 22px;
  position: relative;
}
.avatar {
  width: 150px;
  height: 150px;
  margin: 0 auto 20px;
  border-radius: 50%;
  position: relative;
  border: 2px solid var(--gold);
  padding: 8px;
  background: var(--ivory);
  box-shadow: var(--shadow);
}
.initials {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 35% 30%, var(--gold-light), var(--gold) 70%);
  font-family: 'Great Vibes', cursive;
  font-size: 46px;
  color: #fff;
  text-shadow: 0 3px 12px rgba(120, 90, 40, 0.45);
}
.halo {
  position: absolute;
  inset: -16px;
  border: 1px dashed rgba(201, 168, 106, 0.5);
  border-radius: 50%;
  animation: ringSpin 30s linear infinite;
}
@keyframes ringSpin {
  to { transform: rotate(360deg); }
}
.couple-item h3 {
  font-size: clamp(24px, 5vw, 32px);
  font-family: 'Great Vibes', cursive;
  color: var(--green);
  font-weight: 600;
}
.couple-item h3 .cn {
  display: block;
  font-family: 'Noto Serif SC', serif;
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.3em;
  color: var(--green-deep);
  margin-top: 2px;
}
.couple-item p {
  color: var(--brown);
  font-size: 13px;
  letter-spacing: 0.22em;
  margin-top: 6px;
}
.line {
  width: 46px;
  height: 1px;
  background: var(--gold);
  margin: 14px auto;
}
.ampersand {
  flex: 0 0 auto;
  align-self: center;
  font-family: 'Great Vibes', cursive;
  font-size: 64px;
  color: var(--gold);
  padding: 0 18px;
  transform: rotate(-8deg);
  text-shadow: 0 6px 24px rgba(201, 168, 106, 0.4);
}
.couple-love {
  max-width: 620px;
  margin: 36px auto 0;
  text-align: center;
  color: #44544a;
  font-size: 15px;
  line-height: 2.2;
}
@media (max-width: 640px) {
  .ampersand {
    padding: 10px 0;
  }
}
</style>

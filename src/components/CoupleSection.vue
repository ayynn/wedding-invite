<script setup lang="ts">
defineOptions({ name: 'couple-section' })

import type { CoupleMember } from '@/types'
import SectionTitle from './SectionTitle.vue'

defineProps<{
  groom: CoupleMember
  bride: CoupleMember
  loveStory: string[]
  photo: string
}>()

function loveLineClass(line: string): string {
  if (!line.trim()) return ''
  return /[\u4e00-\u9fff]/.test(line) ? 'love-zh' : 'love-fr'
}
</script>

<template>
  <section class="section couple">
    <span class="tint tint-a" aria-hidden="true"></span>
    <span class="tint tint-b" aria-hidden="true"></span>

    <div class="wrap">
      <SectionTitle en="Beloved Couple" cn="新人 · 情定于此" />

      <figure class="portrait reveal">
        <span class="portrait-frame" aria-hidden="true"></span>
        <img class="glow" :src="photo" alt="" aria-hidden="true" />
        <img class="main soft-edge" :src="photo" alt="新人合影" loading="lazy" />
      </figure>

      <div class="names reveal d1">
        <div class="person">
          <span class="role">THE GROOM</span>
          <h3 class="initial">{{ groom.initial }}</h3>
          <p class="name couple-name">{{ groom.nameSpaced }}</p>
        </div>

        <div class="amp" aria-hidden="true">&amp;</div>

        <div class="person">
          <span class="role">THE BRIDE</span>
          <h3 class="initial">{{ bride.initial }}</h3>
          <p class="name couple-name">{{ bride.nameSpaced }}</p>
        </div>
      </div>

      <p class="love reveal d2">
        <template v-for="(line, i) in loveStory" :key="i">
          <span :class="loveLineClass(line)">{{ line }}</span>
          <br v-if="i < loveStory.length - 1" />
        </template>
      </p>
    </div>
  </section>
</template>

<style scoped>
.couple {
  background: linear-gradient(180deg, var(--cream) 0%, #f7f3ec 52%, var(--cream) 100%);
}

.tint {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(80px);
  z-index: 0;
}
.tint-a {
  width: 44vw;
  max-width: 440px;
  aspect-ratio: 1;
  left: -12%;
  top: 8%;
  background: rgba(234, 217, 204, 0.5);
}
.tint-b {
  width: 38vw;
  max-width: 380px;
  aspect-ratio: 1;
  right: -10%;
  bottom: 10%;
  background: rgba(196, 174, 138, 0.16);
}

.portrait {
  position: relative;
  margin: 44px auto 0;
  width: min(560px, calc(100% - 8px));
  aspect-ratio: 3 / 4;
}
.portrait-frame {
  position: absolute;
  inset: 14px;
  z-index: 2;
  border: 1px solid rgba(196, 174, 138, 0.5);
  border-radius: 22px;
  pointer-events: none;
  mix-blend-mode: multiply;
}
.portrait .main {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 22%;
  border-radius: 30px;
  filter: saturate(0.97) contrast(1.02);
}
.portrait .glow {
  position: absolute;
  inset: 5% 8%;
  z-index: 0;
  width: auto;
  height: auto;
  object-fit: cover;
  border-radius: 34px;
  filter: blur(30px) saturate(1.12);
  opacity: 0.38;
}

.names {
  margin: 40px auto 0;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: clamp(14px, 4vw, 40px);
  max-width: 560px;
}
.person {
  min-width: 0;
  text-align: center;
}
.role {
  display: block;
  font-family: var(--font-display-en);
  font-size: 11px;
  letter-spacing: 0.36em;
  text-indent: 0.36em;
  color: var(--brown);
}
.initial {
  margin-top: 10px;
  font-family: var(--font-script);
  font-size: clamp(34px, 8vw, 46px);
  font-weight: 400;
  line-height: 1;
  color: var(--ink-blue);
}
.name {
  margin-top: 8px;
  font-size: clamp(17px, 4vw, 21px);
  letter-spacing: 0.16em;
  color: var(--green-deep);
}
.amp {
  align-self: center;
  font-family: var(--font-script);
  font-size: clamp(38px, 9vw, 56px);
  line-height: 1;
  color: var(--gold);
}

.love {
  max-width: 640px;
  margin: 46px auto 0;
  text-align: center;
  color: var(--green-soft);
  font-size: 15.5px;
  line-height: 2;
}
.love-fr {
  font-family: 'Bodoni Moda', var(--font-display-en);
  font-style: italic;
  font-weight: 400;
  font-size: 1.08em;
  letter-spacing: 0.01em;
}
.love-zh {
  font-family: var(--font-serif);
  letter-spacing: 0.08em;
}

@media (max-width: 640px) {
  .portrait {
    margin-top: 32px;
  }
  .names {
    margin-top: 32px;
    gap: 12px;
  }
}
</style>

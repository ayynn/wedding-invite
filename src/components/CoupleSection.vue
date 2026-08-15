<script setup lang="ts">
defineOptions({ name: 'couple-section' })

import type { CoupleMember } from '@/types'
import SectionTitle from './SectionTitle.vue'

defineProps<{
  groom: CoupleMember
  bride: CoupleMember
  loveStory: string[]
  groomPhoto: string
  bridePhoto: string
}>()
</script>

<template>
  <section class="section couple">
    <span class="tint tint-a" aria-hidden="true"></span>
    <span class="tint tint-b" aria-hidden="true"></span>

    <div class="wrap">
      <SectionTitle en="Beloved Couple" cn="新人 · 情定于此" />

      <div class="duo">
        <article class="person groom reveal">
          <figure class="shot">
            <img class="glow" :src="groomPhoto" alt="" aria-hidden="true" />
            <img class="main soft-edge" :src="groomPhoto" :alt="`新郎 ${groom.name}`" loading="lazy" />
          </figure>
          <div class="meta">
            <span class="role">THE GROOM</span>
            <h3 class="initial">{{ groom.initial }}</h3>
            <p class="name couple-name">{{ groom.nameSpaced }}</p>
            <span class="rule"></span>
            <p class="motto">{{ groom.motto }}</p>
          </div>
        </article>

        <div class="amp reveal d1" aria-hidden="true">&amp;</div>

        <article class="person bride reveal d2">
          <figure class="shot">
            <img class="glow" :src="bridePhoto" alt="" aria-hidden="true" />
            <img class="main soft-edge" :src="bridePhoto" :alt="`新娘 ${bride.name}`" loading="lazy" />
          </figure>
          <div class="meta">
            <span class="role">THE BRIDE</span>
            <h3 class="initial">{{ bride.initial }}</h3>
            <p class="name couple-name">{{ bride.nameSpaced }}</p>
            <span class="rule"></span>
            <p class="motto">{{ bride.motto }}</p>
          </div>
        </article>
      </div>

      <p class="love reveal d2">
        <template v-for="(line, i) in loveStory" :key="i">
          {{ line }}<br v-if="i < loveStory.length - 1" />
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
  filter: blur(78px);
  z-index: 0;
}
.tint-a {
  width: 46vw;
  max-width: 460px;
  aspect-ratio: 1;
  left: -12%;
  top: 10%;
  background: rgba(234, 217, 204, 0.55);
}
.tint-b {
  width: 40vw;
  max-width: 400px;
  aspect-ratio: 1;
  right: -10%;
  bottom: 12%;
  background: rgba(196, 174, 138, 0.18);
}

.duo {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 36px;
}

.person {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
}

.shot {
  position: relative;
  width: min(720px, 100%);
  aspect-ratio: 3 / 4;
  padding: 0 18px;
  box-sizing: border-box;
}
.shot .main {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 18%;
  border-radius: 28px;
  filter: saturate(0.96) contrast(1.02);
}
.shot .glow {
  position: absolute;
  inset: 4% 8%;
  z-index: 0;
  width: auto;
  height: auto;
  object-fit: cover;
  border-radius: 32px;
  filter: blur(28px) saturate(1.15);
  opacity: 0.42;
}

.meta {
  text-align: center;
  min-width: 0;
  padding: 0 16px;
}
.role {
  display: block;
  font-family: var(--font-display-en);
  font-size: 11px;
  letter-spacing: 0.4em;
  color: var(--brown);
}
.initial {
  margin-top: 8px;
  font-family: var(--font-script);
  font-size: clamp(34px, 8vw, 52px);
  font-weight: 400;
  line-height: 1;
  color: var(--ink-blue);
}
.name {
  margin-top: 8px;
  font-size: clamp(18px, 4vw, 24px);
  letter-spacing: 0.16em;
  color: var(--green-deep);
}
.rule {
  display: block;
  width: 42px;
  height: 1px;
  margin: 14px auto 0;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
}
.motto {
  margin-top: 12px;
  font-family: var(--font-hand);
  font-size: 15px;
  letter-spacing: 0.1em;
  color: var(--brown);
}

.amp {
  font-family: var(--font-script);
  font-size: clamp(40px, 10vw, 68px);
  line-height: 1;
  color: var(--gold);
  transform: rotate(-8deg);
  text-shadow: 0 6px 24px rgba(196, 174, 138, 0.35);
}

.love {
  font-family: var(--font-hand);
  max-width: 620px;
  margin: 48px auto 0;
  text-align: center;
  color: var(--green-soft);
  font-size: 17px;
  line-height: 2.2;
  letter-spacing: 0.06em;
}

@media (max-width: 640px) {
  .duo {
    gap: 28px;
    margin-top: 28px;
  }
  .shot {
    padding: 0 10px;
  }
  .love {
    margin-top: 36px;
  }
}
</style>

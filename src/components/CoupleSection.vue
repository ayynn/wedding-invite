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
        <!-- 新郎：图左名右 -->
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

        <!-- 新娘：图右名左，向上错落 -->
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
  background: linear-gradient(180deg, var(--cream) 0%, #f4f1ea 52%, var(--cream) 100%);
}

/* 影棚蓝的呼应色斑，压在内容之下 */
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
  top: 14%;
  background: rgba(65, 83, 110, 0.16);
}
.tint-b {
  width: 40vw;
  max-width: 400px;
  aspect-ratio: 1;
  right: -10%;
  bottom: 12%;
  background: rgba(189, 167, 138, 0.2);
}

.duo {
  margin-top: 52px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: clamp(12px, 3vw, 34px);
}

.person {
  display: grid;
  gap: 18px;
  align-items: center;
}
/* 错落：新郎下沉，新娘上提，图文左右互换 */
.groom {
  grid-template-columns: 1.05fr 0.95fr;
  transform: translateY(26px);
}
.bride {
  grid-template-columns: 0.95fr 1.05fr;
  transform: translateY(-26px);
}
.bride .shot {
  order: 2;
}
.bride .meta {
  order: 1;
  text-align: right;
}
.bride .rule {
  margin-left: auto;
}

.shot {
  position: relative;
  aspect-ratio: 4 / 5;
}
.shot .main {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  filter: saturate(0.94) contrast(1.02);
}
/* 背后的模糊副本，让照片像化进纸面 */
.shot .glow {
  position: absolute;
  inset: -6%;
  z-index: 0;
  width: 112%;
  height: 112%;
  object-fit: cover;
  filter: blur(30px) saturate(1.25);
  opacity: 0.5;
  transform: scale(1.02);
}

.meta {
  min-width: 0;
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
  font-size: clamp(30px, 6.4vw, 46px);
  font-weight: 400;
  line-height: 1;
  color: var(--ink-blue);
}
.name {
  margin-top: 8px;
  font-size: clamp(17px, 3.4vw, 22px);
  letter-spacing: 0.16em;
  color: var(--green-deep);
}
.rule {
  display: block;
  width: 42px;
  height: 1px;
  margin-top: 14px;
  background: linear-gradient(90deg, var(--gold), transparent);
}
.bride .rule {
  background: linear-gradient(270deg, var(--gold), transparent);
}
.motto {
  margin-top: 12px;
  font-family: var(--font-hand);
  font-size: 14px;
  letter-spacing: 0.1em;
  color: var(--brown);
}

.amp {
  font-family: var(--font-script);
  font-size: clamp(40px, 8vw, 72px);
  line-height: 1;
  color: var(--gold);
  transform: rotate(-8deg);
  text-shadow: 0 6px 24px rgba(189, 167, 138, 0.4);
}

.love {
  font-family: var(--font-hand);
  max-width: 620px;
  margin: 64px auto 0;
  text-align: center;
  color: var(--green-soft);
  font-size: 17px;
  line-height: 2.2;
  letter-spacing: 0.06em;
}

@media (max-width: 860px) {
  .duo {
    grid-template-columns: 1fr;
    gap: 26px;
    margin-top: 40px;
  }
  .groom,
  .bride {
    transform: none;
    grid-template-columns: 1fr 1fr;
  }
  /* 竖屏保留左右错位，避免呆板 */
  .groom {
    margin-right: 8%;
  }
  .bride {
    margin-left: 8%;
  }
  .amp {
    justify-self: center;
  }
  .love {
    margin-top: 44px;
  }
}
</style>

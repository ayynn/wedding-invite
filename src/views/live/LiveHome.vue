<script setup lang="ts">
defineOptions({ name: 'live-home' })

import { weddingConfig } from '@/config/wedding'

const config = weddingConfig

interface LiveFeature {
  key: string
  routeName: string
  title: string
  en: string
  desc: string
  ready: boolean
  accent: string
}

const features: LiveFeature[] = [
  {
    key: 'wall',
    routeName: 'live-wall',
    title: '照片墙',
    en: 'Photo Wall',
    desc: '上传与欣赏现场精彩瞬间',
    ready: true,
    accent: '#2d4a36'
  },
  {
    key: 'guide',
    routeName: 'live-guide',
    title: '当天指引',
    en: 'Today Guide',
    desc: '流程、场地与温馨提示',
    ready: true,
    accent: '#8a7350'
  },
  {
    key: 'portraits',
    routeName: 'live-portraits',
    title: '婚纱照鉴赏',
    en: 'Portraits',
    desc: '新郎新娘婚纱照精选',
    ready: false,
    accent: '#a67c52'
  },
  {
    key: 'lottery',
    routeName: 'live-lottery',
    title: '幸运抽奖',
    en: 'Lottery',
    desc: '晚宴互动，好运连连',
    ready: false,
    accent: '#b0564a'
  },
  {
    key: 'games',
    routeName: 'live-games',
    title: '小游戏',
    en: 'Games',
    desc: '轻松互动，热闹加分',
    ready: false,
    accent: '#4a6b52'
  },
  {
    key: 'moments',
    routeName: 'live-moments',
    title: '实时瞬间',
    en: 'Live Moments',
    desc: '节日现场实时上传鉴赏',
    ready: false,
    accent: '#c9a86a'
  }
]
</script>

<template>
  <div class="live-home">
    <section class="hero">
      <p class="hero-kicker">WEDDING DAY</p>
      <h1 class="hero-title">{{ config.couple.names }}</h1>
      <p class="hero-date">{{ config.dateText }}</p>
      <p class="hero-sub">欢迎来到婚礼现场互动页，一起留下今日的欢喜。</p>
    </section>

    <section class="features" aria-label="现场功能">
      <RouterLink
        v-for="(item, index) in features"
        :key="item.key"
        class="feature"
        :class="{ soon: !item.ready }"
        :style="{ '--accent': item.accent, '--delay': `${index * 0.06}s` }"
        :to="{ name: item.routeName }"
      >
        <div class="feature-top">
          <span class="feature-en">{{ item.en }}</span>
          <span v-if="!item.ready" class="feature-badge">即将上线</span>
          <span v-else class="feature-badge ready">可用</span>
        </div>
        <h2 class="feature-title">{{ item.title }}</h2>
        <p class="feature-desc">{{ item.desc }}</p>
      </RouterLink>
    </section>
  </div>
</template>

<style scoped>
.live-home {
  padding: 18px 18px 28px;
  max-width: 720px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 28px 12px 34px;
  animation: riseIn 0.7s var(--ease) both;
}

.hero-kicker {
  font-family: var(--font-display-en);
  font-size: 13px;
  letter-spacing: 0.42em;
  color: var(--gold);
}

.hero-title {
  margin-top: 10px;
  font-family: var(--font-name);
  font-size: clamp(28px, 7vw, 38px);
  font-weight: 500;
  letter-spacing: 0.16em;
  color: var(--green-deep);
}

.hero-date {
  margin-top: 8px;
  font-size: 14px;
  letter-spacing: 0.12em;
  color: var(--brown);
}

.hero-sub {
  margin: 14px auto 0;
  max-width: 28em;
  font-family: var(--font-hand);
  font-size: 16px;
  letter-spacing: 0.08em;
  color: var(--green-soft);
  animation: fadeSoft 1.1s var(--ease) 0.15s both;
}

.features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.feature {
  position: relative;
  display: block;
  padding: 18px 16px 16px;
  text-decoration: none;
  color: inherit;
  border-radius: 16px;
  border: 1px solid rgba(201, 168, 106, 0.34);
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.72), rgba(250, 246, 238, 0.45));
  box-shadow: 0 10px 28px rgba(28, 46, 36, 0.06);
  overflow: hidden;
  opacity: 0;
  animation: riseIn 0.65s var(--ease) var(--delay) forwards;
  transition: transform 0.35s var(--ease), border-color 0.35s, box-shadow 0.35s;
}

.feature::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--accent);
  opacity: 0.85;
}

.feature:hover {
  transform: translateY(-3px);
  border-color: rgba(201, 168, 106, 0.7);
  box-shadow: 0 16px 34px rgba(28, 46, 36, 0.12);
}

.feature.soon {
  opacity: 0.92;
}

.feature-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.feature-en {
  font-family: var(--font-display-en);
  font-size: 12px;
  letter-spacing: 0.14em;
  color: var(--brown);
}

.feature-badge {
  flex-shrink: 0;
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--brown);
  border: 1px solid rgba(138, 115, 80, 0.35);
  padding: 2px 6px;
  border-radius: 6px;
}

.feature-badge.ready {
  color: var(--green);
  border-color: rgba(45, 74, 54, 0.35);
  background: rgba(45, 74, 54, 0.06);
}

.feature-title {
  font-family: var(--font-hand);
  font-size: 22px;
  font-weight: 400;
  letter-spacing: 0.14em;
  color: var(--green-deep);
}

.feature-desc {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.55;
  letter-spacing: 0.04em;
  color: var(--brown);
}

@keyframes riseIn {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes fadeSoft {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 420px) {
  .features {
    grid-template-columns: 1fr;
  }
}
</style>

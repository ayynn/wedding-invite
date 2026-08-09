<script setup lang="ts">
defineOptions({ name: 'live-guide' })

import { weddingConfig } from '@/config/wedding'
import TipIcon from '@/components/TipIcon.vue'

const config = weddingConfig
</script>

<template>
  <div class="live-guide">
    <header class="guide-head">
      <p class="guide-en">Today Guide</p>
      <h1 class="guide-title">当天指引</h1>
      <p class="guide-sub">跟着流程走，不慌不忙，尽兴就好</p>
    </header>

    <section class="panel">
      <h2 class="panel-title">今日流程</h2>
      <ol class="timeline">
        <li v-for="item in config.schedule" :key="item.time" class="timeline-item">
          <time class="time">{{ item.time }}</time>
          <div class="body">
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </div>
        </li>
      </ol>
    </section>

    <section class="panel">
      <h2 class="panel-title">场地信息</h2>
      <div class="venue">
        <p class="venue-name">{{ config.venue.name }}</p>
        <p class="venue-addr">{{ config.venue.address }}</p>
        <p class="venue-hint">{{ config.venue.transitHint }}</p>
        <a class="map-link" :href="config.venue.mapUrl" target="_blank" rel="noopener noreferrer">
          打开地图导航
        </a>
      </div>
    </section>

    <section class="panel">
      <h2 class="panel-title">温馨提示</h2>
      <ul class="tips">
        <li v-for="tip in config.tips" :key="tip.title" class="tip">
          <span class="tip-icon" aria-hidden="true">
            <TipIcon :name="tip.icon" />
          </span>
          <div>
            <h3>{{ tip.title }}</h3>
            <p>{{ tip.desc }}</p>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.live-guide {
  max-width: 720px;
  margin: 0 auto;
  padding: 12px 18px 36px;
}

.guide-head {
  text-align: center;
  padding: 18px 8px 28px;
  animation: riseIn 0.65s var(--ease) both;
}

.guide-en {
  font-family: var(--font-script);
  font-size: 34px;
  color: var(--gold);
  line-height: 1.1;
}

.guide-title {
  margin-top: 4px;
  font-family: var(--font-hand);
  font-size: 28px;
  font-weight: 400;
  letter-spacing: 0.2em;
}

.guide-sub {
  margin-top: 10px;
  font-size: 13px;
  letter-spacing: 0.08em;
  color: var(--brown);
}

.panel {
  margin-bottom: 16px;
  padding: 20px 18px;
  border-radius: 16px;
  border: 1px solid rgba(201, 168, 106, 0.3);
  background: rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(6px);
  animation: riseIn 0.7s var(--ease) both;
}

.panel:nth-of-type(2) {
  animation-delay: 0.06s;
}

.panel:nth-of-type(3) {
  animation-delay: 0.12s;
}

.panel-title {
  font-family: var(--font-hand);
  font-size: 20px;
  font-weight: 400;
  letter-spacing: 0.16em;
  margin-bottom: 16px;
  color: var(--green);
}

.timeline {
  list-style: none;
}

.timeline-item {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid rgba(201, 168, 106, 0.22);
}

.timeline-item:first-child {
  border-top: none;
  padding-top: 0;
}

.time {
  font-family: var(--font-display-en);
  font-size: 15px;
  letter-spacing: 0.06em;
  color: var(--gold);
  padding-top: 2px;
}

.body h3 {
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.08em;
}

.body p {
  margin-top: 4px;
  font-size: 13px;
  line-height: 1.65;
  color: var(--brown);
}

.venue-name {
  font-size: 16px;
  letter-spacing: 0.08em;
  font-weight: 500;
}

.venue-addr,
.venue-hint {
  margin-top: 6px;
  font-size: 13px;
  color: var(--brown);
  line-height: 1.65;
}

.map-link {
  display: inline-block;
  margin-top: 14px;
  padding: 10px 16px;
  border-radius: 12px;
  background: var(--green);
  color: var(--ivory);
  text-decoration: none;
  font-size: 13px;
  letter-spacing: 0.1em;
  transition: background 0.25s, transform 0.25s;
}

.map-link:hover {
  background: var(--green-deep);
  transform: translateY(-1px);
}

.tips {
  list-style: none;
  display: grid;
  gap: 14px;
}

.tip {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 10px;
  align-items: start;
}

.tip-icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: rgba(201, 168, 106, 0.14);
  color: var(--green);
}

.tip-icon :deep(svg) {
  width: 20px;
  height: 20px;
}

.tip h3 {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.08em;
}

.tip p {
  margin-top: 3px;
  font-size: 12px;
  line-height: 1.65;
  color: var(--brown);
}

@keyframes riseIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>

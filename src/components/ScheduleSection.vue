<script setup lang="ts">
import type { ScheduleItem } from '@/types'
import SectionTitle from './SectionTitle.vue'

defineProps<{
  items: ScheduleItem[]
}>()
</script>

<template>
  <section class="section schedule">
    <div class="wrap">
      <SectionTitle en="Wedding Schedule" cn="婚礼流程" />
      <div class="timeline">
        <div v-for="(item, i) in items" :key="item.time" class="t-item reveal" :class="i % 2 === 0 ? 'd0' : 'd1'">
          <div class="t-dot"></div>
          <div class="t-time">{{ item.time }}</div>
          <div class="t-title">{{ item.title }}</div>
          <div class="t-desc">{{ item.desc }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.timeline {
  position: relative;
  max-width: 640px;
  margin: 50px auto 0;
}
.timeline::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(180deg, transparent, var(--gold) 12%, var(--gold) 88%, transparent);
}
.t-item {
  position: relative;
  width: 50%;
  padding: 0 42px 52px;
}
.t-item:nth-child(odd) {
  left: 0;
  text-align: right;
}
.t-item:nth-child(even) {
  left: 50%;
  text-align: left;
}
.t-dot {
  position: absolute;
  top: 6px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--gold);
  box-shadow: 0 0 0 4px rgba(201, 168, 106, 0.16), 0 0 16px rgba(201, 168, 106, 0.2);
  z-index: 2;
  animation: dotPulse 3s ease-in-out infinite;
}
.t-item:nth-child(odd) .t-dot {
  right: -7px;
}
.t-item:nth-child(even) .t-dot {
  left: -7px;
}
@keyframes dotPulse {
  0%, 100% {
    box-shadow: 0 0 0 4px rgba(201, 168, 106, 0.16), 0 0 16px rgba(201, 168, 106, 0.2);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(201, 168, 106, 0.08), 0 0 22px rgba(201, 168, 106, 0.3);
  }
}
.t-time {
  font-family: var(--font-display-en);
  color: var(--gold);
  font-size: 26px;
  font-weight: 600;
}
.t-title {
  font-family: var(--font-hand);
  font-size: 20px;
  font-weight: 400;
  margin: 6px 0 4px;
  letter-spacing: 0.08em;
}
.t-desc {
  font-size: 13px;
  color: var(--brown);
  line-height: 1.9;
}
@media (max-width: 640px) {
  .timeline::before {
    left: 16px;
  }
  .t-item,
  .t-item:nth-child(odd),
  .t-item:nth-child(even) {
    width: 100%;
    left: 0;
    text-align: left;
    padding: 0 0 44px 52px;
  }
  .t-item:nth-child(odd) .t-dot,
  .t-item:nth-child(even) .t-dot {
    left: 10px;
    right: auto;
  }
}
</style>

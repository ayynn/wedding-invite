<script setup lang="ts">
defineOptions({ name: 'live-coming-soon' })

import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const meta = computed(() => ({
  title: String(route.meta.title || '敬请期待'),
  en: String(route.meta.en || 'Coming Soon'),
  desc: String(route.meta.desc || '该功能正在筹备中，婚礼当天见。')
}))

function goHome(): void {
  void router.push({ name: 'live-home' })
}
</script>

<template>
  <div class="coming">
    <p class="coming-en">{{ meta.en }}</p>
    <h1 class="coming-title">{{ meta.title }}</h1>
    <p class="coming-desc">{{ meta.desc }}</p>
    <button type="button" class="coming-btn" @click="goHome">返回现场首页</button>
  </div>
</template>

<style scoped>
.coming {
  max-width: 480px;
  margin: 0 auto;
  padding: 72px 24px 40px;
  text-align: center;
  animation: riseIn 0.7s var(--ease) both;
}

.coming-en {
  font-family: var(--font-script);
  font-size: 42px;
  color: var(--gold);
  line-height: 1.1;
}

.coming-title {
  margin-top: 8px;
  font-family: var(--font-hand);
  font-size: 30px;
  font-weight: 400;
  letter-spacing: 0.2em;
}

.coming-desc {
  margin-top: 16px;
  font-size: 14px;
  line-height: 1.8;
  letter-spacing: 0.06em;
  color: var(--brown);
}

.coming-btn {
  margin-top: 28px;
  padding: 12px 22px;
  border: 1px solid rgba(201, 168, 106, 0.55);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.65);
  color: var(--green);
  font-family: inherit;
  font-size: 14px;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition: 0.3s var(--ease);
}

.coming-btn:hover {
  background: var(--green);
  color: var(--ivory);
  border-color: var(--green);
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
</style>

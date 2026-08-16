<script setup lang="ts">
import type { TipItem } from '@/types'
import SectionTitle from './SectionTitle.vue'
import TipIcon from './TipIcon.vue'

defineProps<{
  items: TipItem[]
}>()
</script>

<template>
  <section class="section tips">
    <div class="wrap">
      <SectionTitle en="Good to Know" cn="温馨提示" />
      <div class="tips-grid">
        <div
          v-for="(tip, i) in items"
          :key="tip.title"
          class="tip-card reveal"
          :class="`d${i % 3}`"
        >
          <span class="ic"><TipIcon :name="tip.icon" /></span>
          <h4>{{ tip.title }}</h4>
          <p>{{ tip.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tips {
  background: linear-gradient(180deg, #f6f1e8, #f3ece3);
  color: var(--green-deep);
}
:deep(.sec-title-cn) {
  color: var(--green-deep);
}
.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 18px;
  margin-top: 44px;
}
.tip-card {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(196, 174, 138, 0.32);
  border-radius: var(--radius);
  padding: 28px 22px;
  text-align: center;
  transition: 0.5s;
}
.tip-card:hover {
  transform: translateY(-8px);
  background: #fff;
  border-color: var(--gold);
}
.ic {
  display: block;
  margin-bottom: 12px;
  color: var(--gold);
  transition: transform 0.4s;
}
.tip-card:hover .ic {
  transform: scale(1.1);
}
.tip-card h4 {
  font-family: var(--font-hand);
  font-size: 18px;
  font-weight: 400;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
}
.tip-card p {
  font-size: 12.5px;
  color: var(--brown);
  line-height: 1.9;
}
</style>

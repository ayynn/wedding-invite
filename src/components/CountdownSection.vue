<script setup lang="ts">
import { useCountdown } from '@/composables/useCountdown'
import SectionTitle from './SectionTitle.vue'

const props = defineProps<{
  target: string
  dateText: string
  dateSubText: string
}>()

const { days, hours, minutes, seconds, expired } = useCountdown(props.target)
</script>

<template>
  <section class="section countdown-sec">
    <div class="wrap">
      <SectionTitle en="Save the Date" cn="距婚礼还有" />
      <div class="countdown-box reveal">
        <div class="cd-item">
          <div class="num">{{ days }}</div>
          <div class="lab">天</div>
        </div>
        <div class="cd-item">
          <div class="num">{{ hours }}</div>
          <div class="lab">时</div>
        </div>
        <div class="cd-item">
          <div class="num">{{ minutes }}</div>
          <div class="lab">分</div>
        </div>
        <div class="cd-item">
          <div class="num">{{ seconds }}</div>
          <div class="lab">秒</div>
        </div>
      </div>
      <div class="cd-note reveal d1">{{ expired ? '今天就是我们的大喜之日 ♥' : dateSubText }}</div>
    </div>
  </section>
</template>

<style scoped>
.countdown-sec {
  background: linear-gradient(180deg, #f7f2ea, #f3ece2);
  color: var(--green-deep);
}
:deep(.sec-title-cn) {
  color: var(--green-deep);
}
.countdown-box {
  display: flex;
  justify-content: center;
  gap: clamp(10px, 3vw, 30px);
  margin-top: 40px;
  flex-wrap: wrap;
}
.cd-item {
  min-width: 86px;
  text-align: center;
}
.num {
  font-family: var(--font-display-en);
  font-size: clamp(40px, 8vw, 64px);
  font-weight: 600;
  color: var(--gold);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 24px rgba(196, 174, 138, 0.28);
}
.lab {
  font-family: var(--font-hand);
  font-size: 15px;
  letter-spacing: 0.2em;
  color: var(--brown);
  margin-top: 6px;
}
.cd-note {
  font-family: var(--font-hand);
  text-align: center;
  margin-top: 30px;
  color: var(--brown);
  font-size: 15px;
  letter-spacing: 0.14em;
}
</style>

<script setup lang="ts">
defineProps<{
  /** 是否正在播放 */
  playing: boolean
  /** 是否处于合成兜底模式 */
  fallback: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()
</script>

<template>
  <button
    class="music-btn"
    :class="{ paused: !playing }"
    :title="playing ? '关闭配乐' : '开启配乐'"
    :aria-label="playing ? '关闭配乐' : '开启配乐'"
    @click="emit('toggle')"
  >
    <span class="ic">♪</span>
  </button>
  <Transition name="ftip">
    <div v-if="fallback" class="fallback-tip">配乐源不可用，已切换为钢琴合成 ♪</div>
  </Transition>
</template>

<style scoped>
.music-btn {
  position: fixed;
  right: 20px;
  bottom: 22px;
  z-index: 90;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--green), var(--green-deep));
  color: var(--gold-light);
  border: 1px solid rgba(232, 213, 163, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(20, 40, 30, 0.35);
  transition: all 0.35s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.music-btn:hover {
  transform: scale(1.08);
}
.music-btn:active {
  transform: scale(0.93);
  transition: all 0.1s;
}
.ic {
  font-size: 23px;
  line-height: 1;
  transition: transform 0.5s;
}
.music-btn:not(.paused) .ic {
  animation: icSpin 4s linear infinite;
}
@keyframes icSpin {
  from { transform: rotate(0); }
  to { transform: rotate(360deg); }
}
.music-btn.paused {
  opacity: 0.75;
}
.music-btn.paused .ic {
  opacity: 0.6;
}
.fallback-tip {
  position: fixed;
  right: 20px;
  bottom: 86px;
  z-index: 90;
  padding: 8px 14px;
  border-radius: 24px;
  background: rgba(250, 246, 238, 0.92);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(201, 168, 106, 0.5);
  font-size: 12px;
  color: var(--green-deep);
  box-shadow: 0 6px 20px rgba(20, 40, 30, 0.18);
}
.ftip-enter-active,
.ftip-leave-active {
  transition: opacity 0.4s, transform 0.4s;
}
.ftip-enter-from,
.ftip-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
@media (max-width: 640px) {
  .music-btn {
    right: 16px;
    bottom: 20px;
  }
  .fallback-tip {
    right: 16px;
    bottom: 84px;
  }
}
</style>

<script setup lang="ts">
defineOptions({ name: 'export-long-image-button' })

defineProps<{
  exporting: boolean
  variant?: 'light' | 'dark'
}>()

const emit = defineEmits<{
  (e: 'export'): void
}>()
</script>

<template>
  <button
    type="button"
    class="export-btn no-export"
    :class="[variant || 'light', { busy: exporting }]"
    :disabled="exporting"
    @click="emit('export')"
  >
    <span class="export-ic" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    </span>
    {{ exporting ? '生成长图中…' : '导出邀请长图' }}
  </button>
</template>

<style scoped>
.export-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 60px;
  font-family: inherit;
  font-size: 14px;
  letter-spacing: 0.28em;
  cursor: pointer;
  transition: 0.35s var(--ease);
}

.export-btn.light {
  border: 1px solid rgba(201, 168, 106, 0.65);
  background: transparent;
  color: var(--green);
}

.export-btn.light:hover:not(:disabled) {
  background: rgba(201, 168, 106, 0.12);
  border-color: var(--gold);
  color: var(--green-deep);
  transform: translateY(-2px);
}

.export-btn.dark {
  border: 1px solid rgba(232, 213, 163, 0.55);
  background: rgba(250, 246, 238, 0.08);
  color: var(--gold-bright);
}

.export-btn.dark:hover:not(:disabled) {
  background: rgba(250, 246, 238, 0.16);
  border-color: var(--gold-light);
  transform: translateY(-2px);
}

.export-btn:disabled,
.export-btn.busy {
  opacity: 0.7;
  cursor: wait;
  transform: none;
}

.export-ic {
  width: 18px;
  height: 18px;
  display: inline-flex;
  margin-right: -0.2em;
}

.export-ic svg {
  width: 100%;
  height: 100%;
}
</style>

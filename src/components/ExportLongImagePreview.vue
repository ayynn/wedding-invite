<script setup lang="ts">
defineOptions({ name: 'export-long-image-preview' })

defineProps<{
  show: boolean
  imageUrl: string
  error: string
  exporting: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save'): void
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="preview-mask no-export"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-preview-title"
      @click.self="emit('close')"
    >
      <div class="preview-panel">
        <p id="export-preview-title" class="preview-title">邀请函长图</p>
        <p v-if="error" class="preview-err">{{ error }}</p>
        <template v-else>
          <p class="preview-desc">可保存到相册，或长按图片保存后发给好友</p>
          <div class="preview-scroll">
            <img v-if="imageUrl" class="preview-img" :src="imageUrl" alt="婚礼邀请函长图" />
          </div>
          <div class="preview-actions">
            <button type="button" class="btn-save" :disabled="!imageUrl || exporting" @click="emit('save')">
              保存图片
            </button>
            <button type="button" class="btn-close" @click="emit('close')">关闭</button>
          </div>
        </template>
        <button v-if="error" type="button" class="btn-close sole" @click="emit('close')">知道了</button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.preview-mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(16, 26, 20, 0.62);
  animation: fadeIn 0.25s ease both;
}

.preview-panel {
  width: min(420px, 100%);
  max-height: min(88dvh, 860px);
  display: flex;
  flex-direction: column;
  padding: 20px 16px 16px;
  background: #fffaf2;
  border: 1px solid rgba(201, 168, 106, 0.4);
  border-radius: 18px;
  box-shadow: 0 20px 50px rgba(16, 26, 20, 0.28);
  animation: panelIn 0.35s var(--ease) both;
}

.preview-title {
  text-align: center;
  font-size: 18px;
  letter-spacing: 0.22em;
  color: var(--green-deep);
  font-weight: 500;
}

.preview-desc {
  margin-top: 8px;
  text-align: center;
  font-size: 13px;
  color: var(--brown);
  letter-spacing: 0.06em;
}

.preview-err {
  margin-top: 18px;
  text-align: center;
  font-size: 14px;
  color: #b0564a;
  letter-spacing: 0.06em;
  line-height: 1.7;
}

.preview-scroll {
  margin-top: 14px;
  flex: 1;
  min-height: 0;
  overflow: auto;
  border-radius: 12px;
  background: rgba(250, 246, 238, 0.8);
  border: 1px solid rgba(201, 168, 106, 0.25);
}

.preview-img {
  display: block;
  width: 100%;
  height: auto;
}

.preview-actions {
  margin-top: 14px;
  display: grid;
  gap: 10px;
}

.btn-save,
.btn-close {
  font: inherit;
  cursor: pointer;
  padding: 12px 14px;
  border-radius: 60px;
  letter-spacing: 0.16em;
}

.btn-save {
  border: none;
  background: var(--green);
  color: var(--ivory);
  box-shadow: 0 8px 20px rgba(45, 74, 54, 0.25);
}

.btn-save:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-close {
  border: 1px solid rgba(45, 74, 54, 0.22);
  background: transparent;
  color: var(--green-deep);
}

.btn-close.sole {
  margin-top: 18px;
  width: 100%;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes panelIn {
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

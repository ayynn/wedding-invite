<script setup lang="ts">
defineOptions({ name: 'live-wall' })

import PhotoWallSection from '@/components/PhotoWallSection.vue'
import { weddingConfig } from '@/config/wedding'

const config = weddingConfig
</script>

<template>
  <div class="live-wall">
    <PhotoWallSection
      :endpoint="config.api.wallEndpoint"
      :max-size="config.wall.maxSize"
      :max-bytes="config.wall.maxBytes"
      :title="config.wall.title"
      :en="config.wall.en"
      :sub="config.wall.sub"
    />
  </div>
</template>

<style scoped>
.live-wall :deep(.section.wall) {
  padding-top: 36px;
  padding-bottom: 48px;
  background: transparent;
}

.live-wall :deep(.wall-form) {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(8px);
}
</style>

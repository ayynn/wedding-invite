<script setup lang="ts">
defineOptions({ name: 'live-portraits' })

import PhotoWallSection from '@/components/PhotoWallSection.vue'
import { weddingConfig } from '@/config/wedding'

const config = weddingConfig
</script>

<template>
  <div class="live-portraits">
    <PhotoWallSection
      :endpoint="config.api.wallEndpoint"
      :max-size="config.wall.maxSize"
      :max-bytes="config.wall.maxBytes"
      :title="config.portraitsAlbum.title"
      :en="config.portraitsAlbum.en"
      :sub="config.portraitsAlbum.sub"
      album="portrait"
      :allow-upload="false"
      :require-login="true"
    />
  </div>
</template>

<style scoped>
.live-portraits :deep(.section.wall) {
  padding-top: 36px;
  padding-bottom: 48px;
  background: transparent;
}
</style>

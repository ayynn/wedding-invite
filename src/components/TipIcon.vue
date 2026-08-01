<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: 'location' | 'home' | 'attire' | 'camera' | 'love' | 'phone'
}>()

const paths = computed<Record<typeof props.name, string>>(() => ({
  location:
    '<circle cx="12" cy="9" r="4"/><path d="M12 2C7 2 3 6 3 11c0 7 9 13 9 13s9-6 9-13c0-5-4-9-9-9z"/>',
  home: '<path d="M3 10l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V10z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  attire:
    '<path d="M12 2a3 3 0 013 3v3a3 3 0 01-3 3 3 3 0 01-3-3V5a3 3 0 013-3z"/><path d="M9 8H6a2 2 0 00-2 2v2a2 2 0 002 2h1M15 8h3a2 2 0 012 2v2a2 2 0 01-2 2h-1"/>',
  camera:
    '<rect x="2" y="5" width="20" height="15" rx="2"/><circle cx="12" cy="12" r="4"/>',
  love:
    '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>',
  phone:
    '<path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 018.82 18.85a19.5 19.5 0 01-6-6A19.79 19.79 0 014.11 4a2 2 0 012-2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>'
}))
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    width="38"
    height="38"
    v-html="paths[name]"
  ></svg>
</template>

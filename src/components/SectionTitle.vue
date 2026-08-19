<script setup lang="ts">
defineProps<{
  en: string;
  cn: string;
  sub?: string;
}>();
</script>

<template>
  <h2 class="sec-title-en">{{ en }}</h2>
  <div class="divider"><i>❦</i></div>
  <p
    v-if="sub"
    class="sec-sub reveal"
  >
    {{ sub }}
  </p>
</template>

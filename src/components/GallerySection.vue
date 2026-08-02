<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { GalleryItem } from '@/types'
import SectionTitle from './SectionTitle.vue'

const props = defineProps<{
  items: GalleryItem[]
}>()

/** 记录每张图的加载失败状态 */
const failed = ref<boolean[]>(props.items.map(() => false))

const onImgError = (i: number): void => {
  failed.value[i] = true
}

/* ---------- 灯箱状态 ---------- */
const lightboxOpen = ref(false)
const activeIndex = ref(0)
const imgFailed = ref(false)

const openLightbox = (i: number): void => {
  activeIndex.value = i
  imgFailed.value = false
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden'
}
const closeLightbox = (): void => {
  lightboxOpen.value = false
  document.body.style.overflow = ''
}
const step = (dir: number): void => {
  const next = (activeIndex.value + dir + props.items.length) % props.items.length
  openLightbox(next)
}

const onKeydown = (e: KeyboardEvent): void => {
  if (!lightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') step(-1)
  if (e.key === 'ArrowRight') step(1)
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <section class="section gallery">
    <div class="wrap">
      <SectionTitle en="The Venue" cn="爱在 · 阿丽那野奢庄园" sub="上海浦东新区笋王路168号 · 隐于森林的梦中庄园" />
      <div class="gallery-grid">
        <div
          v-for="(item, i) in items"
          :key="item.src"
          class="g-item reveal"
          :class="[item.span]"
          :style="{ transitionDelay: `${(i % 4) * 0.08}s` }"
          @click="openLightbox(i)"
        >
          <img
            v-if="!failed[i]"
            :src="item.src"
            :alt="item.caption"
            loading="lazy"
            @error="onImgError(i)"
          />
          <div v-else class="img-err">❦</div>
          <div class="cap">{{ item.caption }}</div>
        </div>
      </div>
      <p class="sec-sub reveal d1" style="margin-top: 30px">— 轻触图片可查看大图 —</p>
    </div>

    <!-- 灯箱 -->
    <Transition name="lb">
      <div v-if="lightboxOpen" class="lightbox" @click.self="closeLightbox">
        <button class="lb-x" @click="closeLightbox">✕</button>
        <img v-if="!imgFailed" :src="items[activeIndex].src" :alt="items[activeIndex].caption" @error="imgFailed = true" />
        <div v-else class="lb-err">❦<br />图片加载失败</div>
        <div class="lb-cap">{{ items[activeIndex].caption }}</div>
        <button class="lb-prev" @click.stop="step(-1)">‹</button>
        <button class="lb-next" @click.stop="step(1)">›</button>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.gallery {
  background: var(--ivory);
}
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 14px;
  margin-top: 46px;
}
.g-item {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius);
  cursor: pointer;
  box-shadow: 0 8px 26px rgba(28, 46, 36, 0.14);
  background: #e8e2d4;
}
.g-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1s cubic-bezier(0.2, 0.6, 0.2, 1), filter 0.8s;
  display: block;
}
.g-item:hover img {
  transform: scale(1.09);
  filter: brightness(1.05);
}
.g-item::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 55%, rgba(20, 36, 28, 0.55));
  opacity: 0;
  transition: 0.5s;
}
.g-item:hover::after {
  opacity: 1;
}
.cap {
  position: absolute;
  left: 16px;
  bottom: 12px;
  z-index: 2;
  color: var(--ivory);
  font-size: 13px;
  letter-spacing: 0.18em;
  opacity: 0;
  transform: translateY(10px);
  transition: 0.5s;
}
.g-item:hover .cap {
  opacity: 1;
  transform: none;
}
.g-1 {
  grid-column: span 8;
  height: 340px;
}
.g-2 {
  grid-column: span 4;
  height: 340px;
}
.img-err {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--gold-light), var(--gold));
  color: #fff;
  font-size: 30px;
  font-family: var(--font-script);
}

/* 灯箱 */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 99;
  background: rgba(12, 22, 17, 0.92);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16px;
}
.lightbox img {
  max-width: min(92vw, 1000px);
  max-height: 78vh;
  border-radius: 14px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
}
.lb-err {
  color: var(--gold-light);
  font-size: 40px;
  text-align: center;
  line-height: 1.8;
}
.lb-cap {
  color: var(--gold-light);
  font-size: 14px;
  letter-spacing: 0.24em;
}
.lb-x {
  position: absolute;
  top: 26px;
  right: 30px;
  color: var(--ivory);
  font-size: 34px;
  cursor: pointer;
  transition: 0.3s;
  background: none;
  border: none;
}
.lb-x:hover {
  color: var(--gold);
  transform: rotate(90deg);
}
.lb-prev,
.lb-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(232, 213, 163, 0.4);
  color: var(--gold-light);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  font-size: 22px;
  cursor: pointer;
  transition: 0.3s;
}
.lb-prev {
  left: 20px;
}
.lb-next {
  right: 20px;
}
.lb-prev:hover,
.lb-next:hover {
  background: var(--gold);
  color: #1c2e24;
}
.lb-enter-active,
.lb-leave-active {
  transition: opacity 0.45s ease;
}
.lb-enter-from,
.lb-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .g-1,
  .g-2 {
    grid-column: span 12;
    height: 230px;
  }
  .gallery-grid {
    gap: 10px;
  }
}
</style>

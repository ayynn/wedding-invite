<script setup lang="ts">
defineOptions({ name: 'photo-wall-section' })

import { reactive, ref, nextTick, onMounted, onUnmounted } from 'vue'
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import PhotoSwipe from 'photoswipe'
import 'photoswipe/style.css'
import type { WallItem } from '@/types'
import { fetchWall, likeWall, uploadWall } from '@/api/client'
import SectionTitle from './SectionTitle.vue'

const props = defineProps<{
  endpoint: string
  maxSize: number
  maxBytes: number
  title: string
  en: string
  sub: string
}>()

const LIKED_KEY = 'wedding_wall_liked'

/* ---------- 列表 ---------- */
const items = ref<WallItem[]>([])
const loading = ref(true)
const loadError = ref('')

/* ---------- 上传表单 ---------- */
const form = reactive({ name: '', caption: '' })
const fileInput = ref<HTMLInputElement | null>(null)
const pickedName = ref('')
const uploading = ref(false)
const uploadError = ref('')
const uploadOk = ref(false)

let lightbox: PhotoSwipeLightbox | null = null
let liking = false

function readLikedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(LIKED_KEY)
    const arr = raw ? (JSON.parse(raw) as string[]) : []
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

function writeLikedIds(ids: Set<string>): void {
  try {
    localStorage.setItem(LIKED_KEY, JSON.stringify([...ids]))
  } catch {
    /* ignore */
  }
}

function getItemByIndex(index: number): WallItem | undefined {
  return items.value[index]
}

function syncLikeUi(el: HTMLElement, item: WallItem | undefined): void {
  const liked = item ? readLikedIds().has(item.id) : false
  const count = item?.likes ?? 0
  el.classList.toggle('is-liked', liked)
  el.setAttribute('title', liked ? '已点赞' : '点赞')
  el.setAttribute('aria-label', liked ? `已点赞 ${count}` : `点赞 ${count}`)
  const countEl = el.querySelector('.pswp__like-num')
  if (countEl) countEl.textContent = String(count)
}

function initLightbox(): void {
  lightbox?.destroy()
  lightbox = new PhotoSwipeLightbox({
    gallery: '#wall-gallery',
    children: 'a',
    pswpModule: PhotoSwipe,
    bgOpacity: 0.92,
    showHideAnimationType: 'zoom'
  })

  lightbox.on('uiRegister', () => {
    const pswp = lightbox?.pswp
    if (!pswp) return

    pswp.ui?.registerElement({
      name: 'likeButton',
      order: 8,
      isButton: true,
      appendTo: 'bar',
      html: {
        isCustomSVG: true,
        inner:
          '<path d="M12 21s-6.2-4.35-9.05-8.1C1.1 10.7 1 7.9 2.7 6.1 4.3 4.4 6.9 4.5 8.6 6.2L12 9.7l3.4-3.5c1.7-1.7 4.3-1.8 5.9-.1 1.7 1.8 1.6 4.6-.25 6.8C18.2 16.65 12 21 12 21z" id="pswp__icn-heart"/>',
        outlineID: 'pswp__icn-heart'
      },
      onInit: (el, pswpInstance) => {
        el.classList.add('pswp__button--like')
        const num = document.createElement('span')
        num.className = 'pswp__like-num'
        num.textContent = '0'
        el.appendChild(num)

        const refresh = () => {
          syncLikeUi(el, getItemByIndex(pswpInstance.currIndex))
        }
        pswpInstance.on('change', refresh)
        pswpInstance.on('openingAnimationStart', refresh)
        refresh()
      },
      onClick: async (_e, el, pswpInstance) => {
        const item = getItemByIndex(pswpInstance.currIndex)
        if (!item || liking) return
        const liked = readLikedIds()
        if (liked.has(item.id)) return
        liking = true
        try {
          const res = await likeWall(props.endpoint, item.id)
          item.likes = res.likes
          liked.add(item.id)
          writeLikedIds(liked)
          syncLikeUi(el, item)
        } catch (err) {
          console.warn('[Wall] 点赞失败:', err)
        } finally {
          liking = false
        }
      }
    })
  })

  lightbox.init()
}

async function loadWall(): Promise<void> {
  loading.value = true
  try {
    items.value = await fetchWall(props.endpoint)
    loadError.value = ''
  } catch (err) {
    loadError.value = '图片墙暂时无法加载'
    console.warn('[Wall] 加载失败:', err)
  } finally {
    loading.value = false
  }
  // 确保 v-if 渲染出 #wall-gallery 后再初始化 PhotoSwipe
  await nextTick()
  initLightbox()
}

/** canvas 压缩图片为 JPEG base64，返回数据与宽高 */
function compressImage(
  file: File,
  maxSize: number
): Promise<{ image: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const w = Math.max(1, Math.round(img.width * scale))
        const h = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('canvas 不可用'))
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        resolve({ image: canvas.toDataURL('image/jpeg', 0.82), width: w, height: h })
      }
      img.onerror = () => reject(new Error('图片解析失败'))
      img.src = reader.result as string
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}

function onPick(): void {
  const f = fileInput.value?.files?.[0]
  pickedName.value = f ? f.name : ''
}

async function onSubmit(): Promise<void> {
  const file = fileInput.value?.files?.[0]
  if (!file) {
    uploadError.value = '请选择一张照片'
    return
  }
  if (file.size > props.maxBytes) {
    const mb = Math.round(props.maxBytes / (1024 * 1024))
    uploadError.value = `图片超过 ${mb}MB，请换一张小一点的`
    return
  }
  if (!form.name.trim()) {
    uploadError.value = '请填写您的昵称'
    return
  }
  uploading.value = true
  uploadError.value = ''
  try {
    const { image, width, height } = await compressImage(file, props.maxSize)
    if (Math.round(image.length * 0.75) > props.maxBytes) {
      uploadError.value = '图片压缩后仍过大，请更换图片'
      return
    }
    await uploadWall(props.endpoint, {
      name: form.name.trim(),
      caption: form.caption.trim(),
      image,
      width,
      height
    })
    uploadOk.value = true
    form.name = ''
    form.caption = ''
    pickedName.value = ''
    if (fileInput.value) fileInput.value.value = ''
    await loadWall()
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('(413)') || msg.includes('EXCEED_MAX_PAYLOAD_SIZE')) {
      uploadError.value = '图片过大，请换一张更小的照片后重试'
    } else {
      uploadError.value = '上传失败，请稍后重试'
    }
    console.warn('[Wall] 上传失败:', err)
  } finally {
    uploading.value = false
  }
}

onMounted(loadWall)
onUnmounted(() => {
  lightbox?.destroy()
  lightbox = null
})
</script>

<template>
  <section class="section wall">
    <div class="wrap">
      <SectionTitle :en="en" :cn="title" :sub="sub" />

      <!-- 上传表单 -->
      <form class="wall-form reveal" @submit.prevent="onSubmit">
        <div class="row">
          <input v-model="form.name" type="text" placeholder="您的昵称 *" maxlength="20" />
          <input v-model="form.caption" type="text" placeholder="写一句话（可选）" maxlength="60" />
        </div>
        <div class="file-row">
          <label class="file-pick" :class="{ picked: pickedName }">
            {{ pickedName || '✦ 选择照片' }}
            <input ref="fileInput" type="file" accept="image/*" hidden @change="onPick" />
          </label>
          <button class="upload-btn" type="submit" :disabled="uploading">
            {{ uploading ? '上传中…' : '上传到图片墙' }}
          </button>
        </div>
        <p v-if="uploadError" class="form-err">{{ uploadError }}</p>
        <p v-if="uploadOk" class="form-ok-tip">感谢分享，照片已上墙 ♥</p>
      </form>

      <!-- 瀑布流 -->
      <div v-if="loading" class="wall-loading reveal">正在加载爱的瞬间…</div>
      <p v-else-if="loadError" class="wall-err reveal">{{ loadError }}</p>
      <div v-else-if="items.length" id="wall-gallery" class="wall-masonry reveal">
        <a
          v-for="(it, i) in items"
          :key="it.id"
          class="wall-item"
          :href="it.url"
          :data-pswp-width="it.width"
          :data-pswp-height="it.height"
          :style="{ animationDelay: `${Math.min(i, 8) * 0.05}s` }"
        >
          <img :src="it.url" :alt="it.caption || it.name" loading="lazy" />
          <span class="wall-likes" aria-label="点赞数">♥ {{ it.likes ?? 0 }}</span>
          <div class="wall-meta">
            <b>{{ it.name }}</b>
            <span v-if="it.caption">{{ it.caption }}</span>
          </div>
        </a>
      </div>
      <p v-else class="wall-empty reveal">墙上还没有照片，来分享你们的笑脸吧 ♥</p>
    </div>
  </section>
</template>

<style scoped>
.wall {
  background: var(--cream);
}
.wall-form {
  max-width: 560px;
  margin: 40px auto 0;
  background: #fff;
  border: 1px solid rgba(201, 168, 106, 0.3);
  border-radius: var(--radius);
  padding: 22px;
  box-shadow: 0 8px 26px rgba(28, 46, 36, 0.08);
}
.wall-form .row {
  display: flex;
  gap: 12px;
}
.wall-form input[type='text'] {
  flex: 1;
  min-width: 0;
  padding: 13px 15px;
  border: 1px solid rgba(201, 168, 106, 0.45);
  border-radius: 12px;
  background: rgba(250, 246, 238, 0.6);
  font-family: inherit;
  font-size: 14px;
  color: var(--green-deep);
  transition: 0.3s;
  outline: none;
}
.wall-form input[type='text']:focus {
  border-color: var(--gold);
  box-shadow: 0 0 0 4px rgba(201, 168, 106, 0.15);
  background: #fff;
}
.file-row {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}
.file-pick {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 13px;
  border: 1px dashed rgba(201, 168, 106, 0.6);
  border-radius: 12px;
  font-size: 13px;
  color: var(--brown);
  cursor: pointer;
  transition: 0.3s;
  background: rgba(250, 246, 238, 0.4);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.file-pick:hover {
  border-color: var(--gold);
  background: rgba(201, 168, 106, 0.1);
}
.file-pick.picked {
  border-style: solid;
  border-color: var(--gold);
  color: var(--green);
}
.upload-btn {
  padding: 13px 22px;
  border: none;
  border-radius: 12px;
  background: var(--green);
  color: var(--ivory);
  font-family: inherit;
  font-size: 14px;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: 0.3s;
  white-space: nowrap;
}
.upload-btn:hover {
  background: var(--green-deep);
  transform: translateY(-2px);
}
.upload-btn:disabled {
  opacity: 0.6;
  cursor: wait;
  transform: none;
}
.form-err {
  margin-top: 12px;
  color: #b0564a;
  font-size: 13px;
}
.form-ok-tip {
  margin-top: 12px;
  color: var(--green);
  font-size: 13px;
  letter-spacing: 0.06em;
}

/* 瀑布流 */
.wall-masonry {
  margin-top: 44px;
  column-count: 3;
  column-gap: 14px;
}
.wall-item {
  display: block;
  position: relative;
  break-inside: avoid;
  margin-bottom: 14px;
  border-radius: 14px;
  overflow: hidden;
  background: #e8e2d4;
  box-shadow: 0 8px 22px rgba(28, 46, 36, 0.1);
  opacity: 0;
  animation: wallIn 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
  transition: transform 0.5s, box-shadow 0.5s;
}
@keyframes wallIn {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.wall-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 34px rgba(28, 46, 36, 0.16);
}
.wall-item img {
  width: 100%;
  display: block;
  transition: transform 0.8s;
}
.wall-item:hover img {
  transform: scale(1.05);
}
.wall-likes {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(16, 26, 20, 0.5);
  color: #fff;
  font-size: 12px;
  letter-spacing: 0.04em;
  backdrop-filter: blur(4px);
}
.wall-meta {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 26px 14px 12px;
  background: linear-gradient(180deg, transparent, rgba(16, 26, 20, 0.72));
  color: var(--ivory);
  opacity: 0;
  transform: translateY(8px);
  transition: 0.4s;
}
.wall-item:hover .wall-meta {
  opacity: 1;
  transform: none;
}
.wall-meta b {
  display: block;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.12em;
}
.wall-meta span {
  display: block;
  font-size: 12px;
  opacity: 0.85;
  margin-top: 2px;
}
.wall-loading,
.wall-empty,
.wall-err {
  text-align: center;
  color: var(--brown);
  font-size: 14px;
  letter-spacing: 0.1em;
  margin-top: 44px;
  padding: 40px 0;
}
.wall-err {
  color: #b0564a;
}

@media (max-width: 640px) {
  .wall-masonry {
    column-count: 2;
    column-gap: 10px;
  }
  .wall-item {
    margin-bottom: 10px;
  }
  .wall-form .row {
    flex-direction: column;
    gap: 0;
  }
  .wall-form input[type='text'] {
    margin-bottom: 10px;
  }
}
</style>

<!-- PhotoSwipe 顶栏点赞按钮（非 scoped，挂在 lightbox 根节点） -->
<style>
.pswp__button--like {
  position: relative;
  color: #fff;
}
.pswp__button--like .pswp__icn {
  fill: rgba(255, 255, 255, 0.92);
}
.pswp__button--like.is-liked .pswp__icn {
  fill: #e8a0a0;
}
.pswp__like-num {
  position: absolute;
  top: 6px;
  right: 4px;
  min-width: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 10px;
  line-height: 14px;
  text-align: center;
  pointer-events: none;
}
</style>

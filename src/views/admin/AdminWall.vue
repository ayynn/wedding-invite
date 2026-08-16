<script setup lang="ts">
defineOptions({ name: 'admin-wall' })

import { computed, onMounted, reactive, ref } from 'vue'
import { weddingConfig } from '@/config/wedding'
import { deleteWall, deleteWallBatch, fetchWall, updateWall, uploadWall } from '@/api/client'
import type { WallItem } from '@/types'

const endpoint = weddingConfig.api.wallEndpoint
const maxSize = weddingConfig.wall.maxSize
const maxBytes = weddingConfig.wall.maxBytes

const list = ref<WallItem[]>([])
const loading = ref(false)
const error = ref('')
const saving = ref(false)
const batching = ref(false)
const showForm = ref(false)
const editingId = ref<string | null>(null)
const selected = ref<Set<string>>(new Set())

const form = reactive({
  name: '',
  caption: '',
  image: '',
  width: 1280,
  height: 853
})

const selectableIds = computed(() => list.value.map((i) => i.id))
const allSelected = computed(
  () => selectableIds.value.length > 0 && selectableIds.value.every((id) => selected.value.has(id))
)
const selectedCount = computed(() => selected.value.size)

async function load(): Promise<void> {
  loading.value = true
  error.value = ''
  selected.value = new Set()
  try {
    list.value = await fetchWall(endpoint)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
    list.value = []
  } finally {
    loading.value = false
  }
}

function resetForm(): void {
  form.name = ''
  form.caption = ''
  form.image = ''
  form.width = 1280
  form.height = 853
  editingId.value = null
  showForm.value = false
}

function openCreate(): void {
  resetForm()
  showForm.value = true
}

function openEdit(item: WallItem): void {
  editingId.value = item.id
  form.name = item.name
  form.caption = item.caption
  form.image = ''
  form.width = item.width
  form.height = item.height
  showForm.value = true
}

function toggleOne(id: string, checked: boolean): void {
  const next = new Set(selected.value)
  if (checked) next.add(id)
  else next.delete(id)
  selected.value = next
}

function toggleAll(checked: boolean): void {
  selected.value = checked ? new Set(selectableIds.value) : new Set()
}

function compressImage(file: File): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('读取图片失败'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('图片解码失败'))
      img.onload = () => {
        let { width, height } = img
        const scale = Math.min(1, maxSize / Math.max(width, height))
        width = Math.max(1, Math.round(width * scale))
        height = Math.max(1, Math.round(height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('画布不可用'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82)
        const approx = Math.round((dataUrl.length - 'data:image/jpeg;base64,'.length) * 0.75)
        if (approx > maxBytes) {
          reject(new Error('图片过大，请换一张更小的照片'))
          return
        }
        resolve({ dataUrl, width, height })
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

async function onFileChange(e: Event): Promise<void> {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const compressed = await compressImage(file)
    form.image = compressed.dataUrl
    form.width = compressed.width
    form.height = compressed.height
  } catch (err) {
    error.value = err instanceof Error ? err.message : '图片处理失败'
  }
}

async function onSave(): Promise<void> {
  if (!form.name.trim()) {
    error.value = '请填写昵称'
    return
  }
  saving.value = true
  error.value = ''
  try {
    if (editingId.value) {
      await updateWall(endpoint, editingId.value, {
        name: form.name.trim(),
        caption: form.caption.trim(),
        ...(form.image
          ? { image: form.image, width: form.width, height: form.height }
          : {})
      })
    } else {
      if (!form.image) {
        error.value = '请选择照片'
        saving.value = false
        return
      }
      await uploadWall(endpoint, {
        name: form.name.trim(),
        caption: form.caption.trim(),
        image: form.image,
        width: form.width,
        height: form.height
      })
    }
    resetForm()
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '保存失败'
  } finally {
    saving.value = false
  }
}

async function onDelete(item: WallItem): Promise<void> {
  if (!window.confirm(`确定删除「${item.name}」的照片？`)) return
  try {
    await deleteWall(endpoint, item.id)
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '删除失败'
  }
}

async function onBatchDelete(): Promise<void> {
  const ids = [...selected.value]
  if (!ids.length) return
  if (!window.confirm(`确定删除已选的 ${ids.length} 张照片？`)) return
  batching.value = true
  error.value = ''
  try {
    await deleteWallBatch(endpoint, ids)
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '批量删除失败'
  } finally {
    batching.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h1>照片墙管理</h1>
        <p>增删改查宾客上传的瞬间</p>
      </div>
      <div class="actions">
        <button type="button" class="ghost" :disabled="loading" @click="load">刷新</button>
        <button
          type="button"
          class="danger"
          :disabled="!selectedCount || batching || loading"
          @click="onBatchDelete"
        >
          {{ batching ? '删除中…' : `批量删除${selectedCount ? ` (${selectedCount})` : ''}` }}
        </button>
        <button type="button" class="primary" @click="openCreate">新增照片</button>
      </div>
    </header>

    <p v-if="error" class="error">{{ error }}</p>

    <section v-if="showForm" class="form-panel">
      <h2>{{ editingId ? '编辑照片' : '新增照片' }}</h2>
      <div class="form-grid">
        <label>
          <span>昵称 *</span>
          <input v-model="form.name" type="text" maxlength="20" />
        </label>
        <label>
          <span>文案</span>
          <input v-model="form.caption" type="text" maxlength="60" />
        </label>
        <label class="full">
          <span>{{ editingId ? '更换图片（可选）' : '选择图片 *' }}</span>
          <input type="file" accept="image/*" @change="onFileChange" />
        </label>
        <div v-if="form.image" class="preview full">
          <img :src="form.image" alt="预览" />
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="ghost" @click="resetForm">取消</button>
        <button type="button" class="primary" :disabled="saving" @click="onSave">
          {{ saving ? '保存中…' : '保存' }}
        </button>
      </div>
    </section>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th class="check">
              <input
                type="checkbox"
                :checked="allSelected"
                :disabled="loading || !selectableIds.length"
                aria-label="全选"
                @change="toggleAll(($event.target as HTMLInputElement).checked)"
              />
            </th>
            <th>预览</th>
            <th>昵称</th>
            <th>文案</th>
            <th>点赞</th>
            <th>时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="loading">
            <tr>
              <td colspan="7" class="empty">加载中…</td>
            </tr>
          </template>
          <template v-else-if="!list.length">
            <tr>
              <td colspan="7" class="empty">暂无照片</td>
            </tr>
          </template>
          <template v-else>
            <tr v-for="item in list" :key="item.id">
              <td class="check">
                <input
                  type="checkbox"
                  :checked="selected.has(item.id)"
                  :aria-label="`选择 ${item.name}`"
                  @change="toggleOne(item.id, ($event.target as HTMLInputElement).checked)"
                />
              </td>
              <td>
                <a :href="item.url" target="_blank" rel="noopener">
                  <img class="thumb" :src="item.url" :alt="item.name" />
                </a>
              </td>
              <td>{{ item.name }}</td>
              <td>{{ item.caption || '—' }}</td>
              <td>{{ item.likes ?? 0 }}</td>
              <td class="muted">{{ item.createdAt?.slice(0, 19).replace('T', ' ') || '—' }}</td>
              <td class="ops">
                <button type="button" @click="openEdit(item)">编辑</button>
                <button type="button" class="danger" @click="onDelete(item)">删除</button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
h1 {
  font-size: 26px;
  letter-spacing: 0.16em;
  font-weight: 500;
}
.head p {
  color: var(--brown);
  font-size: 14px;
  margin-top: 4px;
}
.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
button {
  font: inherit;
  cursor: pointer;
  padding: 9px 14px;
  border: 1px solid rgba(45, 74, 54, 0.3);
  background: #fff;
  color: var(--green-deep);
}
button.primary {
  background: var(--green);
  border-color: var(--green);
  color: var(--cream);
}
button.ghost {
  background: transparent;
}
button.danger {
  color: #a33;
  border-color: rgba(170, 51, 51, 0.35);
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.error {
  color: #a33;
  margin-bottom: 12px;
}
.form-panel {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(201, 168, 106, 0.35);
  padding: 18px;
  margin-bottom: 16px;
}
.form-panel h2 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 14px;
  letter-spacing: 0.1em;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
label {
  display: grid;
  gap: 6px;
  font-size: 13px;
  color: var(--green-soft);
}
label.full {
  grid-column: 1 / -1;
}
input[type='text'],
input[type='file'] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(138, 115, 80, 0.3);
  background: #fff;
  font: inherit;
}
.preview img {
  max-width: 220px;
  max-height: 160px;
  object-fit: cover;
  border: 1px solid rgba(138, 115, 80, 0.25);
}
.form-actions {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.table-wrap {
  overflow: auto;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(138, 115, 80, 0.2);
}
table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
}
th,
td {
  padding: 12px 14px;
  text-align: left;
  border-bottom: 1px solid rgba(138, 115, 80, 0.15);
  font-size: 14px;
  vertical-align: middle;
}
th {
  background: rgba(243, 236, 221, 0.7);
  font-weight: 500;
  letter-spacing: 0.08em;
  color: var(--green-soft);
}
th.check,
td.check {
  width: 42px;
  text-align: center;
  padding-left: 12px;
  padding-right: 8px;
}
th.check input,
td.check input {
  width: auto;
  padding: 0;
  accent-color: var(--green);
  cursor: pointer;
}
.thumb {
  width: 72px;
  height: 54px;
  object-fit: cover;
  display: block;
}
.muted {
  color: var(--brown);
  font-size: 13px;
  white-space: nowrap;
}
.ops {
  display: flex;
  gap: 6px;
}
.ops button {
  padding: 6px 10px;
  font-size: 13px;
}
.empty {
  text-align: center;
  color: var(--brown);
  padding: 28px;
}
@media (max-width: 700px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>

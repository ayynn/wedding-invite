<script setup lang="ts">
defineOptions({ name: 'admin-rsvp' })

import { onMounted, reactive, ref } from 'vue'
import { weddingConfig } from '@/config/wedding'
import {
  deleteRsvp,
  fetchRsvpList,
  submitRsvp,
  updateRsvp,
  type RsvpRecord
} from '@/api/client'
import type { RsvpPayload } from '@/types'

const endpoint = weddingConfig.api.rsvpEndpoint
const list = ref<RsvpRecord[]>([])
const loading = ref(false)
const error = ref('')
const saving = ref(false)
const showForm = ref(false)
const editingId = ref<string | null>(null)

const form = reactive({
  name: '',
  phone: '',
  num: '1',
  attend: 'yes' as RsvpPayload['attend'],
  msg: ''
})

async function load(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    list.value = await fetchRsvpList(endpoint)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}

function resetForm(): void {
  form.name = ''
  form.phone = ''
  form.num = '1'
  form.attend = 'yes'
  form.msg = ''
  editingId.value = null
  showForm.value = false
}

function openCreate(): void {
  resetForm()
  showForm.value = true
}

function openEdit(item: RsvpRecord): void {
  editingId.value = item.id || null
  form.name = item.name
  form.phone = item.phone || ''
  form.num = item.num || '1'
  form.attend = item.attend === 'no' ? 'no' : 'yes'
  form.msg = item.msg || ''
  showForm.value = true
}

async function onSave(): Promise<void> {
  if (!form.name.trim()) {
    error.value = '请填写姓名'
    return
  }
  saving.value = true
  error.value = ''
  const payload: RsvpPayload = {
    name: form.name.trim(),
    phone: form.phone.trim(),
    num: form.num.trim(),
    attend: form.attend,
    msg: form.msg.trim(),
    time: new Date().toISOString()
  }
  try {
    if (editingId.value) {
      await updateRsvp(endpoint, editingId.value, payload)
    } else {
      await submitRsvp(endpoint, payload)
    }
    resetForm()
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '保存失败'
  } finally {
    saving.value = false
  }
}

async function onDelete(item: RsvpRecord): Promise<void> {
  if (!item.id) {
    error.value = '缺少记录 ID，无法删除'
    return
  }
  if (!window.confirm(`确定删除「${item.name}」的登记？`)) return
  try {
    await deleteRsvp(endpoint, item.id)
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '删除失败'
  }
}

onMounted(load)
</script>

<template>
  <div class="page">
    <header class="head">
      <div>
        <h1>访问人员登记</h1>
        <p>管理宾客回复与同行信息</p>
      </div>
      <div class="actions">
        <button type="button" class="ghost" :disabled="loading" @click="load">刷新</button>
        <button type="button" class="primary" @click="openCreate">新增登记</button>
      </div>
    </header>

    <p v-if="error" class="error">{{ error }}</p>

    <section v-if="showForm" class="form-panel">
      <h2>{{ editingId ? '编辑登记' : '新增登记' }}</h2>
      <div class="form-grid">
        <label>
          <span>姓名 *</span>
          <input v-model="form.name" type="text" maxlength="40" />
        </label>
        <label>
          <span>电话</span>
          <input v-model="form.phone" type="tel" maxlength="30" />
        </label>
        <label>
          <span>同行人数</span>
          <input v-model="form.num" type="text" inputmode="numeric" />
        </label>
        <label>
          <span>是否赴约</span>
          <select v-model="form.attend">
            <option value="yes">欣然赴约</option>
            <option value="no">遗憾缺席</option>
          </select>
        </label>
        <label class="full">
          <span>祝福留言</span>
          <textarea v-model="form.msg" rows="3" maxlength="300"></textarea>
        </label>
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
            <th>姓名</th>
            <th>电话</th>
            <th>人数</th>
            <th>赴约</th>
            <th>留言</th>
            <th>时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="empty">加载中…</td>
          </tr>
          <tr v-else-if="!list.length">
            <td colspan="7" class="empty">暂无登记</td>
          </tr>
          <tr v-for="item in list" :key="item.id || item.name + item.time">
            <td>{{ item.name }}</td>
            <td>{{ item.phone || '—' }}</td>
            <td>{{ item.num || '—' }}</td>
            <td>
              <span class="tag" :class="item.attend === 'no' ? 'no' : 'yes'">
                {{ item.attend === 'no' ? '缺席' : '赴约' }}
              </span>
            </td>
            <td class="msg">{{ item.msg || '—' }}</td>
            <td class="muted">{{ (item.time || '').slice(0, 19).replace('T', ' ') || '—' }}</td>
            <td class="ops">
              <button type="button" @click="openEdit(item)">编辑</button>
              <button type="button" class="danger" @click="onDelete(item)">删除</button>
            </td>
          </tr>
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
input,
select,
textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(138, 115, 80, 0.3);
  background: #fff;
  font: inherit;
  color: var(--green-deep);
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
  min-width: 780px;
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
.msg {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.muted {
  color: var(--brown);
  font-size: 13px;
  white-space: nowrap;
}
.tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  letter-spacing: 0.06em;
}
.tag.yes {
  background: rgba(45, 74, 54, 0.12);
  color: var(--green);
}
.tag.no {
  background: rgba(170, 51, 51, 0.1);
  color: #a33;
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

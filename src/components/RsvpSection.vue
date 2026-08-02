<script setup lang="ts">
defineOptions({ name: 'rsvp-section' })

import { reactive, ref } from 'vue'
import { lookupRsvpByName, submitRsvp, type RsvpRecord } from '@/api/client'
import type { RsvpPayload } from '@/types'
import SectionTitle from './SectionTitle.vue'
import ShareInviteButton from './ShareInviteButton.vue'

const props = defineProps<{
  endpoint: string
}>()

const form = reactive({
  name: '',
  phone: '',
  num: '',
  attend: 'yes' as RsvpPayload['attend'],
  msg: ''
})
const submitted = ref(false)
const submitting = ref(false)
const submitError = ref('')
const duplicateMatches = ref<RsvpRecord[]>([])
const showDuplicateConfirm = ref(false)
/** 已确认「不是同一人」的姓名；换名后需重新检查 */
const confirmedNotSameName = ref('')

function formatTime(time?: string): string {
  if (!time) return '—'
  return time.slice(0, 19).replace('T', ' ')
}

async function doSubmit(): Promise<void> {
  submitting.value = true
  submitError.value = ''
  const payload: RsvpPayload = {
    name: form.name.trim(),
    phone: form.phone.trim(),
    num: form.num.trim(),
    attend: form.attend,
    msg: form.msg.trim(),
    time: new Date().toISOString()
  }
  try {
    await submitRsvp(props.endpoint, payload)
    submitted.value = true
    showDuplicateConfirm.value = false
    duplicateMatches.value = []
    confirmedNotSameName.value = ''
  } catch (err) {
    submitError.value = '提交失败，请稍后重试'
    console.warn('[RSVP] 上传失败:', err)
  } finally {
    submitting.value = false
  }
}

async function onSubmit(e: Event): Promise<void> {
  e.preventDefault()
  if (!form.name.trim()) {
    ;(document.getElementById('rsvpName') as HTMLInputElement | null)?.focus()
    return
  }
  if (!props.endpoint) {
    submitError.value = '登记服务暂不可用'
    return
  }

  const name = form.name.trim()
  submitting.value = true
  submitError.value = ''
  try {
    if (confirmedNotSameName.value !== name) {
      const matches = await lookupRsvpByName(props.endpoint, name)
      if (matches.length) {
        duplicateMatches.value = matches
        showDuplicateConfirm.value = true
        submitting.value = false
        return
      }
    }
    await doSubmit()
  } catch (err) {
    submitError.value = '提交失败，请稍后重试'
    console.warn('[RSVP] 同名检查失败:', err)
    submitting.value = false
  }
}

function cancelDuplicate(): void {
  showDuplicateConfirm.value = false
  duplicateMatches.value = []
  confirmedNotSameName.value = ''
}

async function confirmNotSameAndSubmit(): Promise<void> {
  confirmedNotSameName.value = form.name.trim()
  showDuplicateConfirm.value = false
  await doSubmit()
}
</script>

<template>
  <section class="section rsvp">
    <div class="wrap">
      <SectionTitle en="RSVP" cn="期待您的回复" sub="您的到来，是我们最好的礼物" />
      <form v-if="!submitted" class="form reveal d1" @submit="onSubmit">
        <div class="row">
          <input id="rsvpName" v-model="form.name" type="text" placeholder="您的姓名 *" required />
          <input v-model="form.phone" type="tel" placeholder="联系电话" />
        </div>
        <input v-model="form.num" type="text" placeholder="同行人数（含本人）" inputmode="numeric" />
        <div class="radio-group">
          <input id="attend-yes" v-model="form.attend" type="radio" name="attend" value="yes" />
          <label for="attend-yes">✦ 欣然赴约</label>
          <input id="attend-no" v-model="form.attend" type="radio" name="attend" value="no" />
          <label for="attend-no">✕ 遗憾缺席</label>
        </div>
        <textarea v-model="form.msg" rows="3" placeholder="写下您的祝福…"></textarea>
        <p v-if="submitError" class="form-err">{{ submitError }}</p>
        <button class="submit" type="submit" :disabled="submitting">
          {{ submitting ? '提交中…' : '✦ 送出祝福 ✦' }}
        </button>
        <ShareInviteButton />
      </form>
      <div v-else class="form-ok">
        <div class="ok-ic">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="18" rx="2" />
            <polyline points="2 7 12 14 22 7" />
          </svg>
        </div>
        <h3>已收到您的回复</h3>
        <p>感谢您的祝福，我们婚礼见！</p>
        <div class="ok-share">
          <ShareInviteButton />
        </div>
      </div>
    </div>

    <div v-if="showDuplicateConfirm" class="dup-mask" @click.self="cancelDuplicate">
      <div class="dup-panel" role="dialog" aria-modal="true" aria-labelledby="dup-title">
        <h3 id="dup-title">发现同名登记</h3>
        <p class="dup-lead">
          已有姓名为「{{ form.name.trim() }}」的登记记录。请确认是否为您本人；若不是同一人，可继续登记。
        </p>
        <ul class="dup-list">
          <li v-for="(item, idx) in duplicateMatches" :key="item.id || idx">
            <div class="dup-row"><span>姓名</span><b>{{ item.name }}</b></div>
            <div class="dup-row"><span>电话</span><b>{{ item.phone || '—' }}</b></div>
            <div class="dup-row"><span>人数</span><b>{{ item.num || '—' }}</b></div>
            <div class="dup-row">
              <span>赴约</span>
              <b>{{ item.attend === 'no' ? '遗憾缺席' : '欣然赴约' }}</b>
            </div>
            <div class="dup-row"><span>留言</span><b>{{ item.msg || '—' }}</b></div>
            <div class="dup-row"><span>时间</span><b>{{ formatTime(item.time) }}</b></div>
          </li>
        </ul>
        <div class="dup-actions">
          <button type="button" class="ghost" :disabled="submitting" @click="cancelDuplicate">
            这是我，取消
          </button>
          <button type="button" class="primary" :disabled="submitting" @click="confirmNotSameAndSubmit">
            {{ submitting ? '提交中…' : '不是我，继续登记' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rsvp {
  background: var(--ivory);
}
.form {
  max-width: 560px;
  margin: 46px auto 0;
}
.form input,
.form textarea {
  width: 100%;
  padding: 15px 18px;
  border: 1px solid rgba(201, 168, 106, 0.45);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.75);
  font-family: var(--font-serif);
  font-size: 14px;
  color: var(--green-deep);
  margin-bottom: 16px;
  transition: 0.3s;
  outline: none;
  resize: vertical;
}
.form input:focus,
.form textarea:focus {
  border-color: var(--gold);
  box-shadow: 0 0 0 4px rgba(201, 168, 106, 0.15);
  background: #fff;
}
.row {
  display: flex;
  gap: 14px;
}
.row > * {
  flex: 1;
}
.radio-group {
  display: flex;
  gap: 14px;
  margin-bottom: 16px;
}
.radio-group label {
  flex: 1;
  text-align: center;
  padding: 13px;
  border: 1px solid rgba(201, 168, 106, 0.45);
  border-radius: 12px;
  cursor: pointer;
  font-family: var(--font-hand);
  font-size: 16px;
  transition: 0.3s;
  background: rgba(255, 255, 255, 0.6);
}
.radio-group input {
  display: none;
}
.radio-group input:checked + label {
  border-color: var(--gold);
  background: var(--gold);
  color: #fff;
  box-shadow: 0 8px 22px rgba(201, 168, 106, 0.4);
}
.form-err {
  color: #b0564a;
  font-size: 13px;
  margin: -6px 0 12px;
  text-align: center;
}
.submit {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 60px;
  background: var(--green);
  color: var(--ivory);
  font-family: var(--font-hand);
  font-size: 18px;
  letter-spacing: 0.16em;
  cursor: pointer;
  transition: 0.35s cubic-bezier(0.2, 0.7, 0.2, 1);
  box-shadow: 0 10px 30px rgba(45, 74, 54, 0.3);
}
.submit:hover {
  background: var(--green-deep);
  transform: translateY(-3px);
  box-shadow: 0 16px 40px rgba(45, 74, 54, 0.4);
}
.submit:active {
  transform: scale(0.97);
  box-shadow: 0 6px 16px rgba(45, 74, 54, 0.25);
  transition: 0.1s;
}
.submit:disabled {
  opacity: 0.65;
  cursor: wait;
  transform: none;
}
.form-ok {
  text-align: center;
  padding: 60px 20px;
}
.ok-ic {
  width: 68px;
  height: 68px;
  margin: 0 auto;
  color: var(--gold);
  animation: popIn 0.6s cubic-bezier(0.2, 1.6, 0.4, 1) both;
}
.ok-ic svg {
  width: 100%;
  height: 100%;
}
.form-ok h3 {
  font-family: var(--font-hand);
  font-size: 26px;
  font-weight: 400;
  margin-top: 18px;
  letter-spacing: 0.12em;
  color: var(--green-deep);
}
.form-ok p {
  font-family: var(--font-hand);
  color: var(--brown);
  font-size: 16px;
  margin-top: 10px;
}
.ok-share {
  max-width: 320px;
  margin: 28px auto 0;
}
.dup-mask {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(16, 26, 20, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.dup-panel {
  width: min(440px, 100%);
  max-height: min(80vh, 640px);
  overflow: auto;
  background: #fffaf2;
  border: 1px solid rgba(201, 168, 106, 0.4);
  border-radius: 16px;
  padding: 22px 20px 18px;
  box-shadow: 0 20px 50px rgba(16, 26, 20, 0.22);
}
.dup-panel h3 {
  font-size: 18px;
  letter-spacing: 0.14em;
  color: var(--green-deep);
  font-weight: 500;
}
.dup-lead {
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--brown);
}
.dup-list {
  list-style: none;
  margin: 16px 0 0;
  display: grid;
  gap: 12px;
}
.dup-list li {
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(201, 168, 106, 0.28);
  border-radius: 12px;
}
.dup-row {
  display: flex;
  gap: 12px;
  font-size: 13px;
  padding: 3px 0;
}
.dup-row span {
  width: 40px;
  flex-shrink: 0;
  color: var(--brown);
}
.dup-row b {
  font-weight: 500;
  color: var(--green-deep);
  word-break: break-all;
}
.dup-actions {
  margin-top: 18px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}
.dup-actions button {
  font: inherit;
  cursor: pointer;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(45, 74, 54, 0.28);
  background: #fff;
  color: var(--green-deep);
}
.dup-actions .primary {
  background: var(--green);
  border-color: var(--green);
  color: var(--ivory);
}
.dup-actions .ghost {
  background: transparent;
}
.dup-actions button:disabled {
  opacity: 0.6;
  cursor: wait;
}
@keyframes popIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
@media (max-width: 640px) {
  .row {
    flex-direction: column;
    gap: 0;
  }
}
</style>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { RsvpPayload } from '@/types'
import SectionTitle from './SectionTitle.vue'

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

const STORAGE_KEY = 'wedding_rsvp'

async function onSubmit(e: Event): Promise<void> {
  e.preventDefault()
  if (!form.name.trim()) {
    ;(document.getElementById('rsvpName') as HTMLInputElement | null)?.focus()
    return
  }
  const payload: RsvpPayload = {
    name: form.name.trim(),
    phone: form.phone.trim(),
    num: form.num.trim(),
    attend: form.attend,
    msg: form.msg.trim(),
    time: new Date().toLocaleString()
  }
  // 1) 本机兜底存储
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as RsvpPayload[]
    list.push(payload)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    /* localStorage 不可用时忽略 */
  }
  // 2) 若配置了后端接口则异步上传
  if (props.endpoint) {
    try {
      await fetch(props.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch (err) {
      console.warn('[RSVP] 上传失败，已保存在本机:', err)
    }
  }
  submitted.value = true
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
        <button class="submit" type="submit">✦ 送出祝福 ✦</button>
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
      </div>
      <p class="rsvp-note reveal d1">* 您的回复仅保存在本机浏览器，不会上传至网络；提交后可在本机再次查看。</p>
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
  font-family: inherit;
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
  font-size: 14px;
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
.submit {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 60px;
  background: var(--green);
  color: var(--ivory);
  font-family: inherit;
  font-size: 15px;
  letter-spacing: 0.3em;
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
  font-size: 22px;
  margin-top: 18px;
  letter-spacing: 0.2em;
  color: var(--green-deep);
}
.form-ok p {
  color: var(--brown);
  font-size: 14px;
  margin-top: 10px;
}
.rsvp-note {
  text-align: center;
  color: var(--brown);
  font-size: 12px;
  letter-spacing: 0.08em;
  margin-top: 14px;
  opacity: 0.8;
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

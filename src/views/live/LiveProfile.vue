<script setup lang="ts">
defineOptions({ name: 'live-profile' })

import { computed, ref, watch } from 'vue'
import { useGuestIdentity } from '@/composables/useGuestIdentity'

const { profile, isAnonymous, displayName, avatarLetter, bind, login, reset } = useGuestIdentity()

const name = ref(profile.value.name)
const phone = ref(profile.value.phone)
const loginName = ref('')
const loginPhone = ref('')
const mode = ref<'profile' | 'login'>('profile')
const busy = ref(false)
const message = ref('')
const error = ref('')

watch(
  profile,
  (p) => {
    name.value = p.name
    phone.value = p.phone
  },
  { deep: true }
)

const statusText = computed(() =>
  isAnonymous.value ? '匿名宾客 · 资料仅保存在本机' : '已登记 · 可跨设备用姓名+手机号召回'
)

function clearFeedback(): void {
  message.value = ''
  error.value = ''
}

async function onSave(): Promise<void> {
  clearFeedback()
  busy.value = true
  try {
    await bind(name.value, phone.value)
    message.value = '已保存并绑定身份'
    mode.value = 'profile'
  } catch (err) {
    error.value = err instanceof Error ? err.message : '保存失败'
  } finally {
    busy.value = false
  }
}

async function onLogin(): Promise<void> {
  clearFeedback()
  busy.value = true
  try {
    await login(loginName.value, loginPhone.value)
    name.value = profile.value.name
    phone.value = profile.value.phone
    message.value = '已召回身份到本机'
    mode.value = 'profile'
    loginName.value = ''
    loginPhone.value = ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : '登录失败'
  } finally {
    busy.value = false
  }
}

function onReset(): void {
  clearFeedback()
  reset()
  name.value = ''
  phone.value = ''
  message.value = '已恢复为匿名身份'
}
</script>

<template>
  <div class="profile-page">
    <section class="hero">
      <div class="avatar" :class="{ registered: !isAnonymous }" aria-hidden="true">
        {{ avatarLetter }}
      </div>
      <h1 class="title">{{ displayName }}</h1>
      <p class="status">{{ statusText }}</p>
      <p class="uuid">本机 ID · {{ profile.uuid.slice(0, 8) }}…</p>
    </section>

    <p v-if="message" class="banner ok">{{ message }}</p>
    <p v-if="error" class="banner err">{{ error }}</p>

    <section v-if="mode === 'profile'" class="card">
      <h2 class="card-title">个人信息</h2>
      <p class="card-sub">填写姓名与手机号后保存，即可绑定本机身份；换机可用下方登录召回。</p>

      <label class="field">
        <span>姓名</span>
        <input v-model="name" type="text" maxlength="40" autocomplete="name" placeholder="怎么称呼您" />
      </label>
      <label class="field">
        <span>手机号</span>
        <input
          v-model="phone"
          type="tel"
          maxlength="11"
          inputmode="numeric"
          autocomplete="tel"
          placeholder="11 位手机号"
        />
      </label>

      <button type="button" class="btn primary" :disabled="busy" @click="onSave">
        {{ busy ? '保存中…' : isAnonymous ? '保存并绑定' : '更新资料' }}
      </button>

      <button
        v-if="isAnonymous"
        type="button"
        class="btn ghost"
        :disabled="busy"
        @click="mode = 'login'"
      >
        已有登记？登录召回
      </button>

      <button v-if="!isAnonymous" type="button" class="btn ghost" :disabled="busy" @click="onReset">
        清除本机身份
      </button>
    </section>

    <section v-else class="card">
      <h2 class="card-title">登录召回</h2>
      <p class="card-sub">输入曾绑定的姓名与手机号，将云端身份同步到当前浏览器。</p>

      <label class="field">
        <span>姓名</span>
        <input v-model="loginName" type="text" maxlength="40" autocomplete="name" placeholder="登记时的姓名" />
      </label>
      <label class="field">
        <span>手机号</span>
        <input
          v-model="loginPhone"
          type="tel"
          maxlength="11"
          inputmode="numeric"
          autocomplete="tel"
          placeholder="登记时的手机号"
        />
      </label>

      <button type="button" class="btn primary" :disabled="busy" @click="onLogin">
        {{ busy ? '召回中…' : '登录并召回' }}
      </button>
      <button type="button" class="btn ghost" :disabled="busy" @click="mode = 'profile'">返回资料</button>
    </section>
  </div>
</template>

<style scoped>
.profile-page {
  padding: 18px 18px 36px;
  max-width: 480px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 20px 8px 22px;
  animation: riseIn 0.65s var(--ease) both;
}

.avatar {
  width: 72px;
  height: 72px;
  margin: 0 auto;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-family: var(--font-name);
  font-size: 28px;
  color: #fff;
  background: linear-gradient(145deg, #9a8f82, #6b6156);
  box-shadow: 0 10px 28px rgba(92, 83, 72, 0.18);
}

.avatar.registered {
  background: linear-gradient(145deg, #c4ae8a, #8a7350);
}

.title {
  margin-top: 14px;
  font-family: var(--font-name);
  font-size: 26px;
  font-weight: 500;
  letter-spacing: 0.12em;
}

.status {
  margin-top: 6px;
  font-size: 13px;
  letter-spacing: 0.06em;
  color: var(--brown);
}

.uuid {
  margin-top: 4px;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--green-soft);
  opacity: 0.85;
}

.banner {
  margin: 0 0 12px;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
}

.banner.ok {
  background: rgba(74, 107, 82, 0.1);
  color: var(--green-deep);
}

.banner.err {
  background: rgba(176, 86, 74, 0.12);
  color: #8a3d34;
}

.card {
  padding: 20px 18px;
  border-radius: 18px;
  border: 1px solid rgba(201, 168, 106, 0.34);
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.78), rgba(250, 246, 238, 0.5));
  box-shadow: 0 10px 28px rgba(28, 46, 36, 0.06);
  animation: riseIn 0.7s var(--ease) 0.08s both;
}

.card-title {
  font-size: 18px;
  letter-spacing: 0.14em;
  font-weight: 500;
}

.card-sub {
  margin: 8px 0 18px;
  font-size: 13px;
  line-height: 1.65;
  color: var(--brown);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
  font-size: 13px;
  letter-spacing: 0.08em;
  color: var(--green);
}

.field input {
  border: 1px solid rgba(154, 143, 130, 0.35);
  border-radius: 12px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.72);
  color: var(--green-deep);
  font-size: 15px;
  outline: none;
  transition: border-color 0.25s var(--ease);
}

.field input:focus {
  border-color: rgba(196, 174, 138, 0.9);
}

.btn {
  width: 100%;
  margin-top: 8px;
  border: none;
  border-radius: 999px;
  padding: 12px 16px;
  font-family: inherit;
  font-size: 14px;
  letter-spacing: 0.16em;
  cursor: pointer;
  transition: opacity 0.25s, transform 0.25s var(--ease);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn.primary {
  background: linear-gradient(135deg, #8a7350, #6b6156);
  color: #fff;
}

.btn.ghost {
  background: transparent;
  color: var(--brown);
  border: 1px solid rgba(154, 143, 130, 0.35);
}

.btn:not(:disabled):active {
  transform: scale(0.98);
}

@keyframes riseIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

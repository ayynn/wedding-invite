<script setup lang="ts">
defineOptions({ name: 'admin-login' })

import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminAuth } from '@/composables/useAdminAuth'

const router = useRouter()
const route = useRoute()
const { login } = useAdminAuth()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

function onSubmit(e: Event): void {
  e.preventDefault()
  error.value = ''
  loading.value = true
  const ok = login(username.value, password.value)
  loading.value = false
  if (!ok) {
    error.value = '用户名或密码不正确'
    return
  }
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/admin'
  void router.replace(redirect)
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <p class="eyebrow">Wedding Admin</p>
      <h1>管理后台</h1>
      <p class="sub">请输入账号密码继续</p>
      <form class="form" @submit="onSubmit">
        <label>
          <span>用户名</span>
          <input v-model="username" type="text" autocomplete="username" required />
        </label>
        <label>
          <span>密码</span>
          <input v-model="password" type="password" autocomplete="current-password" required />
        </label>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="loading">{{ loading ? '验证中…' : '进入后台' }}</button>
      </form>
      <RouterLink class="back" to="/">← 返回邀请函</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(ellipse at 20% 10%, rgba(201, 168, 106, 0.22), transparent 45%),
    radial-gradient(ellipse at 80% 90%, rgba(45, 74, 54, 0.35), transparent 50%),
    linear-gradient(160deg, #1c2e24 0%, #2d4a36 48%, #1a2820 100%);
}
.login-card {
  width: min(420px, 100%);
  padding: 40px 32px 28px;
  border: 1px solid rgba(232, 213, 163, 0.35);
  background: rgba(250, 246, 238, 0.96);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
  color: var(--green-deep);
}
.eyebrow {
  font-family: 'Great Vibes', cursive;
  font-size: 28px;
  color: var(--gold);
  margin-bottom: 4px;
}
h1 {
  font-size: 28px;
  letter-spacing: 0.18em;
  font-weight: 500;
}
.sub {
  margin-top: 8px;
  color: var(--brown);
  font-size: 14px;
}
.form {
  margin-top: 28px;
  display: grid;
  gap: 16px;
}
label {
  display: grid;
  gap: 6px;
  font-size: 13px;
  letter-spacing: 0.12em;
  color: var(--green-soft);
}
input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid rgba(138, 115, 80, 0.35);
  background: #fff;
  font: inherit;
  color: var(--green-deep);
  outline: none;
}
input:focus {
  border-color: var(--gold);
}
.error {
  color: #a33;
  font-size: 13px;
}
button {
  margin-top: 4px;
  padding: 13px 18px;
  border: none;
  background: var(--green);
  color: var(--cream);
  font: inherit;
  letter-spacing: 0.2em;
  cursor: pointer;
  transition: background 0.2s ease;
}
button:hover:not(:disabled) {
  background: var(--green-deep);
}
button:disabled {
  opacity: 0.7;
  cursor: wait;
}
.back {
  display: inline-block;
  margin-top: 22px;
  color: var(--brown);
  text-decoration: none;
  font-size: 13px;
}
.back:hover {
  color: var(--green);
}
</style>

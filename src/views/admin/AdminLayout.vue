<script setup lang="ts">
defineOptions({ name: 'admin-layout' })

import { useRoute, useRouter } from 'vue-router'
import { useAdminAuth } from '@/composables/useAdminAuth'

const route = useRoute()
const router = useRouter()
const { logout } = useAdminAuth()

const nav = [
  { name: 'admin-dashboard', label: '数据看板', path: '/admin' },
  { name: 'admin-wall', label: '照片墙', path: '/admin/wall' },
  { name: 'admin-rsvp', label: '人员登记', path: '/admin/rsvp' }
]

function onLogout(): void {
  logout()
  void router.replace({ name: 'admin-login' })
}
</script>

<template>
  <div class="admin">
    <aside class="side">
      <div class="brand">
        <span class="en">Admin</span>
        <strong>婚礼后台</strong>
      </div>
      <nav>
        <RouterLink
          v-for="item in nav"
          :key="item.name"
          :to="item.path"
          class="nav-item"
          :class="{ active: route.name === item.name }"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
      <div class="side-foot">
        <RouterLink to="/" class="link">邀请函</RouterLink>
        <button type="button" class="link btn" @click="onLogout">退出</button>
      </div>
    </aside>
    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.admin {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 220px 1fr;
  background:
    linear-gradient(180deg, rgba(250, 246, 238, 0.95), rgba(243, 236, 221, 0.98)),
    repeating-linear-gradient(
      -12deg,
      transparent,
      transparent 18px,
      rgba(201, 168, 106, 0.05) 18px,
      rgba(201, 168, 106, 0.05) 19px
    );
}
.side {
  background: var(--green-deep);
  color: var(--cream);
  padding: 28px 18px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  position: sticky;
  top: 0;
  height: 100vh;
}
.brand .en {
  display: block;
  font-family: 'Great Vibes', cursive;
  font-size: 26px;
  color: var(--gold-light);
}
.brand strong {
  display: block;
  margin-top: 4px;
  letter-spacing: 0.2em;
  font-weight: 500;
}
nav {
  display: grid;
  gap: 8px;
  flex: 1;
}
.nav-item {
  padding: 11px 14px;
  color: rgba(250, 246, 238, 0.78);
  text-decoration: none;
  letter-spacing: 0.12em;
  font-size: 14px;
  border-left: 2px solid transparent;
  transition: all 0.2s ease;
}
.nav-item:hover,
.nav-item.active {
  color: var(--gold-bright);
  background: rgba(201, 168, 106, 0.12);
  border-left-color: var(--gold);
}
.side-foot {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
.link {
  color: rgba(232, 213, 163, 0.85);
  text-decoration: none;
  font-size: 13px;
  background: none;
  border: none;
  cursor: pointer;
  font: inherit;
  padding: 0;
}
.link:hover {
  color: #fff;
}
.content {
  padding: 28px 28px 48px;
  min-width: 0;
}
@media (max-width: 860px) {
  .admin {
    grid-template-columns: 1fr;
  }
  .side {
    position: static;
    height: auto;
    padding: 18px 16px;
    gap: 16px;
  }
  nav {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
  .nav-item {
    text-align: center;
    border-left: none;
    border-bottom: 2px solid transparent;
    padding: 10px 6px;
    font-size: 13px;
  }
  .nav-item.active {
    border-left: none;
    border-bottom-color: var(--gold);
  }
  .content {
    padding: 18px 14px 40px;
  }
}
</style>

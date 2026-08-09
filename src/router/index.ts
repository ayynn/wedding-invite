import { createRouter, createWebHistory } from 'vue-router'
import { isAdminLoggedIn } from '@/composables/useAdminAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'invite',
      component: () => import('@/views/InviteView.vue')
    },
    {
      path: '/live',
      component: () => import('@/views/live/LiveLayout.vue'),
      children: [
        {
          path: '',
          name: 'live-home',
          component: () => import('@/views/live/LiveHome.vue')
        },
        {
          path: 'wall',
          name: 'live-wall',
          component: () => import('@/views/live/LiveWall.vue')
        },
        {
          path: 'guide',
          name: 'live-guide',
          component: () => import('@/views/live/LiveGuide.vue')
        },
        {
          path: 'portraits',
          name: 'live-portraits',
          component: () => import('@/views/live/LiveComingSoon.vue'),
          meta: {
            title: '婚纱照鉴赏',
            en: 'Portraits',
            desc: '新郎新娘婚纱照鉴赏即将上线，敬请期待。'
          }
        },
        {
          path: 'lottery',
          name: 'live-lottery',
          component: () => import('@/views/live/LiveComingSoon.vue'),
          meta: {
            title: '幸运抽奖',
            en: 'Lottery',
            desc: '晚宴抽奖互动筹备中，婚礼当天与我们一起见证好运。'
          }
        },
        {
          path: 'games',
          name: 'live-games',
          component: () => import('@/views/live/LiveComingSoon.vue'),
          meta: {
            title: '小游戏',
            en: 'Games',
            desc: '现场小游戏正在打磨，稍后开放给宾客畅玩。'
          }
        },
        {
          path: 'moments',
          name: 'live-moments',
          component: () => import('@/views/live/LiveComingSoon.vue'),
          meta: {
            title: '实时瞬间',
            en: 'Live Moments',
            desc: '节日现场实时图片上传与鉴赏即将开放，可先体验照片墙。'
          }
        }
      ]
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('@/views/admin/AdminLogin.vue'),
      meta: { adminGuest: true }
    },
    {
      path: '/admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      meta: { requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/AdminDashboard.vue')
        },
        {
          path: 'wall',
          name: 'admin-wall',
          component: () => import('@/views/admin/AdminWall.vue')
        },
        {
          path: 'rsvp',
          name: 'admin-rsvp',
          component: () => import('@/views/admin/AdminRsvp.vue')
        }
      ]
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  if (to.meta.requiresAdmin && !isAdminLoggedIn()) {
    return { name: 'admin-login', query: { redirect: to.fullPath } }
  }
  if (to.meta.adminGuest && isAdminLoggedIn()) {
    return { name: 'admin-dashboard' }
  }
  return true
})

export default router

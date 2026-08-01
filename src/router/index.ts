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

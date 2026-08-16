import { computed, ref } from 'vue'
import { ADMIN_CREDENTIALS, ADMIN_SESSION_KEY } from '@/config/admin'

const loggedIn = ref(readSession())

function readSession(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function writeSession(value: boolean): void {
  try {
    if (value) sessionStorage.setItem(ADMIN_SESSION_KEY, '1')
    else sessionStorage.removeItem(ADMIN_SESSION_KEY)
  } catch {
    /* ignore */
  }
  loggedIn.value = value
}

/** 本地校验用户名密码 */
export function loginAdmin(username: string, password: string): boolean {
  const ok =
    username.trim() === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  if (ok) writeSession(true)
  return ok
}

export function logoutAdmin(): void {
  writeSession(false)
}

export function isAdminLoggedIn(): boolean {
  return readSession()
}

export function useAdminAuth() {
  return {
    loggedIn: computed(() => loggedIn.value),
    login: loginAdmin,
    logout: logoutAdmin,
    refresh: () => {
      loggedIn.value = readSession()
    }
  }
}

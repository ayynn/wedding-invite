import { computed, ref } from 'vue'
import {
  bindGuestProfile,
  loginGuestProfile,
  type GuestProfileRecord
} from '@/api/client'
import { weddingConfig } from '@/config/wedding'

const STORAGE_UUID = 'wedding-guest-uuid'
const STORAGE_PROFILE = 'wedding-guest-profile'

export interface GuestLocalProfile {
  uuid: string
  name: string
  phone: string
  /** 已完成姓名+手机号入库绑定 */
  registered: boolean
}

const profile = ref<GuestLocalProfile | null>(null)

function createUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `g-${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`
}

function readUuid(): string | null {
  try {
    return localStorage.getItem(STORAGE_UUID)
  } catch {
    return null
  }
}

function writeUuid(uuid: string): void {
  try {
    localStorage.setItem(STORAGE_UUID, uuid)
  } catch {
    /* ignore quota / private mode */
  }
}

function readCachedProfile(): Omit<GuestLocalProfile, 'uuid'> | null {
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<GuestLocalProfile>
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      phone: typeof parsed.phone === 'string' ? parsed.phone : '',
      registered: Boolean(parsed.registered)
    }
  } catch {
    return null
  }
}

function writeCachedProfile(next: GuestLocalProfile): void {
  try {
    localStorage.setItem(
      STORAGE_PROFILE,
      JSON.stringify({
        name: next.name,
        phone: next.phone,
        registered: next.registered
      })
    )
  } catch {
    /* ignore */
  }
}

function applyProfile(next: GuestLocalProfile): GuestLocalProfile {
  writeUuid(next.uuid)
  writeCachedProfile(next)
  profile.value = next
  return next
}

function applyRemote(record: GuestProfileRecord): GuestLocalProfile {
  return applyProfile({
    uuid: record.uuid,
    name: record.name,
    phone: record.phone,
    registered: true
  })
}

/** 确保本机有匿名 uuid；首次进入会生成并写入 localStorage */
export function ensureGuestIdentity(): GuestLocalProfile {
  if (profile.value) return profile.value

  let uuid = readUuid()
  if (!uuid) {
    uuid = createUuid()
    writeUuid(uuid)
  }
  const cached = readCachedProfile()
  const next: GuestLocalProfile = {
    uuid,
    name: cached?.name || '',
    phone: cached?.phone || '',
    registered: Boolean(cached?.registered && cached.name && cached.phone)
  }
  profile.value = next
  return next
}

/** 补充姓名+手机号并入库绑定当前 uuid */
export async function bindGuestIdentity(name: string, phone: string): Promise<GuestLocalProfile> {
  const current = ensureGuestIdentity()
  const record = await bindGuestProfile(weddingConfig.api.guestEndpoint, {
    uuid: current.uuid,
    name,
    phone
  })
  return applyRemote(record)
}

/** 匿名用户用姓名+手机号召回库中 uuid，替换本机随机 uuid */
export async function loginGuestIdentity(name: string, phone: string): Promise<GuestLocalProfile> {
  const record = await loginGuestProfile(weddingConfig.api.guestEndpoint, { name, phone })
  return applyRemote(record)
}

/** 清除本机身份，重新生成匿名 uuid（不删除云端记录） */
export function resetGuestIdentity(): GuestLocalProfile {
  try {
    localStorage.removeItem(STORAGE_UUID)
    localStorage.removeItem(STORAGE_PROFILE)
  } catch {
    /* ignore */
  }
  profile.value = null
  return ensureGuestIdentity()
}

export function useGuestIdentity() {
  ensureGuestIdentity()
  const current = computed(() => profile.value as GuestLocalProfile)
  const isAnonymous = computed(() => !current.value.registered)
  const displayName = computed(() => {
    const name = current.value.name.trim()
    if (name) return name
    return isAnonymous.value ? '匿名宾客' : '宾客'
  })
  const avatarLetter = computed(() => {
    const name = current.value.name.trim()
    return name ? name.slice(0, 1) : '?'
  })

  return {
    profile: current,
    isAnonymous,
    displayName,
    avatarLetter,
    ensure: ensureGuestIdentity,
    bind: bindGuestIdentity,
    login: loginGuestIdentity,
    reset: resetGuestIdentity
  }
}

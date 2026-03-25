export const ACCESS_TOKEN_KEY = 'ai_saas_access_token'
export const USER_KEY = 'ai_saas_user'

export type TenantSummary = {
  id: number
  name: string
  slug: string
  plan: string
  status: string
}

export type UserSummary = {
  id: number
  tenant_id: number
  email: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
  tenant: TenantSummary
}

export type AuthResponse = {
  access_token: string
  token_type: string
  user: UserSummary
}

export function saveSession(session: AuthResponse) {
  if (typeof window === 'undefined') return
  localStorage.setItem(ACCESS_TOKEN_KEY, session.access_token)
  localStorage.setItem(USER_KEY, JSON.stringify(session.user))
}

export function clearSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getAccessToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getStoredUser(): UserSummary | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) as UserSummary : null
}

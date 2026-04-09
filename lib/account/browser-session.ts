export function getBrowserAccountToken(): string | null {
  if (typeof window === "undefined") return null

  const storageKeys = ["banff_auth_token", "banff_token", "auth_token", "token"]

  for (const key of storageKeys) {
    const value = window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key)
    if (value && value.trim()) {
      return value.trim()
    }
  }

  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("banff_auth_token=") || part.startsWith("auth_token=") || part.startsWith("token="))

  if (!cookie) return null

  const [, value = ""] = cookie.split("=")
  return value.trim() || null
}

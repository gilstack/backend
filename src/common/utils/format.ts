export function nameFromEmail(email: string): string {
  const username = email.split('@')[0]
  const match = username.match(/^[a-zA-Z]+/)
  const rawName = match ? match[0] : 'User'
  return rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase()
}

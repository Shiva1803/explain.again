const FP_KEY = 'ea_fp'
const VOTED_KEY = 'ea_voted'

export function getFingerprint(): string {
  let fingerprint = localStorage.getItem(FP_KEY)

  if (!fingerprint) {
    fingerprint = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem(FP_KEY, fingerprint)
  }

  return fingerprint
}

export function getVotedIds(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(VOTED_KEY) ?? '[]') as string[])
  } catch {
    return new Set()
  }
}

export function markVoted(id: number): void {
  const voted = getVotedIds()
  voted.add(String(id))
  localStorage.setItem(VOTED_KEY, JSON.stringify([...voted]))
}

export function hasVoted(id: number): boolean {
  return getVotedIds().has(String(id))
}

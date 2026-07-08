// Persists the designer's name across the onboarding flow, Settings, and the
// "Link external"/feature-submission forms. Unlike the AI-tool preference in
// ai-deeplink.ts, this can't live in localStorage alone — Claude Code/Cursor
// slash commands (.claude/commands/new-prototype.md, figma-to-prototype.md)
// run in a terminal/IDE with zero access to a browser's localStorage, but
// they can read/write a real file on disk. So `.designer.local.json` (a
// gitignored file at the repo root) is the real source of truth, read/written
// here via a dev-only Vite endpoint (see designerProfileWriterPlugin in
// vite.config.ts). localStorage is only a same-browser fallback mirror for
// when that endpoint isn't reachable — e.g. the deployed static GitHub Pages
// build has no dev server. Slash commands never see the mirror, which is
// fine: they only run against a local clone where the endpoint exists.

const ENDPOINT = '/__proto-api/designer-profile'
const MIRROR_KEY = 'jh-designer-profile-mirror'

interface DesignerProfile {
  name: string
  onboarded: boolean
}

let cache: DesignerProfile | null = null

function readMirror(): DesignerProfile {
  try {
    const raw = localStorage.getItem(MIRROR_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return {
      name: typeof parsed?.name === 'string' ? parsed.name : '',
      onboarded: !!parsed?.onboarded,
    }
  } catch {
    return { name: '', onboarded: false }
  }
}

function writeMirror(profile: DesignerProfile): void {
  try {
    localStorage.setItem(MIRROR_KEY, JSON.stringify(profile))
  } catch {
    // Storage unavailable — cache still holds the value for this page life.
  }
}

async function load(): Promise<void> {
  try {
    const res = await fetch(ENDPOINT)
    if (!res.ok) throw new Error('designer profile endpoint unavailable')
    const profile = await res.json()
    cache = { name: profile.name ?? '', onboarded: !!profile.onboarded }
    writeMirror(cache)
  } catch {
    cache = readMirror()
  }
}

// Kicked off once, at module-evaluation time (ES modules are cached/singleton
// per URL, so this fetch only ever happens once no matter how many
// components import this module). Every consumer awaits the same promise
// instead of racing its own load — e.g. `proto-settings.ts` initializing
// `_name` from `getDesignerName()` before `app.ts`'s own load resolved would
// otherwise read a still-null cache and never update.
export const designerProfileReady: Promise<void> = load()

export function getDesignerName(): string | null {
  return cache?.name || null
}

export function isOnboarded(): boolean {
  return !!cache?.onboarded
}

async function persist(profile: DesignerProfile): Promise<void> {
  cache = profile
  writeMirror(profile)
  try {
    await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
  } catch {
    // Static build with no dev server — cache+mirror above already updated.
  }
}

export async function setDesignerName(name: string): Promise<void> {
  await persist({ name, onboarded: isOnboarded() })
}

export async function setOnboarded(value: boolean): Promise<void> {
  await persist({ name: getDesignerName() ?? '', onboarded: value })
}

/**
 * Displays a designer name consistently across the gallery, regardless of
 * whether the underlying value is a kebab-case folder slug (older local
 * prototypes' `meta.ts`, before `designerName` existed) or free text someone
 * typed into a form. Only reformats strings that look unformatted (no
 * uppercase letters) — anything already containing a capital letter (a real
 * typed name) is left untouched, so this can't mangle an intentional format.
 */
export function formatDesignerName(raw: string): string {
  if (!raw) return raw
  if (/[A-Z]/.test(raw)) return raw
  return raw
    .split(/[-\s]+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

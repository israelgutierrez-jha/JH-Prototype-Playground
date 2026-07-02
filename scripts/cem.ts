/**
 * Reads the JH Custom Elements Manifest (`custom-elements.json`, VS Code
 * custom-data shape) and derives a curated API surface for a component.
 *
 * This is the single source of truth for props/events/slots. Hand-authored
 * docs supply only *intent*; this module supplies the *API*.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { ComponentApi, ComponentEvent, ComponentProp, ComponentSlot } from '../src/data/components/types.js'

const CEM_PATH = resolve('node_modules/@jack-henry/jh-elements/custom-elements.json')

interface RawAttr {
  name: string
  description?: string
  type?: string
  default?: string
}
interface RawTag {
  name: string
  description?: string
  attributes?: RawAttr[]
  events?: { name: string; description?: string }[]
  slots?: { name: string; description?: string }[]
}

/**
 * Attributes demoted to the `advanced` tier: accessibility, native HTML
 * passthrough, and low-level layout/slot toggles. Keeps the common API focused
 * on the design-facing props a prototype actually reaches for.
 */
const ADVANCED_PATTERNS: RegExp[] = [
  /^accessible/,
  /accessible-label/,
  /^aria-/,
]
const ADVANCED_NAMES = new Set([
  'autocomplete',
  'enterkeyhint',
  'inputmode',
  'input-mask',
  'name',
  'role',
  'hide-left-slot',
  'hide-right-slot',
  'show-indicator',
])

function isAdvanced(name: string): boolean {
  if (ADVANCED_NAMES.has(name)) return true
  return ADVANCED_PATTERNS.some(re => re.test(name))
}

/** `?string` → `string`; trim whitespace; leave unions/booleans intact. */
function normalizeType(type?: string): string {
  if (!type) return 'string'
  return type.replace(/^\?/, '').trim()
}

/** Manifest defaults arrive double-encoded, e.g. `"\"secondary\""` → `secondary`. */
function normalizeDefault(def?: string): string | undefined {
  if (def === undefined || def === '') return undefined
  let v = def.trim()
  // It's often a JSON string literal wrapping the real value.
  try {
    const parsed = JSON.parse(v)
    if (typeof parsed === 'string') return parsed
    return String(parsed)
  } catch {
    return v.replace(/^["']|["']$/g, '')
  }
}

/** Collapse a long multi-line manifest description to a single clean line. */
function oneLine(s?: string): string {
  return (s ?? '').replace(/\s+/g, ' ').trim()
}

/** Pull `e.detail.x` references out of an event description to fill `payload`. */
function extractPayload(description?: string): string | undefined {
  if (!description) return undefined
  const hits = new Set<string>()
  for (const m of description.matchAll(/e\.detail\.[A-Za-z0-9_]+/g)) hits.add(m[0])
  return hits.size ? [...hits].join(', ') : undefined
}

let cache: Map<string, RawTag> | null = null

export function loadCem(): Map<string, RawTag> {
  if (cache) return cache
  const raw = JSON.parse(readFileSync(CEM_PATH, 'utf8')) as { tags?: RawTag[] }
  cache = new Map((raw.tags ?? []).map(t => [t.name, t]))
  return cache
}

export function manifestTags(): string[] {
  return [...loadCem().keys()]
}

/**
 * Derive the curated API for a tag, or null if the manifest has no entry.
 * `featuredProps` forces specific attributes into the `common` tier.
 */
export function deriveApi(tag: string, featuredProps: string[] = []): ComponentApi | null {
  const entry = loadCem().get(tag)
  if (!entry) return null
  const featured = new Set(featuredProps)

  const props: ComponentProp[] = (entry.attributes ?? []).map(a => {
    const tier: 'common' | 'advanced' =
      featured.has(a.name) ? 'common' : isAdvanced(a.name) ? 'advanced' : 'common'
    return {
      name: a.name,
      type: normalizeType(a.type),
      default: normalizeDefault(a.default),
      description: oneLine(a.description),
      tier,
    }
  })
  // Common props first (manifest order preserved within each tier).
  props.sort((x, y) => (x.tier === y.tier ? 0 : x.tier === 'common' ? -1 : 1))

  const events: ComponentEvent[] = (entry.events ?? []).map(e => ({
    name: e.name,
    description: oneLine(e.description),
    payload: extractPayload(e.description),
  }))

  const slots: ComponentSlot[] = (entry.slots ?? []).map(s => ({
    name: s.name === 'default' ? '' : s.name,
    description: oneLine(s.description),
  }))

  return { props, events, slots }
}

import type { ComponentApi, ComponentDoc } from './types.js'

/**
 * Auto-discovers every component doc in this folder. Drop in a new
 * `jh-*.ts` (or `jha-*.ts` for a legacy `@banno/jha-wc` component) that
 * exports `doc: ComponentDoc` and it appears everywhere — no registration
 * needed (mirrors how prototypes/templates load).
 *
 * Each hand-authored doc supplies *intent*; its API surface
 * (props/events/slots) is merged in from `_api/<tag>.generated.ts` — one
 * generated file per component, derived from the package's Custom Elements
 * Manifest (except for legacy `jha-*` tags with no manifest entry, where the
 * hand-authored API in the doc itself wins; see the fallback in
 * `scripts/generate-component-docs.ts`).
 */
const modules = import.meta.glob(['./jh-*.ts', './jha-*.ts'], { eager: true }) as Record<
  string,
  { doc?: ComponentDoc }
>

const apiModules = import.meta.glob('./_api/*.generated.ts', { eager: true }) as Record<
  string,
  { api?: ComponentApi }
>

const COMPONENT_API: Record<string, ComponentApi> = {}
for (const [path, mod] of Object.entries(apiModules)) {
  const tag = path.replace(/.*\/(.+)\.generated\.ts$/, '$1')
  if (mod.api) COMPONENT_API[tag] = mod.api
}

export const COMPONENT_DOCS: ComponentDoc[] = Object.values(modules)
  .map(mod => mod.doc)
  .filter((doc): doc is ComponentDoc => Boolean(doc))
  .map(doc => ({ ...doc, ...(COMPONENT_API[doc.tag] ?? {}) }))
  .sort((a, b) => a.name.localeCompare(b.name))

export function getComponentDoc(tag: string): ComponentDoc | undefined {
  return COMPONENT_DOCS.find(doc => doc.tag === tag)
}

export type { ComponentDoc } from './types.js'

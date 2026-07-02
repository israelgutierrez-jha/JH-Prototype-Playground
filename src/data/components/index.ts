import type { ComponentDoc } from './types.js'
import { COMPONENT_API } from './_api.generated.js'

/**
 * Auto-discovers every component doc in this folder. Drop in a new
 * `jh-*.ts` that exports `doc: ComponentDoc` and it appears everywhere —
 * no registration needed (mirrors how prototypes/templates load).
 *
 * Each hand-authored doc supplies *intent*; its API surface
 * (props/events/slots) is merged in from `_api.generated.ts`, which is derived
 * from the package's Custom Elements Manifest. One shape, two sources of truth.
 */
const modules = import.meta.glob('./jh-*.ts', { eager: true }) as Record<
  string,
  { doc?: ComponentDoc }
>

export const COMPONENT_DOCS: ComponentDoc[] = Object.values(modules)
  .map(mod => mod.doc)
  .filter((doc): doc is ComponentDoc => Boolean(doc))
  .map(doc => ({ ...doc, ...(COMPONENT_API[doc.tag] ?? {}) }))
  .sort((a, b) => a.name.localeCompare(b.name))

export function getComponentDoc(tag: string): ComponentDoc | undefined {
  return COMPONENT_DOCS.find(doc => doc.tag === tag)
}

export type { ComponentDoc } from './types.js'

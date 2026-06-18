import type { ComponentDoc } from './types.js'

/**
 * Auto-discovers every component doc in this folder. Drop in a new
 * `jh-*.ts` that exports `doc: ComponentDoc` and it appears everywhere —
 * no registration needed (mirrors how prototypes/templates load).
 */
const modules = import.meta.glob('./jh-*.ts', { eager: true }) as Record<
  string,
  { doc?: ComponentDoc }
>

export const COMPONENT_DOCS: ComponentDoc[] = Object.values(modules)
  .map(mod => mod.doc)
  .filter((doc): doc is ComponentDoc => Boolean(doc))
  .sort((a, b) => a.name.localeCompare(b.name))

export function getComponentDoc(tag: string): ComponentDoc | undefined {
  return COMPONENT_DOCS.find(doc => doc.tag === tag)
}

export type { ComponentDoc } from './types.js'

/**
 * Coverage + intent-quality report for the component dataset.
 *
 * Since the API surface is now generated from the manifest (see
 * `_api.generated.ts`), drift on props/events/slots is impossible by
 * construction and guarded by `npm run check-docs` — except for legacy
 * `jha-*` tags with no manifest entry (see LEGACY_NO_MANIFEST_TAGS below),
 * whose API is hand-authored and only as accurate as its last manual review.
 * What still needs human attention is *coverage* and *intent*:
 *
 *  - manifest components that have no intent doc yet (run `/document-component`)
 *  - intent docs whose tag isn't in the manifest (typo / removed component)
 *  - intent docs missing the heuristics that justify the dataset
 *    (`whenToUse`, examples)
 *
 * Read-only. Run via `npm run audit-docs`.
 */
import { readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { ComponentDoc } from '../src/data/components/types.js'
import { manifestTags } from './cem.js'

const COMPONENTS_DIR = resolve('src/data/components')

/** Manifest tags that are internal sub-parts, not stand-alone components. */
const SUBPART_TAGS = new Set(['jh-table-cell'])

/**
 * Legacy `@banno/jha-wc` tags that intentionally have no `jh-elements`
 * manifest entry — their API is hand-authored in the doc itself, so they're
 * expected to be "orphaned" relative to the manifest, not a mistake.
 */
const LEGACY_NO_MANIFEST_TAGS = new Set(['jha-advanced-table'])

async function loadDocs(): Promise<ComponentDoc[]> {
  const files = readdirSync(COMPONENTS_DIR).filter(f => /^jha?-.*\.ts$/.test(f))
  const docs: ComponentDoc[] = []
  for (const file of files) {
    const mod = (await import(pathToFileURL(join(COMPONENTS_DIR, file)).href)) as { doc?: ComponentDoc }
    if (mod.doc) docs.push(mod.doc)
  }
  return docs.sort((a, b) => a.tag.localeCompare(b.tag))
}

async function main() {
  const docs = await loadDocs()
  const documented = new Set(docs.map(d => d.tag))
  const manifest = manifestTags()

  const undocumented = manifest.filter(t => !documented.has(t) && !SUBPART_TAGS.has(t))
  const orphaned = docs
    .filter(d => !manifest.includes(d.tag) && !LEGACY_NO_MANIFEST_TAGS.has(d.tag))
    .map(d => d.tag)

  const thinIntent: string[] = []
  for (const d of docs) {
    const problems: string[] = []
    if (!d.whenToUse?.length) problems.push('no whenToUse')
    if (!d.examples?.length) problems.push('no examples')
    if (problems.length) thinIntent.push(`${d.tag} (${problems.join(', ')})`)
  }

  const manifestDocumentedCount = docs.filter(d => manifest.includes(d.tag)).length
  const legacyDocumentedCount = docs.filter(d => LEGACY_NO_MANIFEST_TAGS.has(d.tag)).length
  console.log(`Coverage: ${manifestDocumentedCount}/${manifest.length - SUBPART_TAGS.size} manifest components documented`)
  if (legacyDocumentedCount) {
    console.log(`(+${legacyDocumentedCount} legacy component(s) documented with a hand-authored API, no manifest)`)
  }

  if (undocumented.length) {
    console.log(`\n● ${undocumented.length} manifest component(s) with no intent doc:`)
    console.log(`  ${undocumented.join(', ')}`)
    console.log('  → run /document-component for each')
  }
  if (orphaned.length) {
    console.log(`\n● ${orphaned.length} doc(s) whose tag is not in the manifest:`)
    console.log(`  ${orphaned.join(', ')}`)
  }
  if (thinIntent.length) {
    console.log(`\n● ${thinIntent.length} doc(s) missing core intent:`)
    for (const t of thinIntent) console.log(`  ${t}`)
  }

  const clean = !undocumented.length && !orphaned.length && !thinIntent.length
  console.log(`\n${clean ? '✓ Every manifest component is documented with intent.' : '✗ See findings above.'}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})

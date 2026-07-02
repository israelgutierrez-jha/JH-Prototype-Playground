/**
 * Projects the component dataset into its two consumable forms:
 *
 *  1. The AUTO-GENERATED region of `CLAUDE.md` (the AI projection), then
 *     `sync-rules` copies CLAUDE.md → .cursorrules.
 *  2. `_api.generated.ts` — the merged API surface (props/events/slots) derived
 *     from the package's Custom Elements Manifest, consumed by the component
 *     browser so it never parses the manifest at runtime.
 *
 * The split: hand-authored `jh-*.ts` files own *intent* (whenToUse, examples,
 * gotchas…); the manifest owns the *API*. This script merges them so the two
 * can never drift, and `--check` fails CI if a regeneration is owed (e.g. after
 * a package bump changes a component's attributes).
 *
 * Run via `npm run generate-docs` (or `npm run docs` to also sync .cursorrules).
 *
 * Note: own filesystem discovery + dynamic import rather than
 * `src/data/components/index.ts`, because that relies on Vite's
 * `import.meta.glob`, which only exists inside the Vite/browser build.
 */
import { existsSync, readdirSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { ComponentApi, ComponentDoc } from '../src/data/components/types.js'
import { deriveApi } from './cem.js'

const COMPONENTS_DIR = resolve('src/data/components')
const CLAUDE_MD = resolve('CLAUDE.md')
const REGISTRY = resolve('src/data/components/_registry.generated.ts')
const API_MODULE = resolve('src/data/components/_api.generated.ts')

const START_MARKER =
  '<!-- AUTO-GENERATED:COMPONENTS START — do not edit by hand; run `npm run generate-docs` -->'
const END_MARKER = '<!-- AUTO-GENERATED:COMPONENTS END -->'

const EMPTY_API: ComponentApi = { props: [], events: [], slots: [] }

/** A doc with its manifest-derived API merged in, for rendering. */
type ResolvedDoc = ComponentDoc & ComponentApi

/** Escape a value for safe use inside a Markdown table cell. */
function cell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ').trim()
}

const CATEGORY_LABELS: Record<string, string> = {
  actions: 'Actions',
  forms: 'Inputs & Forms',
  layout: 'Layout & Containers',
  feedback: 'Feedback & Status',
  lists: 'Lists',
  navigation: 'Navigation',
  tags: 'Tags',
  data: 'Data',
  icons: 'Icons',
}

/**
 * Compact projection for CLAUDE.md: a one-line index per component grouped by
 * category. The full API (props/events/slots) lives in `_api.generated.ts` and
 * each component's examples/gotchas live in its `jh-*.ts` file — both browsable
 * in the app's Resources tab. Keeping CLAUDE.md compact keeps it cheap to load
 * on every request as the library grows.
 */
function renderCompact(docs: ResolvedDoc[]): string {
  const out: string[] = [
    'This is a compact index — one line per component. **For the full API**',
    '(props, events, slots) read `src/data/components/_api.generated.ts`; for',
    "examples, gotchas, and detailed intent read the component's file at",
    '`src/data/components/<tag>.ts`. Both are browsable in the app **Resources**',
    'tab. Open the relevant file for exact attributes — do not guess them.',
    '',
  ]

  const byCat = new Map<string, ResolvedDoc[]>()
  for (const d of docs) {
    const arr = byCat.get(d.category) ?? []
    arr.push(d)
    byCat.set(d.category, arr)
  }

  for (const category of Object.keys(CATEGORY_LABELS)) {
    const group = byCat.get(category)
    if (!group?.length) continue
    out.push(`#### ${CATEGORY_LABELS[category]}`, '')
    for (const d of group.sort((a, b) => a.tag.localeCompare(b.tag))) {
      const when = d.whenToUse?.[0] ? ` — _when:_ ${cell(d.whenToUse[0])}` : ''
      out.push(`- \`${d.tag}\` — ${cell(d.summary)} _Import:_ \`${d.import}\`${when}`)
    }
    out.push('')
  }

  return out.join('\n').trim()
}

/** Every `jh-*` custom element tag referenced in any example's markup. */
function exampleTags(docs: ResolvedDoc[]): Set<string> {
  const tags = new Set<string>()
  for (const d of docs) {
    for (const ex of d.examples ?? []) {
      for (const m of ex.code.matchAll(/<(jh-[a-z0-9-]+)/g)) tags.add(m[1])
    }
  }
  return tags
}

/**
 * Resolve a `jh-*` tag to its package module path, or null if no such module
 * exists on disk (typo / undocumented element) — so a bad reference is skipped
 * with a warning rather than breaking the build.
 */
function resolveTagImport(tag: string): string | null {
  if (tag.startsWith('jh-icon-')) {
    const name = tag.slice('jh-'.length) // e.g. icon-arrow-down-to-line
    const spec = `@jack-henry/jh-icons/icons-wc/${name}.js`
    return existsSync(resolve('node_modules', spec)) ? spec : null
  }
  const name = tag.slice('jh-'.length) // e.g. list-item
  const spec = `@jack-henry/jh-elements/components/${name}/${name}.js`
  return existsSync(resolve('node_modules', spec)) ? spec : null
}

/** Union of each component's own import plus every element used in examples. */
function collectPreviewImports(docs: ResolvedDoc[]): string[] {
  const imports = new Set<string>()
  for (const d of docs) imports.add(d.import)
  for (const tag of exampleTags(docs)) {
    const spec = resolveTagImport(tag)
    if (spec) imports.add(spec)
    else console.warn(`⚠ preview: no module found for <${tag}> — it will render empty`)
  }
  return [...imports].sort()
}

function renderApiModule(apiByTag: Record<string, ComponentApi>): string {
  const sorted: Record<string, ComponentApi> = {}
  for (const tag of Object.keys(apiByTag).sort()) sorted[tag] = apiByTag[tag]
  const json = JSON.stringify(sorted, null, 2)
  return [
    '// AUTO-GENERATED by scripts/generate-component-docs.ts — do not edit.',
    "// API surface (props/events/slots) derived from @jack-henry/jh-elements'",
    '// custom-elements.json. Run `npm run generate-docs` after a package bump.',
    "import type { ComponentApi } from './types.js'",
    '',
    `export const COMPONENT_API: Record<string, ComponentApi> = ${json}`,
    '',
  ].join('\n')
}

async function loadDocs(): Promise<ComponentDoc[]> {
  const files = readdirSync(COMPONENTS_DIR).filter(f => /^jh-.*\.ts$/.test(f))
  const docs: ComponentDoc[] = []
  for (const file of files) {
    const mod = (await import(pathToFileURL(join(COMPONENTS_DIR, file)).href)) as {
      doc?: ComponentDoc
    }
    if (mod.doc) docs.push(mod.doc)
    else console.warn(`⚠ ${file} has no \`doc\` export — skipped`)
  }
  return docs.sort((a, b) => a.name.localeCompare(b.name))
}

async function main() {
  const intent = await loadDocs()

  // Derive the API for each documented tag from the manifest.
  const apiByTag: Record<string, ComponentApi> = {}
  const resolved: ResolvedDoc[] = intent.map(d => {
    const api = deriveApi(d.tag, d.featuredProps)
    if (!api) console.warn(`⚠ ${d.tag}: no manifest entry — API will be empty`)
    apiByTag[d.tag] = api ?? EMPTY_API
    return { ...d, ...(api ?? EMPTY_API) }
  })

  const body = resolved.length
    ? renderCompact(resolved)
    : '_No components documented yet. Run `/document-component` to add the first one._'

  const md = await readFile(CLAUDE_MD, 'utf8')
  const start = md.indexOf(START_MARKER)
  const end = md.indexOf(END_MARKER)
  if (start === -1 || end === -1) {
    throw new Error(
      `Could not find the AUTO-GENERATED:COMPONENTS markers in CLAUDE.md. ` +
        `Add both marker comments where the generated reference should live.`
    )
  }

  const before = md.slice(0, start + START_MARKER.length)
  const after = md.slice(end)
  const nextMd = `${before}\n\n${body}\n\n${after}`

  const registry = [
    '// AUTO-GENERATED by scripts/generate-component-docs.ts — do not edit.',
    '// Registers documented components and elements used in their examples so',
    '// the component browser can render live previews.',
    ...collectPreviewImports(resolved).map(spec => `import '${spec}'`),
    '',
  ].join('\n')

  const apiModule = renderApiModule(apiByTag)

  const currentMd = md
  const currentRegistry = existsSync(REGISTRY) ? await readFile(REGISTRY, 'utf8') : ''
  const currentApi = existsSync(API_MODULE) ? await readFile(API_MODULE, 'utf8') : ''

  if (process.argv.includes('--check')) {
    const stale: string[] = []
    if (nextMd !== currentMd) stale.push('CLAUDE.md component reference')
    if (registry !== currentRegistry) stale.push('src/data/components/_registry.generated.ts')
    if (apiModule !== currentApi) stale.push('src/data/components/_api.generated.ts')
    if (stale.length) {
      console.error('✗ Generated files are out of date:')
      for (const s of stale) console.error(`  - ${s}`)
      console.error('\nRun `npm run docs` and commit the result.')
      process.exit(1)
    }
    console.log('✓ Generated files are up to date')
    return
  }

  if (nextMd !== currentMd) {
    await writeFile(CLAUDE_MD, nextMd)
    console.log(`✓ CLAUDE.md component reference generated from ${resolved.length} component(s)`)
  } else {
    console.log('✓ CLAUDE.md already up to date')
  }

  if (apiModule !== currentApi) {
    await writeFile(API_MODULE, apiModule)
    const propCount = Object.values(apiByTag).reduce((n, a) => n + a.props.length, 0)
    console.log(`✓ component API generated from manifest (${propCount} prop(s))`)
  } else {
    console.log('✓ component API already up to date')
  }

  if (registry !== currentRegistry) {
    await writeFile(REGISTRY, registry)
    console.log(`✓ component preview registry written`)
  } else {
    console.log('✓ component preview registry already up to date')
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})

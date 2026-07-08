/**
 * Projects the component dataset into its two consumable forms:
 *
 *  1. The AUTO-GENERATED region of `CLAUDE.md` (the AI projection), then
 *     `sync-rules` copies CLAUDE.md → .cursorrules.
 *  2. `_api/<tag>.generated.ts` — one file per component holding its API surface
 *     (props/events/slots) derived from the package's Custom Elements Manifest,
 *     consumed by the component browser so it never parses the manifest at
 *     runtime. Split per-component so a reader (human or AI) can open a single
 *     component's API without pulling in the entire library.
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
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { ComponentApi, ComponentDoc } from '../src/data/components/types.js'
import { deriveApi } from './cem.js'

const COMPONENTS_DIR = resolve('src/data/components')
const CLAUDE_MD = resolve('CLAUDE.md')
const REGISTRY = resolve('src/data/components/_registry.generated.ts')
const API_DIR = resolve('src/data/components/_api')
/** Pre-split monolith; removed on regeneration if a stale copy lingers. */
const LEGACY_API_MODULE = resolve('src/data/components/_api.generated.ts')

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
 * category. The full API (props/events/slots) lives in `_api/<tag>.generated.ts`
 * and each component's examples/gotchas live in its `jh-*.ts` file — both
 * browsable in the app's Resources tab. Keeping CLAUDE.md compact keeps it cheap
 * to load on every request as the library grows.
 */
function renderCompact(docs: ResolvedDoc[]): string {
  const out: string[] = [
    'This is a compact index — one line per component. **For the full API**',
    '(props, events, slots) of ONE component, read only its generated file at',
    '`src/data/components/_api/<tag>.generated.ts` (e.g. `_api/jh-button.generated.ts`);',
    "for examples, gotchas, and detailed intent read the component's file at",
    '`src/data/components/<tag>.ts`. Both are browsable in the app **Resources**',
    'tab. Open the relevant per-component file for exact attributes — do not read',
    'the whole set and do not guess.',
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

/** Render one component's API as a standalone module in `_api/`. */
function renderApiFile(tag: string, api: ComponentApi): string {
  return [
    '// AUTO-GENERATED by scripts/generate-component-docs.ts — do not edit.',
    `// API surface (props/events/slots) for <${tag}>, derived from`,
    "// @jack-henry/jh-elements' custom-elements.json (hand-authored for legacy",
    '// components with no manifest). Run `npm run generate-docs` after a bump.',
    "import type { ComponentApi } from '../types.js'",
    '',
    `export const api: ComponentApi = ${JSON.stringify(api, null, 2)}`,
    '',
  ].join('\n')
}

/** Absolute path of the generated API file for a tag. */
function apiFilePath(tag: string): string {
  return join(API_DIR, `${tag}.generated.ts`)
}

/** Existing generated API files on disk (absolute paths). */
function listApiFiles(): string[] {
  if (!existsSync(API_DIR)) return []
  return readdirSync(API_DIR)
    .filter(f => f.endsWith('.generated.ts'))
    .map(f => join(API_DIR, f))
}

async function loadDocs(): Promise<ComponentDoc[]> {
  // `jha-*` matches legacy `@banno/jha-wc` components (e.g. jha-advanced-table)
  // that have no Custom Elements Manifest — see the hand-authored-API fallback
  // in main() below.
  const files = readdirSync(COMPONENTS_DIR).filter(f => /^jha?-.*\.ts$/.test(f))
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

  // Derive the API for each documented tag from the manifest. Components with
  // no manifest entry (legacy `@banno/jha-wc` tags) fall back to whatever
  // props/events/slots the doc hand-authors, instead of being wiped to empty.
  const apiByTag: Record<string, ComponentApi> = {}
  const resolved: ResolvedDoc[] = intent.map(d => {
    const manifestApi = deriveApi(d.tag, d.featuredProps)
    const handAuthoredApi: ComponentApi = {
      props: d.props ?? [],
      events: d.events ?? [],
      slots: d.slots ?? [],
    }
    const hasHandAuthoredApi =
      handAuthoredApi.props.length > 0 || handAuthoredApi.events.length > 0 || handAuthoredApi.slots.length > 0

    if (!manifestApi && !hasHandAuthoredApi) {
      console.warn(`⚠ ${d.tag}: no manifest entry — API will be empty`)
    } else if (!manifestApi) {
      console.log(`ℹ ${d.tag}: no manifest entry — using hand-authored API (legacy component)`)
    }

    const api = manifestApi ?? (hasHandAuthoredApi ? handAuthoredApi : EMPTY_API)
    apiByTag[d.tag] = api
    return { ...d, ...api }
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

  // One generated module per component, plus the current on-disk state so we
  // can write only what changed and prune files for removed components.
  const expectedApiFiles = new Map<string, string>()
  for (const tag of Object.keys(apiByTag).sort()) {
    expectedApiFiles.set(apiFilePath(tag), renderApiFile(tag, apiByTag[tag]))
  }
  const currentApiFiles = new Map<string, string>()
  for (const p of listApiFiles()) currentApiFiles.set(p, await readFile(p, 'utf8'))

  const apiStale =
    existsSync(LEGACY_API_MODULE) ||
    currentApiFiles.size !== expectedApiFiles.size ||
    [...expectedApiFiles].some(([p, c]) => currentApiFiles.get(p) !== c)

  const currentMd = md
  const currentRegistry = existsSync(REGISTRY) ? await readFile(REGISTRY, 'utf8') : ''

  if (process.argv.includes('--check')) {
    const stale: string[] = []
    if (nextMd !== currentMd) stale.push('CLAUDE.md component reference')
    if (registry !== currentRegistry) stale.push('src/data/components/_registry.generated.ts')
    if (apiStale) stale.push('src/data/components/_api/*.generated.ts')
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

  if (apiStale) {
    await mkdir(API_DIR, { recursive: true })
    // Prune files for components that no longer exist.
    for (const p of currentApiFiles.keys()) {
      if (!expectedApiFiles.has(p)) await unlink(p)
    }
    let written = 0
    for (const [p, content] of expectedApiFiles) {
      if (currentApiFiles.get(p) !== content) {
        await writeFile(p, content)
        written++
      }
    }
    if (existsSync(LEGACY_API_MODULE)) await unlink(LEGACY_API_MODULE)
    const propCount = Object.values(apiByTag).reduce((n, a) => n + a.props.length, 0)
    console.log(
      `✓ component API generated from manifest — ${expectedApiFiles.size} file(s), ` +
        `${written} changed, ${propCount} prop(s)`
    )
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

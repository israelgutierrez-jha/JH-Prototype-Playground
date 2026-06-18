/**
 * Projects the structured component dataset (`src/data/components/*.ts`) into
 * the auto-generated region of `CLAUDE.md`.
 *
 * This is the "AI projection" half of the pipeline: `/add-component` writes a
 * structured doc, this script renders it into CLAUDE.md, and `sync-rules`
 * copies CLAUDE.md → .cursorrules. One dataset, every assistant in sync.
 *
 * Run via `npm run generate-docs` (or `npm run docs` to also sync .cursorrules).
 *
 * Note: this does its own filesystem discovery + dynamic import rather than
 * using `src/data/components/index.ts`, because that file relies on Vite's
 * `import.meta.glob`, which only exists inside the Vite/browser build.
 */
import { existsSync, readdirSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { ComponentDoc } from '../src/data/components/types.js'

const COMPONENTS_DIR = resolve('src/data/components')
const CLAUDE_MD = resolve('CLAUDE.md')
const REGISTRY = resolve('src/data/components/_registry.generated.ts')

const START_MARKER =
  '<!-- AUTO-GENERATED:COMPONENTS START — do not edit by hand; run `npm run generate-docs` -->'
const END_MARKER = '<!-- AUTO-GENERATED:COMPONENTS END -->'

/** Escape a value for safe use inside a Markdown table cell. */
function cell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ').trim()
}

function renderIndex(docs: ComponentDoc[]): string {
  const rows = docs.map(d => `| \`${d.tag}\` | ${cell(d.summary)} |`)
  return ['**Component index**', '', '| Component | Use it for |', '|-----------|------------|', ...rows].join('\n')
}

function renderDoc(d: ComponentDoc): string {
  const out: string[] = []
  out.push(`### ${d.name} (\`${d.tag}\`)`, '')
  out.push(d.summary, '')
  out.push(`**Import:** \`${d.import}\``, '')

  if (d.whenToUse?.length) {
    out.push('**When to use**', '')
    out.push(...d.whenToUse.map(w => `- ${w}`), '')
  }
  if (d.whenNotToUse?.length) {
    out.push('**When not to use**', '')
    out.push(...d.whenNotToUse.map(w => `- ${w}`), '')
  }

  if (d.props?.length) {
    out.push('**Props**', '')
    out.push('| Prop | Type | Default | Description |', '|------|------|---------|-------------|')
    for (const p of d.props) {
      const name = p.required ? `\`${p.name}\` *(required)*` : `\`${p.name}\``
      out.push(`| ${name} | \`${cell(p.type)}\` | ${p.default ? `\`${cell(p.default)}\`` : '—'} | ${cell(p.description)} |`)
    }
    out.push('')
  }

  if (d.events?.length) {
    out.push('**Events**', '')
    out.push('| Event | Description | Read value |', '|-------|-------------|------------|')
    for (const e of d.events) {
      out.push(`| \`${e.name}\` | ${cell(e.description)} | ${e.payload ? `\`${cell(e.payload)}\`` : '—'} |`)
    }
    out.push('')
  }

  if (d.slots?.length) {
    out.push('**Slots**', '')
    for (const s of d.slots) {
      out.push(`- ${s.name === '' ? '(default)' : `\`${s.name}\``} — ${s.description}`)
    }
    out.push('')
  }

  if (d.examples?.length) {
    out.push('**Examples**', '')
    for (const ex of d.examples) {
      out.push(`_${ex.title}_ — ${ex.useCase}`, '')
      out.push('```html', ex.code, '```', '')
    }
  }

  if (d.gotchas?.length) {
    out.push('**Gotchas**', '')
    out.push(...d.gotchas.map(g => `- ${g}`), '')
  }

  if (d.related?.length) {
    out.push(`**Related:** ${d.related.map(r => `\`${r}\``).join(', ')}`, '')
  }

  return out.join('\n').trim()
}

/** Every `jh-*` custom element tag referenced in any example's markup. */
function exampleTags(docs: ComponentDoc[]): Set<string> {
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
function collectPreviewImports(docs: ComponentDoc[]): string[] {
  const imports = new Set<string>()
  for (const d of docs) imports.add(d.import)
  for (const tag of exampleTags(docs)) {
    const spec = resolveTagImport(tag)
    if (spec) imports.add(spec)
    else console.warn(`⚠ preview: no module found for <${tag}> — it will render empty`)
  }
  return [...imports].sort()
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
  const docs = await loadDocs()

  const body = docs.length
    ? [renderIndex(docs), ...docs.map(renderDoc)].join('\n\n')
    : '_No components documented yet. Run `/add-component` to add the first one._'

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
  const next = `${before}\n\n${body}\n\n${after}`

  // Side-effect import registry so the component browser can render live previews
  // without a hand-maintained import list. Includes each documented component
  // plus every jh-* element (icons included) referenced inside its examples.
  const previewImports = collectPreviewImports(docs)
  const registry = [
    '// AUTO-GENERATED by scripts/generate-component-docs.ts — do not edit.',
    '// Registers documented components and elements used in their examples so',
    '// the component browser can render live previews.',
    ...previewImports.map(spec => `import '${spec}'`),
    '',
  ].join('\n')

  const currentRegistry = existsSync(REGISTRY) ? await readFile(REGISTRY, 'utf8') : ''

  if (process.argv.includes('--check')) {
    const stale: string[] = []
    if (next !== md) stale.push('CLAUDE.md component reference')
    if (registry !== currentRegistry) stale.push('src/data/components/_registry.generated.ts')
    if (stale.length) {
      console.error('✗ Generated files are out of date:')
      for (const s of stale) console.error(`  - ${s}`)
      console.error('\nRun `npm run docs` and commit the result.')
      process.exit(1)
    }
    console.log('✓ Generated files are up to date')
    return
  }

  if (next !== md) {
    await writeFile(CLAUDE_MD, next)
    console.log(`✓ CLAUDE.md component reference generated from ${docs.length} component(s)`)
  } else {
    console.log('✓ CLAUDE.md already up to date')
  }

  if (registry !== currentRegistry) {
    await writeFile(REGISTRY, registry)
    console.log(`✓ component preview registry written (${previewImports.length} import(s))`)
  } else {
    console.log('✓ component preview registry already up to date')
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})

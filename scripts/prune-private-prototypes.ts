/**
 * Deletes every prototype directory not marked `public: true` in its
 * meta.ts, from THIS checkout only. Run exclusively inside the external
 * (CU-facing) deploy pipeline, against that pipeline's own ephemeral CI
 * checkout — never as part of `npm run dev`, never against a designer's
 * local working tree, never in the internal deploy. See CLAUDE.md's
 * "External / CU-facing gallery" section.
 */
import { readdirSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { PrototypeMeta } from '../src/components/proto-card.js'

const PROTOTYPES_DIR = resolve('src/prototypes')
const EXTERNAL_LINKS_PATH = resolve('src/data/external-links.json')

async function main() {
  const designers = readdirSync(PROTOTYPES_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name !== '_template')

  let kept = 0
  let removed = 0

  for (const designer of designers) {
    const designerDir = resolve(PROTOTYPES_DIR, designer.name)
    const prototypes = readdirSync(designerDir, { withFileTypes: true }).filter(entry => entry.isDirectory())

    for (const prototype of prototypes) {
      const dir = resolve(designerDir, prototype.name)
      const metaPath = resolve(dir, 'meta.ts')

      let meta: PrototypeMeta | undefined
      try {
        meta = (await import(pathToFileURL(metaPath).href)).meta
      } catch {
        meta = undefined
      }

      if (meta?.public === true) {
        kept++
      } else {
        rmSync(dir, { recursive: true, force: true })
        removed++
        console.log(`Pruned ${designer.name}/${prototype.name} (not marked public)`)
      }
    }
  }

  // Curated external links (Figma/doc links designers added via the gallery's
  // "Link external" dialog) are internal by nature — the gallery already
  // skips rendering them in the external build, but the raw JSON is still
  // statically imported by proto-gallery.ts, so it'd ship in the bundle
  // unless we blank it here too, same as any other private content.
  writeFileSync(EXTERNAL_LINKS_PATH, '[]\n', 'utf-8')
  console.log('Cleared external-links.json for the external build.')

  console.log(`Done — kept ${kept} public prototype(s), pruned ${removed}.`)
}

main()

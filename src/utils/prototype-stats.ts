// Lets the "Why this exists" vision page show real counts instead of
// hand-typed numbers that go stale the moment a prototype is added. Reads
// the same meta.ts files the gallery already globs (see loadPrototypes() in
// proto-gallery.ts) — this works identically in `npm run dev` and the
// deployed static build, since import.meta.glob is resolved at bundle time,
// no server required.

export interface PrototypeStats {
  prototypeCount: number
  designerCount: number
}

export function getPrototypeStats(): PrototypeStats {
  const metaModules = import.meta.glob('../prototypes/**/meta.ts', { eager: true }) as Record<string, unknown>
  const designers = new Set<string>()
  let prototypeCount = 0

  for (const path of Object.keys(metaModules)) {
    if (path.includes('/_template/')) continue
    prototypeCount++
    const stripped = path.replace('../prototypes/', '').replace('/meta.ts', '')
    const [designer] = stripped.split('/')
    // "example" is a placeholder demo prototype, not a real designer.
    if (designer && designer !== 'example') designers.add(designer)
  }

  return { prototypeCount, designerCount: designers.size }
}

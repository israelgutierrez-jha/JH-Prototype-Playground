import { defineConfig, type Plugin } from 'vite'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const repoName = process.env.GITHUB_REPOSITORY
  ? process.env.GITHUB_REPOSITORY.split('/')[1]
  : ''

// Computed once, at build/dev-server-start time, and baked in via `define`
// below — so the "Why this exists" page's repo-age stat refreshes itself on
// every deploy (GitHub Actions rebuilds on every push to main) without
// anyone needing to hand-edit a number. Falls back to zeros if git isn't
// available for some reason, rather than failing the build.
function getRepoStats(): { weeksSinceFirstCommit: number; commitCount: number } {
  try {
    // `git log --reverse ... -1` is a known gotcha: `-1` caps the walk to
    // the most recent commit *before* --reverse reorders it, so it silently
    // returns today's date instead of the first commit's. List them all and
    // take the first line instead.
    const firstCommitEpoch = Number(
      execFileSync('git', ['log', '--reverse', '--format=%ct']).toString().trim().split('\n')[0]
    )
    const commitCount = Number(execFileSync('git', ['rev-list', '--count', 'HEAD']).toString().trim())
    const weeksSinceFirstCommit = Math.max(
      0,
      Math.floor((Date.now() / 1000 - firstCommitEpoch) / (60 * 60 * 24 * 7))
    )
    return { weeksSinceFirstCommit, commitCount }
  } catch {
    return { weeksSinceFirstCommit: 0, commitCount: 0 }
  }
}

const repoStats = getRepoStats()

const SAFE_SEGMENT = /^[a-z0-9-]+$/

// Replaces `field`'s value if present in the meta object literal, otherwise
// inserts it right after the opening brace — lets us add `public`/
// `passwordHash` to older meta.ts files that predate those fields, while
// title/description (present in every meta.ts today) still just replace.
function upsertMetaField(source: string, field: string, value: string | boolean): string {
  const serialized = typeof value === 'boolean' ? String(value) : JSON.stringify(value)
  const pattern = new RegExp(`(\\b${field}:\\s*)(?:(['"\`])(?:\\\\.|(?!\\2).)*\\2|true|false)`, 's')
  if (pattern.test(source)) {
    return source.replace(pattern, `$1${serialized}`)
  }

  const openBrace = /(meta:\s*PrototypeMeta\s*=\s*\{)/
  if (!openBrace.test(source)) {
    throw new Error('Could not find the meta object literal to update in meta.ts')
  }
  return source.replace(openBrace, `$1\n  ${field}: ${serialized},`)
}

function metaHasNonEmptyPasswordHash(source: string): boolean {
  const match = source.match(/\bpasswordHash:\s*(['"`])((?:\\.|(?!\1).)*)\1/s)
  return !!match && match[2].length > 0
}

function metaIsPublic(source: string): boolean {
  return /\bpublic:\s*true\b/.test(source)
}

function readRequestBody(req: import('node:http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

// Every writer plugin below does read-file → modify in memory → write-file.
// Two requests to the same file racing that sequence (e.g. two quick edits,
// or two people using the board at once) can silently drop one write. Queue
// each file's operations through here so they run one at a time. This only
// protects against concurrent requests *within this dev server process* —
// running two separate `npm run dev` instances against the same repo can
// still race, since there's no cross-process lock.
const fileLocks = new Map<string, Promise<unknown>>()

function withFileLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const previous = fileLocks.get(key) ?? Promise.resolve()
  const run = previous.then(fn, fn)
  fileLocks.set(key, run.then(() => undefined, () => undefined))
  return run
}

// Dev-only endpoint that lets the running playground edit a prototype's own
// meta.ts (title/description) in place, so changes land in the real source
// file and show up in `git diff` instead of living only in browser storage.
function protoMetaWriterPlugin(): Plugin {
  return {
    name: 'proto-meta-writer',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__proto-api/meta', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }

        try {
          const body = JSON.parse(await readRequestBody(req))
          const { designer, name, title, description, public: isPublic, passwordHash } = body ?? {}

          if (typeof designer !== 'string' || !SAFE_SEGMENT.test(designer)) {
            throw new Error('Invalid designer')
          }
          if (typeof name !== 'string' || !SAFE_SEGMENT.test(name)) {
            throw new Error('Invalid prototype name')
          }
          if (typeof title !== 'string' || !title.trim()) {
            throw new Error('Title cannot be empty')
          }
          if (title.length > 120) {
            throw new Error('Title is too long (max 120 characters)')
          }
          if (typeof description !== 'string') {
            throw new Error('Description must be a string')
          }
          if (description.length > 500) {
            throw new Error('Description is too long (max 500 characters)')
          }
          if (isPublic !== undefined && typeof isPublic !== 'boolean') {
            throw new Error('public must be a boolean')
          }
          // passwordHash: undefined = leave unchanged, '' = clear, otherwise
          // must look like a hex SHA-256 digest — the client always hashes
          // before sending, so anything else means a bug upstream, not a
          // real password making it here.
          if (passwordHash !== undefined && passwordHash !== '' && !/^[a-f0-9]{64}$/.test(passwordHash)) {
            throw new Error('passwordHash must be empty or a hex SHA-256 digest')
          }

          const filePath = path.resolve(server.config.root, 'src/prototypes', designer, name, 'meta.ts')
          const protoRoot = path.resolve(server.config.root, 'src/prototypes')
          if (!filePath.startsWith(protoRoot + path.sep)) {
            throw new Error('Invalid path')
          }

          const result = await withFileLock(filePath, async () => {
            let source: string
            try {
              source = await fs.readFile(filePath, 'utf-8')
            } catch {
              throw new Error(`meta.ts not found for ${designer}/${name}`)
            }

            source = upsertMetaField(source, 'title', title.trim())
            source = upsertMetaField(source, 'description', description.trim())
            if (typeof isPublic === 'boolean') {
              source = upsertMetaField(source, 'public', isPublic)
            }
            if (typeof passwordHash === 'string') {
              source = upsertMetaField(source, 'passwordHash', passwordHash)
            }
            await fs.writeFile(filePath, source, 'utf-8')
            return { public: metaIsPublic(source), hasPassword: metaHasNonEmptyPasswordHash(source) }
          })

          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(JSON.stringify({
            ok: true,
            title: title.trim(),
            description: description.trim(),
            public: result.public,
            hasPassword: result.hasPassword,
          }))
        } catch (err) {
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 400
          res.end(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }))
        }
      })
    },
  }
}

interface ExternalLinkRecord {
  id: string
  title: string
  url: string
  designer: string
  description: string
  createdAt: string
}

const EXTERNAL_LINKS_PATH = 'src/data/external-links.json'

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

async function readExternalLinks(root: string): Promise<ExternalLinkRecord[]> {
  try {
    const raw = await fs.readFile(path.resolve(root, EXTERNAL_LINKS_PATH), 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeExternalLinks(root: string, links: ExternalLinkRecord[]): Promise<void> {
  await fs.writeFile(path.resolve(root, EXTERNAL_LINKS_PATH), `${JSON.stringify(links, null, 2)}\n`, 'utf-8')
}

// Dev-only endpoint that lets the gallery's "Link external" dialog persist to
// the real external-links.json file (add via POST, remove via DELETE),
// instead of browser localStorage — same idea as proto-meta-writer above.
function externalLinksWriterPlugin(): Plugin {
  return {
    name: 'proto-external-links-writer',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__proto-api/external-links', async (req, res) => {
        res.setHeader('Content-Type', 'application/json')

        try {
          if (req.method === 'POST') {
            const body = JSON.parse(await readRequestBody(req))
            const title = typeof body?.title === 'string' ? body.title.trim() : ''
            const url = typeof body?.url === 'string' ? body.url.trim() : ''
            const designer = typeof body?.designer === 'string' ? body.designer.trim() : ''
            const description = typeof body?.description === 'string' ? body.description.trim() : ''

            if (!url || !isHttpUrl(url)) throw new Error('A valid http(s) URL is required')
            if (title.length > 120) throw new Error('Title is too long (max 120 characters)')
            if (designer.length > 60) throw new Error('Name is too long (max 60 characters)')
            if (description.length > 500) throw new Error('Description is too long (max 500 characters)')

            const entry: ExternalLinkRecord = {
              id: `ext-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              title: title || new URL(url).hostname.replace(/^www\./, ''),
              url,
              designer: designer || 'anonymous',
              description,
              createdAt: new Date().toISOString().slice(0, 10),
            }

            await withFileLock(EXTERNAL_LINKS_PATH, async () => {
              const links = await readExternalLinks(server.config.root)
              links.push(entry)
              await writeExternalLinks(server.config.root, links)
            })

            res.statusCode = 200
            res.end(JSON.stringify({ ok: true, entry }))
            return
          }

          if (req.method === 'DELETE') {
            const body = JSON.parse(await readRequestBody(req))
            const id = typeof body?.id === 'string' ? body.id : ''
            if (!id) throw new Error('Missing id')

            await withFileLock(EXTERNAL_LINKS_PATH, async () => {
              const links = await readExternalLinks(server.config.root)
              await writeExternalLinks(server.config.root, links.filter(link => link.id !== id))
            })

            res.statusCode = 200
            res.end(JSON.stringify({ ok: true }))
            return
          }

          res.statusCode = 405
          res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }))
        } catch (err) {
          res.statusCode = 400
          res.end(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }))
        }
      })
    },
  }
}

const FEATURE_COLUMN_IDS = ['requested', 'planned', 'in-progress', 'shipped'] as const
type FeatureColumnId = (typeof FEATURE_COLUMN_IDS)[number]

interface FeatureCardRecord {
  id: string
  title: string
  description: string
  submittedBy: string
  assignedTo: string
  votes: number
  tags: string[]
  column: FeatureColumnId
}

const FEATURES_PATH = 'src/data/features.json'

function isFeatureColumnId(value: unknown): value is FeatureColumnId {
  return typeof value === 'string' && (FEATURE_COLUMN_IDS as readonly string[]).includes(value)
}

async function readFeatureCards(root: string): Promise<FeatureCardRecord[]> {
  try {
    const raw = await fs.readFile(path.resolve(root, FEATURES_PATH), 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeFeatureCards(root: string, cards: FeatureCardRecord[]): Promise<void> {
  await fs.writeFile(path.resolve(root, FEATURES_PATH), `${JSON.stringify(cards, null, 2)}\n`, 'utf-8')
}

// Dev-only endpoint backing the Features Kanban board: POST to submit a new
// card, PATCH to update one (move to a column and/or edit its content),
// DELETE to remove one — all persisted to the real features.json, same
// pattern as external links.
function featuresWriterPlugin(): Plugin {
  return {
    name: 'proto-features-writer',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__proto-api/features', async (req, res) => {
        res.setHeader('Content-Type', 'application/json')

        try {
          if (req.method === 'POST') {
            const body = JSON.parse(await readRequestBody(req))
            const title = typeof body?.title === 'string' ? body.title.trim() : ''
            const description = typeof body?.description === 'string' ? body.description.trim() : ''
            const submittedBy = typeof body?.submittedBy === 'string' ? body.submittedBy.trim() : ''
            const tags = Array.isArray(body?.tags)
              ? body.tags.filter((t: unknown): t is string => typeof t === 'string' && t.trim().length > 0).map((t: string) => t.trim())
              : []
            const column = isFeatureColumnId(body?.column) ? body.column : 'requested'

            if (!title) throw new Error('Title cannot be empty')
            if (title.length > 120) throw new Error('Title is too long (max 120 characters)')
            if (description.length > 500) throw new Error('Description is too long (max 500 characters)')
            if (submittedBy.length > 60) throw new Error('Name is too long (max 60 characters)')

            const entry: FeatureCardRecord = {
              id: `feat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              title,
              description,
              submittedBy: submittedBy || 'anonymous',
              assignedTo: '',
              votes: 0,
              tags,
              column,
            }

            await withFileLock(FEATURES_PATH, async () => {
              const cards = await readFeatureCards(server.config.root)
              cards.push(entry)
              await writeFeatureCards(server.config.root, cards)
            })

            res.statusCode = 200
            res.end(JSON.stringify({ ok: true, entry }))
            return
          }

          if (req.method === 'PATCH') {
            const body = JSON.parse(await readRequestBody(req))
            const id = typeof body?.id === 'string' ? body.id : ''
            if (!id) throw new Error('Missing id')

            const updatedCard = await withFileLock(FEATURES_PATH, async () => {
              const cards = await readFeatureCards(server.config.root)
              const card = cards.find(c => c.id === id)
              if (!card) throw new Error('Card not found')

              // Every field is optional — only what's present gets updated, so
              // moving a card (column-only) and editing its content are both
              // just partial updates through the same endpoint.
              if (body.column !== undefined) {
                if (!isFeatureColumnId(body.column)) throw new Error('Invalid column')
                card.column = body.column
              }
              if (body.title !== undefined) {
                const title = typeof body.title === 'string' ? body.title.trim() : ''
                if (!title) throw new Error('Title cannot be empty')
                if (title.length > 120) throw new Error('Title is too long (max 120 characters)')
                card.title = title
              }
              if (body.description !== undefined) {
                const description = typeof body.description === 'string' ? body.description.trim() : ''
                if (description.length > 500) throw new Error('Description is too long (max 500 characters)')
                card.description = description
              }
              if (body.submittedBy !== undefined) {
                const submittedBy = typeof body.submittedBy === 'string' ? body.submittedBy.trim() : ''
                if (submittedBy.length > 60) throw new Error('Name is too long (max 60 characters)')
                card.submittedBy = submittedBy || 'anonymous'
              }
              if (body.assignedTo !== undefined) {
                const assignedTo = typeof body.assignedTo === 'string' ? body.assignedTo.trim() : ''
                if (assignedTo.length > 60) throw new Error('Name is too long (max 60 characters)')
                // Unlike submittedBy, an empty assignee is meaningful (nobody
                // has picked it up yet) — don't fall back to "anonymous".
                card.assignedTo = assignedTo
              }
              if (body.tags !== undefined) {
                card.tags = Array.isArray(body.tags)
                  ? body.tags
                      .filter((t: unknown): t is string => typeof t === 'string' && t.trim().length > 0)
                      .map((t: string) => t.trim())
                  : []
              }
              // Incremented server-side (inside the file lock) rather than
              // accepting a client-computed absolute value, so two people
              // upvoting around the same moment can't clobber each other.
              if (body.incrementVotes === true) {
                card.votes = (typeof card.votes === 'number' ? card.votes : 0) + 1
              }

              await writeFeatureCards(server.config.root, cards)
              return card
            })

            res.statusCode = 200
            res.end(JSON.stringify({ ok: true, entry: updatedCard }))
            return
          }

          if (req.method === 'DELETE') {
            const body = JSON.parse(await readRequestBody(req))
            const id = typeof body?.id === 'string' ? body.id : ''
            if (!id) throw new Error('Missing id')

            await withFileLock(FEATURES_PATH, async () => {
              const cards = await readFeatureCards(server.config.root)
              await writeFeatureCards(server.config.root, cards.filter(c => c.id !== id))
            })

            res.statusCode = 200
            res.end(JSON.stringify({ ok: true }))
            return
          }

          res.statusCode = 405
          res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }))
        } catch (err) {
          res.statusCode = 400
          res.end(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }))
        }
      })
    },
  }
}

// Dev-only, read-only endpoint the running app polls to nudge a designer to
// restart `npm run dev` when `main` has moved ahead — never pulls or installs
// anything itself, that only happens at the next `npm run dev` start
// (scripts/dev-update.js).
function updateStatusPlugin(): Plugin {
  return {
    name: 'proto-update-status',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__proto-api/update-status', (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        try {
          execFileSync('git', ['fetch'], { stdio: 'ignore' })
          const local = execFileSync('git', ['rev-parse', 'HEAD']).toString().trim()
          const upstream = execFileSync('git', ['rev-parse', '@{u}']).toString().trim()
          res.end(JSON.stringify({ updateAvailable: local !== upstream }))
        } catch {
          // No git, no upstream, offline, etc. — fail silent, no update to report.
          res.end(JSON.stringify({ updateAvailable: false }))
        }
      })
    },
  }
}

interface DesignerProfile {
  name: string
  onboarded: boolean
}

const DESIGNER_PROFILE_PATH = '.designer.local.json'

async function readDesignerProfile(root: string): Promise<DesignerProfile> {
  try {
    const raw = await fs.readFile(path.resolve(root, DESIGNER_PROFILE_PATH), 'utf-8')
    const parsed = JSON.parse(raw)
    return {
      name: typeof parsed?.name === 'string' ? parsed.name : '',
      onboarded: !!parsed?.onboarded,
    }
  } catch {
    return { name: '', onboarded: false }
  }
}

async function writeDesignerProfile(root: string, profile: DesignerProfile): Promise<void> {
  await fs.writeFile(path.resolve(root, DESIGNER_PROFILE_PATH), `${JSON.stringify(profile, null, 2)}\n`, 'utf-8')
}

// Dev-only endpoint backing the onboarding flow's designer name — persisted
// to a gitignored local file (not localStorage) so Claude Code/Cursor slash
// commands running outside the browser can read the same value on disk.
function designerProfileWriterPlugin(): Plugin {
  return {
    name: 'proto-designer-profile-writer',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__proto-api/designer-profile', async (req, res) => {
        res.setHeader('Content-Type', 'application/json')

        try {
          if (req.method === 'GET') {
            const profile = await readDesignerProfile(server.config.root)
            res.statusCode = 200
            res.end(JSON.stringify(profile))
            return
          }

          if (req.method === 'POST') {
            const body = JSON.parse(await readRequestBody(req))
            const name = typeof body?.name === 'string' ? body.name.trim() : ''
            const onboarded = !!body?.onboarded

            if (name.length > 60) throw new Error('Name is too long (max 60 characters)')

            const profile: DesignerProfile = { name, onboarded }
            await withFileLock(DESIGNER_PROFILE_PATH, () => writeDesignerProfile(server.config.root, profile))

            res.statusCode = 200
            res.end(JSON.stringify({ ok: true, ...profile }))
            return
          }

          res.statusCode = 405
          res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }))
        } catch (err) {
          res.statusCode = 400
          res.end(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }))
        }
      })
    },
  }
}

const EXTERNAL_ACCESS_PATH = 'src/config/external-access.ts'

function upsertExternalAccessHash(source: string, hash: string): string {
  const serialized = JSON.stringify(hash)
  const pattern = /(galleryPasswordHash:\s*)(['"`])(?:\\.|(?!\2).)*\2/s
  if (!pattern.test(source)) {
    throw new Error('Could not find galleryPasswordHash field to update')
  }
  return source.replace(pattern, `$1${serialized}`)
}

// Dev-only endpoint for the global Settings page's "External gallery
// password" field — same read-modify-write-to-real-file pattern as
// proto-meta-writer above, just for the one repo-wide config in
// src/config/external-access.ts instead of a per-prototype meta.ts.
function externalAccessWriterPlugin(): Plugin {
  return {
    name: 'proto-external-access-writer',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__proto-api/external-access', async (req, res) => {
        res.setHeader('Content-Type', 'application/json')

        try {
          const filePath = path.resolve(server.config.root, EXTERNAL_ACCESS_PATH)

          if (req.method === 'GET') {
            let hasPassword = false
            try {
              const source = await fs.readFile(filePath, 'utf-8')
              const match = source.match(/galleryPasswordHash:\s*(['"`])((?:\\.|(?!\1).)*)\1/s)
              hasPassword = !!match && match[2].length > 0
            } catch {
              // File missing entirely — treat as no password set.
            }
            res.statusCode = 200
            res.end(JSON.stringify({ hasPassword }))
            return
          }

          if (req.method === 'POST') {
            const body = JSON.parse(await readRequestBody(req))
            const passwordHash = typeof body?.passwordHash === 'string' ? body.passwordHash : undefined

            if (passwordHash === undefined) throw new Error('passwordHash is required')
            if (passwordHash !== '' && !/^[a-f0-9]{64}$/.test(passwordHash)) {
              throw new Error('passwordHash must be empty or a hex SHA-256 digest')
            }

            await withFileLock(filePath, async () => {
              const source = await fs.readFile(filePath, 'utf-8')
              await fs.writeFile(filePath, upsertExternalAccessHash(source, passwordHash), 'utf-8')
            })

            res.statusCode = 200
            res.end(JSON.stringify({ ok: true, hasPassword: passwordHash.length > 0 }))
            return
          }

          res.statusCode = 405
          res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }))
        } catch (err) {
          res.statusCode = 400
          res.end(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }))
        }
      })
    },
  }
}

export default defineConfig({
  base: repoName ? `/${repoName}/` : '/',
  define: {
    __REPO_STATS__: JSON.stringify(repoStats),
  },
  plugins: [
    protoMetaWriterPlugin(),
    externalLinksWriterPlugin(),
    featuresWriterPlugin(),
    updateStatusPlugin(),
    designerProfileWriterPlugin(),
    externalAccessWriterPlugin(),
  ],
  server: {
    // Keep this in sync with DEV_PORT in scripts/dev-update.js. strictPort
    // means a second `npm run dev` while one's already running fails loudly
    // instead of silently opening a duplicate server on the next free port.
    port: 5173,
    strictPort: true,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
  },
})

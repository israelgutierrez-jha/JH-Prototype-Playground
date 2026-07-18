import { defineConfig, type Plugin } from 'vite'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

// GITHUB_REPOSITORY is a GitHub Actions default env var and cannot be
// overridden via a workflow's `env:` block (GitHub silently ignores attempts
// to do so) — so the external deploy workflow, which needs the *other*
// repo's name for this build's asset base path, sets BASE_REPO_NAME instead.
const repoName = process.env.BASE_REPO_NAME
  || (process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : '')

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
  // Use replacement *functions*, not replacement strings: `serialized` is
  // attacker-/user-influenced (a title or description containing `$'`, `` $` ``,
  // `$&`, or `$1` would otherwise be interpreted by String.replace's special
  // replacement patterns), which would corrupt meta.ts on write — and since
  // every meta.ts is eagerly imported by the app, a crafted value could inject
  // executable TypeScript. A function replacement inserts the text verbatim.
  const pattern = new RegExp(`(\\b${field}:\\s*)(?:(['"\`])(?:\\\\.|(?!\\2).)*\\2|true|false)`, 's')
  if (pattern.test(source)) {
    return source.replace(pattern, (_match, prefix: string) => `${prefix}${serialized}`)
  }

  const openBrace = /(meta:\s*PrototypeMeta\s*=\s*\{)/
  if (!openBrace.test(source)) {
    throw new Error('Could not find the meta object literal to update in meta.ts')
  }
  return source.replace(openBrace, (_match, brace: string) => `${brace}\n  ${field}: ${serialized},`)
}

// Reads back a string field's current value from meta.ts source — used both
// to derive the response (so it reflects what's actually on disk) and to
// detect when a link field is changing, so stale snapshot fields tied to it
// (e.g. a Jira ticket's summary) can be cleared rather than left stale.
function extractMetaField(source: string, field: string): string {
  const match = source.match(new RegExp(`\\b${field}:\\s*(['"\`])((?:\\\\.|(?!\\1).)*)\\1`, 's'))
  return match ? match[2] : ''
}

function metaHasNonEmptyPasswordHash(source: string): boolean {
  return extractMetaField(source, 'passwordHash').length > 0
}

function metaIsPublic(source: string): boolean {
  return /\bpublic:\s*true\b/.test(source)
}

function assertOptionalUrl(value: unknown, field: string): void {
  if (value === undefined) return
  if (typeof value !== 'string') throw new Error(`${field} must be a string`)
  if (value.length > 500) throw new Error(`${field} is too long (max 500 characters)`)
  if (value !== '' && !/^https?:\/\//.test(value)) throw new Error(`${field} must be empty or a valid http(s) URL`)
}

function assertOptionalText(value: unknown, field: string, maxLength: number): void {
  if (value === undefined) return
  if (typeof value !== 'string') throw new Error(`${field} must be a string`)
  if (value.length > maxLength) throw new Error(`${field} is too long (max ${maxLength} characters)`)
}

function readRequestBody(req: import('node:http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

// CSRF / cross-origin guard for the dev-only /__proto-api endpoints.
//
// These middlewares are registered from inside `configureServer`, which Vite
// runs BEFORE it installs its own CORS + host-check middleware — so those
// built-in protections never apply to our routes. Without a guard, any webpage
// a designer happens to have open while `npm run dev` is running could fire a
// "simple" cross-origin request (e.g. a text/plain POST, which skips the CORS
// preflight) at these endpoints and write to disk: rewrite a prototype's
// meta.ts, flip `public: true` to stage it for the external gallery, or
// overwrite .designer.local.json.
//
// We reject a request when the browser tells us it's cross-site via
// Sec-Fetch-Site, or when an Origin header is present and its host doesn't
// match the server's own Host. Requests with no Origin and no cross-site fetch
// metadata (curl, editor/CLI tooling, same-origin GETs that omit Origin) are
// allowed through, so legitimate same-origin app usage and the slash-command
// tooling keep working.
function isCrossOriginRequest(req: import('node:http').IncomingMessage): boolean {
  const secFetchSite = req.headers['sec-fetch-site']
  if (secFetchSite === 'cross-site' || secFetchSite === 'same-site') return true

  const origin = req.headers.origin
  if (typeof origin === 'string' && origin !== '') {
    try {
      if (new URL(origin).host !== req.headers.host) return true
    } catch {
      return true // unparseable Origin — treat as hostile
    }
  }
  return false
}

// Returns true (and writes a 403) if the request is cross-origin, so callers
// can `if (rejectCrossOrigin(req, res)) return` as the first line of a handler.
function rejectCrossOrigin(
  req: import('node:http').IncomingMessage,
  res: import('node:http').ServerResponse,
): boolean {
  if (!isCrossOriginRequest(req)) return false
  res.setHeader('Content-Type', 'application/json')
  res.statusCode = 403
  res.end(JSON.stringify({ ok: false, error: 'Cross-origin requests are not allowed' }))
  return true
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
        if (rejectCrossOrigin(req, res)) return
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }

        try {
          const body = JSON.parse(await readRequestBody(req))
          const {
            designer, name, title, description, public: isPublic, passwordHash,
            figmaLink, figmaFrameName, jiraLink, jiraTicketKey, jiraTicketSummary,
          } = body ?? {}

          if (typeof designer !== 'string' || !SAFE_SEGMENT.test(designer)) {
            throw new Error('Invalid designer')
          }
          if (typeof name !== 'string' || !SAFE_SEGMENT.test(name)) {
            throw new Error('Invalid prototype name')
          }
          // title/description/public/passwordHash: all optional-if-provided —
          // the pencil-icon "Prototype settings" dialog sends all four, while
          // the header's "Related links" mini-editor only ever sends
          // figmaLink/jiraLink, so neither caller should be forced to send
          // fields it has no draft state for.
          if (title !== undefined) {
            if (typeof title !== 'string' || !title.trim()) {
              throw new Error('Title cannot be empty')
            }
            if (title.length > 120) {
              throw new Error('Title is too long (max 120 characters)')
            }
          }
          if (description !== undefined) {
            if (typeof description !== 'string') {
              throw new Error('Description must be a string')
            }
            if (description.length > 500) {
              throw new Error('Description is too long (max 500 characters)')
            }
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
          assertOptionalUrl(figmaLink, 'figmaLink')
          assertOptionalText(figmaFrameName, 'figmaFrameName', 200)
          assertOptionalUrl(jiraLink, 'jiraLink')
          assertOptionalText(jiraTicketKey, 'jiraTicketKey', 50)
          assertOptionalText(jiraTicketSummary, 'jiraTicketSummary', 200)

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

            if (typeof title === 'string') source = upsertMetaField(source, 'title', title.trim())
            if (typeof description === 'string') source = upsertMetaField(source, 'description', description.trim())
            if (typeof isPublic === 'boolean') {
              source = upsertMetaField(source, 'public', isPublic)
            }
            if (typeof passwordHash === 'string') {
              source = upsertMetaField(source, 'passwordHash', passwordHash)
            }

            // Changing a link without also sending its snapshot fields in the
            // same request means it came from the browser-side mini-editor
            // (no MCP access there) — clear the now-unverified snapshot
            // rather than leaving it attached to a different link.
            if (typeof figmaLink === 'string') {
              const currentFigmaLink = extractMetaField(source, 'figmaLink')
              const nextFigmaLink = figmaLink.trim()
              source = upsertMetaField(source, 'figmaLink', nextFigmaLink)
              if (nextFigmaLink !== currentFigmaLink && typeof figmaFrameName !== 'string') {
                source = upsertMetaField(source, 'figmaFrameName', '')
              }
            }
            if (typeof figmaFrameName === 'string') {
              source = upsertMetaField(source, 'figmaFrameName', figmaFrameName.trim())
            }
            if (typeof jiraLink === 'string') {
              const currentJiraLink = extractMetaField(source, 'jiraLink')
              const nextJiraLink = jiraLink.trim()
              source = upsertMetaField(source, 'jiraLink', nextJiraLink)
              if (nextJiraLink !== currentJiraLink && typeof jiraTicketKey !== 'string' && typeof jiraTicketSummary !== 'string') {
                source = upsertMetaField(source, 'jiraTicketKey', '')
                source = upsertMetaField(source, 'jiraTicketSummary', '')
              }
            }
            if (typeof jiraTicketKey === 'string') {
              source = upsertMetaField(source, 'jiraTicketKey', jiraTicketKey.trim())
            }
            if (typeof jiraTicketSummary === 'string') {
              source = upsertMetaField(source, 'jiraTicketSummary', jiraTicketSummary.trim())
            }

            await fs.writeFile(filePath, source, 'utf-8')
            return {
              title: extractMetaField(source, 'title'),
              description: extractMetaField(source, 'description'),
              public: metaIsPublic(source),
              hasPassword: metaHasNonEmptyPasswordHash(source),
              figmaLink: extractMetaField(source, 'figmaLink'),
              figmaFrameName: extractMetaField(source, 'figmaFrameName'),
              jiraLink: extractMetaField(source, 'jiraLink'),
              jiraTicketKey: extractMetaField(source, 'jiraTicketKey'),
              jiraTicketSummary: extractMetaField(source, 'jiraTicketSummary'),
            }
          })

          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(JSON.stringify({ ok: true, ...result }))
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
        if (rejectCrossOrigin(req, res)) return
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
        if (rejectCrossOrigin(req, res)) return
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
      server.middlewares.use('/__proto-api/update-status', (req, res) => {
        if (rejectCrossOrigin(req, res)) return
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
  browserVerificationEnabled: boolean
}

const DESIGNER_PROFILE_PATH = '.designer.local.json'

async function readDesignerProfile(root: string): Promise<DesignerProfile> {
  try {
    const raw = await fs.readFile(path.resolve(root, DESIGNER_PROFILE_PATH), 'utf-8')
    const parsed = JSON.parse(raw)
    return {
      name: typeof parsed?.name === 'string' ? parsed.name : '',
      onboarded: !!parsed?.onboarded,
      browserVerificationEnabled: !!parsed?.browserVerificationEnabled,
    }
  } catch {
    return { name: '', onboarded: false, browserVerificationEnabled: false }
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
        if (rejectCrossOrigin(req, res)) return
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
            const browserVerificationEnabled = !!body?.browserVerificationEnabled

            if (name.length > 60) throw new Error('Name is too long (max 60 characters)')

            const profile: DesignerProfile = { name, onboarded, browserVerificationEnabled }
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

import { defineConfig, type Plugin } from 'vite'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const repoName = process.env.GITHUB_REPOSITORY
  ? process.env.GITHUB_REPOSITORY.split('/')[1]
  : ''

const SAFE_SEGMENT = /^[a-z0-9-]+$/

function updateMetaField(source: string, field: 'title' | 'description', value: string): string {
  const serialized = JSON.stringify(value)
  const pattern = new RegExp(`(\\b${field}:\\s*)(['"\`])(?:\\\\.|(?!\\2).)*\\2`, 's')
  if (!pattern.test(source)) {
    throw new Error(`Could not find a "${field}" field to update in meta.ts`)
  }
  return source.replace(pattern, `$1${serialized}`)
}

function readRequestBody(req: import('node:http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
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
          const { designer, name, title, description } = body ?? {}

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

          const filePath = path.resolve(server.config.root, 'src/prototypes', designer, name, 'meta.ts')
          const protoRoot = path.resolve(server.config.root, 'src/prototypes')
          if (!filePath.startsWith(protoRoot + path.sep)) {
            throw new Error('Invalid path')
          }

          let source: string
          try {
            source = await fs.readFile(filePath, 'utf-8')
          } catch {
            throw new Error(`meta.ts not found for ${designer}/${name}`)
          }

          source = updateMetaField(source, 'title', title.trim())
          source = updateMetaField(source, 'description', description.trim())
          await fs.writeFile(filePath, source, 'utf-8')

          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(JSON.stringify({ ok: true, title: title.trim(), description: description.trim() }))
        } catch (err) {
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 400
          res.end(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }))
        }
      })
    },
  }
}

export default defineConfig({
  base: repoName ? `/${repoName}/` : '/',
  plugins: [protoMetaWriterPlugin()],
  build: {
    target: 'es2020',
    outDir: 'dist',
  },
})

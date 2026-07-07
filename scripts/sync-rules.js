import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, unlinkSync } from 'fs'
import { join } from 'path'
import { mcpServers } from './mcp-servers.js'

// CLAUDE.md -> .cursorrules
const content = readFileSync('CLAUDE.md', 'utf8')
writeFileSync('.cursorrules', content)
console.log('✓ .cursorrules synced from CLAUDE.md')

// .claude/commands/*.md -> .cursor/commands/*.md (mirror, and drop stragglers)
const claudeCommandsDir = '.claude/commands'
const cursorCommandsDir = '.cursor/commands'

mkdirSync(cursorCommandsDir, { recursive: true })

const sourceFiles = readdirSync(claudeCommandsDir).filter((f) => f.endsWith('.md'))
for (const file of sourceFiles) {
  const body = readFileSync(join(claudeCommandsDir, file), 'utf8')
  writeFileSync(join(cursorCommandsDir, file), body)
}

const staleFiles = readdirSync(cursorCommandsDir).filter(
  (f) => f.endsWith('.md') && !sourceFiles.includes(f)
)
for (const file of staleFiles) {
  unlinkSync(join(cursorCommandsDir, file))
}

console.log(`✓ ${sourceFiles.length} command(s) synced to .cursor/commands/`)

// scripts/mcp-servers.js -> .mcp.json (Claude Code) + .cursor/mcp.json (Cursor)
const claudeMcpServers = {}
const cursorMcpServers = {}
for (const { name, url } of mcpServers) {
  claudeMcpServers[name] = { type: 'http', url }
  cursorMcpServers[name] = { url }
}

writeFileSync('.mcp.json', JSON.stringify({ mcpServers: claudeMcpServers }, null, 2) + '\n')
if (!existsSync('.cursor')) mkdirSync('.cursor', { recursive: true })
writeFileSync('.cursor/mcp.json', JSON.stringify({ mcpServers: cursorMcpServers }, null, 2) + '\n')

console.log(`✓ ${mcpServers.length} MCP server(s) synced to .mcp.json and .cursor/mcp.json`)

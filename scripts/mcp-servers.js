// Canonical list of MCP servers for this project. scripts/sync-rules.js
// generates .mcp.json (Claude Code) and .cursor/mcp.json (Cursor) from this
// list — edit here, not in either generated file.
//
// Two server shapes are supported:
//   - remote (http): { name, url }
//   - local (stdio):  { name, command, args }
export const mcpServers = [
  {
    name: 'figma',
    url: 'https://mcp.figma.com/mcp',
  },
  {
    name: 'chrome-devtools',
    command: 'npx',
    args: ['chrome-devtools-mcp@latest'],
  },
]

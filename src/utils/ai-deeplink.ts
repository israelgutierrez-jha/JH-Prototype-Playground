// Lets a single button open a designer's own AI tool with a prompt
// pre-filled, instead of always requiring a manual copy-paste. Which of
// Claude Code (terminal or VS Code) or Cursor to target is a per-designer
// choice — never something this repo can know or commit — so it lives in
// localStorage, same pattern as `proto-features.ts`'s VOTED_STORAGE_KEY.
//
// Every scheme below only pre-fills a prompt; none of them auto-execute.
// That's a deliberate security boundary in both tools, not a limitation of
// this integration — see code.claude.com/docs/en/deep-links,
// code.claude.com/docs/en/vs-code, and cursor.com/docs/integrations/deeplinks.

export type AiTool = 'claude-cli' | 'claude-vscode' | 'cursor' | 'skip' | null

export const AI_TOOL_OPTIONS: { tool: AiTool; label: string }[] = [
  { tool: 'claude-cli', label: 'Claude Code — Terminal' },
  { tool: 'claude-vscode', label: 'Claude Code — VS Code' },
  { tool: 'cursor', label: 'Cursor' },
]

const STORAGE_KEY = 'jh-ai-tool-preference'
const REPO = 'israelgutierrez-jha/JH-Prototype-Playground'

export function getAiTool(): AiTool {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return (raw as AiTool) || null
  } catch {
    return null
  }
}

export function setAiTool(tool: AiTool): void {
  try {
    localStorage.setItem(STORAGE_KEY, tool ?? '')
  } catch {
    // Storage unavailable (private browsing, disabled cookies) — the
    // preference just won't persist; buttons fall back to copy-to-clipboard.
  }
}

function buildDeepLinkUrl(tool: AiTool, prompt: string): string | null {
  const q = encodeURIComponent(prompt)
  switch (tool) {
    case 'claude-cli':
      return `claude-cli://open?repo=${REPO}&q=${q}`
    case 'claude-vscode':
      return `vscode://anthropic.claude-code/open?prompt=${q}`
    case 'cursor':
      return `cursor://anysphere.cursor-deeplink/prompt?text=${q}`
    default:
      return null
  }
}

export function aiActionLabel(tool: AiTool): string {
  if (tool === 'claude-cli' || tool === 'claude-vscode') return 'Open in Claude Code'
  if (tool === 'cursor') return 'Open in Cursor'
  return 'Copy prompt'
}

/**
 * Always copies `prompt` to the clipboard as a fallback (in case the deep
 * link silently no-ops, e.g. the app isn't installed/registered) — the
 * designer can still paste manually either way.
 */
export async function runAiPrompt(prompt: string): Promise<'opened' | 'copied'> {
  const tool = getAiTool()
  const url = buildDeepLinkUrl(tool, prompt)

  try {
    await navigator.clipboard.writeText(prompt)
  } catch {
    // Best effort — clipboard access can be denied; the deep link (if any)
    // still fires below.
  }

  if (url) {
    window.location.href = url
    return 'opened'
  }
  return 'copied'
}

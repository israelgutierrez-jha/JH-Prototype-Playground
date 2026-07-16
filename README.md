# JH Prototype Playground

A shared environment for the Jack Henry design team to rapidly prototype interactive UIs using the [JH Design System](https://jackhenry.design/), with Claude Code or Cursor as the AI pair.

## Philosophy

Prototypes should encounter reality as early as possible. This playground lets designers build with real JH components — the same ones that ship to production — so layout constraints, interaction patterns, and component APIs are validated before a line of production code is written.

## Prerequisites

You need **Node.js** (which includes npm) installed before running anything below.

- Check if you already have it: `node -v` and `npm -v` in your terminal
- If not, install it from [nodejs.org](https://nodejs.org/) — pick the **LTS** version, which is already recent enough for everything below
- If you already had Node installed from a while back, make sure it's not a stale patch: you need `20.19.0+`, `22.12.0+`, or `23+` — e.g. `20.18.0` is just one patch too old. This only matters for the Chrome DevTools check below; nothing else in the repo cares. Update via [nodejs.org](https://nodejs.org/) or `nvm install --lts` if needed.

No Artifactory token or JH internal network access required — all JH packages are bundled in the repo.

Claude can also open your running prototype in an actual Chrome window to check it visually (screenshots, clicking through flows) — pre-configured via Chrome DevTools MCP, no account needed, just Chrome installed and the Node version above. Nothing else to do — it launches on demand the first time Claude uses it, and a visible Chrome window opening on its own at that point is expected, not a bug.

**Bring your own AI and your own Figma.** This playground is AI-agnostic — use Claude Code or Cursor, whichever you already have. It doesn't bundle either tool or any credentials: you need your own Claude Code / Cursor install and, if you want to build prototypes from Figma designs (see [Building from a Figma design](#building-from-a-figma-design)), your own Figma account with access to the files you're prototyping from. The repo only ships shared *configuration* (which MCP server to connect to, which commands are available) — not licenses or logins.

## Quick start

```bash
# 1. Clone the repo
git clone https://github.com/israelgutierrez-jha/JH-Prototype-Playground.git
cd JH-Prototype-Playground

# 2. Install dependencies (all packages are bundled — no token needed)
npm install

# 3. Start the dev server
npm run dev
# → http://localhost:5173
```

## Connect Figma (one-time)

This repo ships with Figma's MCP server pre-configured (`.mcp.json` for Claude Code, `.cursor/mcp.json` for Cursor) — there's nothing to install, just a one-time authorization:

1. Open this repo in Claude Code or Cursor.
2. The first time you use a Figma-powered command (see [Building from a Figma design](#building-from-a-figma-design)), your editor will prompt you to authorize access — in Claude Code, run `/mcp` and choose "Authenticate"; in Cursor, open Settings → MCP and authorize the `figma` server.
3. Approve it once in the browser tab that opens. That's it — this persists per machine.

## Connect Jira (optional, one-time)

This repo also ships with Atlassian's MCP server pre-configured, the same way Figma's is. It's optional — it only powers `/figma-to-prototype`'s ability to attach a Jira ticket's real title to a prototype (see [Building from a Figma design](#building-from-a-figma-design)); everything else in this playground works without it.

1. Open this repo in Claude Code or Cursor.
2. The first time `/figma-to-prototype` asks about a Jira ticket, authorize access — in Claude Code, run `/mcp` and choose "Authenticate"; in Cursor, open Settings → MCP and authorize the `atlassian` server.
3. Approve it once in the browser tab that opens. That's it — this persists per machine. Skip it entirely and the command will just store the raw ticket URL without a title.

## Creating a prototype

With Claude Code or Cursor open, type:

```
/new-prototype
```

Claude will ask you for a name, description, and tags, then scaffold the prototype files and give you a link to preview it.

Or create the files manually:

```
src/prototypes/[your-name]/[prototype-name]/
  index.ts    ← your Lit component
  meta.ts     ← title, description, tags
```

See [CLAUDE.md](./CLAUDE.md) for the full component reference and patterns.

## Building from a Figma design

Already have the design in Figma? Skip the text description and rebuild it directly, using only real JH components:

```
/figma-to-prototype
```

You'll be asked for a Figma frame URL (must include a `node-id`) plus a name and tags. Claude fetches the design, maps every element to the closest `jh-*` component and `--jh-*` token, and scaffolds the same `meta.ts`/`index.ts` pair `/new-prototype` produces — asking you first if something in the design has no JH equivalent, rather than inventing custom markup. Requires the one-time Figma connection above. If your dev server is running, Claude will also open the result in Chrome and compare it against the Figma screenshot before handing it back to you.

## Getting help from Claude

| Slash command | What it does |
|---------------|-------------|
| `/new-prototype` | Scaffolds a new prototype with JH components based on your description |
| `/figma-to-prototype` | Scaffolds a new prototype by rebuilding a Figma design with JH components |
| `/use-jh-component` | Finds the right JH component for a UI pattern and shows usage |

## Rules

1. **JH components only** — no `<button>`, `<input>`, or external libraries. Use `jh-button`, `jh-input`, etc.
2. **JH tokens for styling** — `--jh-dimension-*`, `--jh-color-*`, `--jh-font-*` for all values.
3. **Your own folder** — work in `src/prototypes/[your-name]/` to avoid conflicts.
4. **No breaking the gallery** — prototypes are isolated; if yours errors it won't affect others.

## Deploying

Pushing to `main` automatically deploys to GitHub Pages via the Actions workflow. The JH Prototype Playground is accessible at:

```
https://israelgutierrez-jha.github.io/JH-Prototype-Playground/
```

## Tech stack

- [Vite 5](https://vitejs.dev/) — dev server and build
- [Lit 3](https://lit.dev/) — lightweight web components
- [`@jack-henry/jh-elements`](https://jackhenry.design/) — JH Design System components
- [`@jack-henry/jh-tokens`](https://jackhenry.design/) — design tokens (CSS custom properties)
- [`@jack-henry/jh-icons`](https://jackhenry.design/) — 388 icons
- GitHub Pages — hosting (static, no server needed)

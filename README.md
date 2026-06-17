# JH Prototype Playground

A shared environment for the Jack Henry design team to rapidly prototype interactive UIs using the [JH Design System](https://jackhenry.design/) with Claude Code as the AI pair.

## Philosophy

Prototypes should encounter reality as early as possible. This playground lets designers build with real JH components — the same ones that ship to production — so layout constraints, interaction patterns, and component APIs are validated before a line of production code is written.

## Quick start

```bash
# 1. Clone the repo
git clone https://github.com/israelgutierrez-jha/JH-Prototype-Playground.git
cd JH-Prototype-Playground

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
# → http://localhost:5173
```

## Creating a prototype

With Claude Code open in VS Code, type:

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

## Getting help from Claude

| Slash command | What it does |
|---------------|-------------|
| `/new-prototype` | Scaffolds a new prototype with JH components based on your description |
| `/use-jh-component` | Finds the right JH component for a UI pattern and shows usage |

## Rules

1. **JH components only** — no `<button>`, `<input>`, or external libraries. Use `jh-button`, `jh-input`, etc.
2. **JH tokens for styling** — `--jh-dimension-*`, `--jh-color-*`, `--jh-font-*` for all values.
3. **Your own folder** — work in `src/prototypes/[your-name]/` to avoid conflicts.
4. **No breaking the gallery** — prototypes are isolated; if yours errors it won't affect others.

## Deploying

Pushing to `main` automatically deploys to GitHub Pages via the Actions workflow. The gallery is accessible at:

```
https://[org].github.io/jh-prototype-playground/
```

> The repo must be **private** for GitHub Pages to restrict access to org members.

## Tech stack

- [Vite 5](https://vitejs.dev/) — dev server and build
- [Lit 3](https://lit.dev/) — lightweight web components
- [`@jack-henry/jh-elements`](https://jackhenry.design/) — JH Design System components
- [`@jack-henry/jh-tokens`](https://jackhenry.design/) — design tokens (CSS custom properties)
- [`@jack-henry/jh-icons`](https://jackhenry.design/) — 388 icons
- GitHub Pages — hosting (static, no server needed)

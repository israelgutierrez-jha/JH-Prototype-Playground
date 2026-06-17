# /new-prototype

Scaffold a new prototype in the JH Prototype Playground.

## Steps

1. Ask the user for:
   - Their name (to use as the folder name, e.g. `ivan-gutierrez`)
   - The prototype name (a short description that will become the folder name, e.g. `account-transfer`)
   - A brief description of what the prototype demonstrates (1–2 sentences)
   - Tags (comma-separated keywords, e.g. `forms, multi-step, accounts`)

2. Convert inputs to kebab-case:
   - designer folder: `[firstname-lastname]` lowercase
   - prototype folder: `[short-description-kebab]` lowercase

3. Create the folder: `src/prototypes/[designer]/[prototype-name]/`

4. **First-time designer check** — if `src/prototypes/[designer]/` does not already exist (this is their first prototype), also create:

   a. `src/prototypes/[designer]/CLAUDE.md` — personal context for Claude Code, layered on top of the root CLAUDE.md:

   ```markdown
   # [Designer Name] — Personal Context

   Designer: [designer]

   ## Current focus
   [prototype description from user input]

   ## Personal notes
   <!-- Add your own preferences, component quirks you've discovered, or reminders here -->
   ```

   b. `.cursor/rules/[designer].mdc` — personal context for Cursor, auto-attached when working in this designer's folder:

   ```markdown
   ---
   description: Personal context for [Designer Name]'s prototypes
   globs: src/prototypes/[designer]/**
   alwaysApply: false
   ---

   # [Designer Name] — Personal Context

   Designer: [designer]

   ## Current focus
   [prototype description from user input]

   ## Personal notes
   <!-- Add your own preferences, component quirks you've discovered, or reminders here -->
   ```

6. Create `meta.ts`:

```ts
import type { PrototypeMeta } from '../../../components/proto-card.js'

export const meta: PrototypeMeta = {
  title: '[Title from user input, title-cased]',
  description: '[Description from user input]',
  designer: '[designer]',
  tags: [/* tags from user input as string array */],
  createdAt: '[today's date in YYYY-MM-DD format]',
}
```

7. Create `index.ts` — based on the description, generate a realistic prototype using JH components. Refer to CLAUDE.md for the component reference and patterns. The prototype should:
   - Use `export default class [Name]Prototype extends LitElement` (no `@customElement` decorator)
   - Import only the JH components actually needed
   - Use `--jh-*` CSS custom properties for all spacing and colors
   - Implement the core interaction described by the user (not just a placeholder)
   - Show realistic-ish content (account numbers, names, dollar amounts — not "Lorem ipsum")

8. After creating the files, tell the user:
   - The path to their new prototype
   - To run `npm run dev` if not already running
   - The URL to visit: `http://localhost:5173/#/prototypes/[designer]/[name]`

## Important rules

- Never use `@customElement` in prototype files
- Never use Tailwind, Bootstrap, or any external CSS library
- Never use `<button>`, `<input>`, `<select>` — always use the `jh-` equivalents
- Always use `--jh-*` tokens for spacing, colors, and typography
- The prototype should be interactive and demonstrate a real design concept, not a skeleton

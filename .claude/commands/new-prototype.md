# /new-prototype

Scaffold a new prototype in the JH Prototype Playground.

## Steps

0. **Check for an existing designer profile first, but verify it against real folders before trusting it.** Look for `.designer.local.json` at the repo root. If it exists and its `name` field is non-empty, kebab-case it (lowercase, non-alphanumeric → `-`, collapse/trim hyphens) and list the folders under `src/prototypes/*/`:
   - If the derived slug **exactly matches** one of those folders, use it — skip the "Designer name" question in step 1 entirely. Keep the profile's `name` field as-typed (e.g. "Israel Gutierrez") for `designerName` in step 6 — don't kebab-case it for that field.
   - If it does **not** match any existing folder (typo, name changed, or a stale/unfinished profile), don't silently create a new folder. Ask once with `AskUserQuestion`: offer the existing designer folders as options (in case they meant one of those) plus the derived slug itself as an option (in case this really is a new designer or an intentional rename), then proceed with whichever they pick. This avoids fragmenting one designer's prototypes across two folders over a naming mismatch. If they pick an existing folder, ask what name to display for them (default to the profile's `name` if it seems close) rather than guessing.
   - If `.designer.local.json` is missing or its `name` is empty, ask as described in step 1.
   Either way, once you have a confirmed designer folder, write `.designer.local.json` as `{"name": "<real name, not kebab-cased>", "onboarded": true}` (create or overwrite it) so the browser app and future runs pick it up without asking again. This file is gitignored and local to this machine — never commit it.

1. **Collect the details one field at a time, in this order: designer name → prototype name → description → tags.** Don't dump all four into one message — give each its own turn, and pick the presentation that fits the field:
   - **Designer name** (skip this if step 0 already found one). List the folders under `src/prototypes/*/` first. If any exist, ask with the `AskUserQuestion` tool: offer the existing designer folder names as options (recommend whichever seems like a returning designer) so they reuse their folder, plus the built-in "Other" for a new name. If there are no prototypes yet, or `AskUserQuestion` isn't available in the current tool (e.g. Cursor), just ask directly: "What's your name? (e.g. Israel Gutierrez — used for both the folder name and how it's displayed)". Keep their answer in its natural form (e.g. "Israel Gutierrez") for `designerName` in step 6 — only the kebab-cased version (step 2) becomes the folder name.
   - **Prototype name.** Ask directly as free text, e.g. "What should this prototype be called? (a short description that becomes the folder name, e.g. `account-transfer`)". No meaningful fixed option set — don't force it into a picker.
   - **Description.** Ask directly as free text: "What does this prototype demonstrate? (1–2 sentences)" — this drives what gets generated in `index.ts`, so get it before tags.
   - **Tags.** Scan existing `meta.ts` files across `src/prototypes/` for tags already in use. Ask with `AskUserQuestion`, `multiSelect: true`, offering the most common existing tags as options (plus any that plausibly fit the description just given) and "Other" for anything new. If `AskUserQuestion` isn't available, ask for comma-separated tags directly.

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
  designerName: '[The designer's real name, as typed/on file — e.g. "Israel Gutierrez", not kebab-cased]',
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

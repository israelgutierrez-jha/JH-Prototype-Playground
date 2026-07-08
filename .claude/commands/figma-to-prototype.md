# /figma-to-prototype

Scaffold a new prototype in the JH Prototype Playground **from a Figma design** instead of a text description — rebuilding it using only real JH web components.

## Prerequisites

This command needs the `figma` MCP server (pre-configured in this repo's `.mcp.json` / `.cursor/mcp.json`). If Figma tools aren't available, tell the user to authorize it first — in Claude Code, run `/mcp` and choose "Authenticate"; in Cursor, open Settings → MCP and authorize the `figma` server. This is a one-time step per machine.

## Steps

1. **Ask for the Figma URL first, and only that.** A frame URL that includes a `node-id` (e.g. `https://figma.com/design/:fileKey/:fileName?node-id=1-2`). If the URL has no `node-id`, ask for a node-specific link — don't guess one. Don't ask for name/tags/description in this same message; wait for the URL before moving on.

2. Extract `fileKey` and `nodeId` from the URL.

3. Fetch the design:
   - `get_design_context(nodeId, fileKey, clientFrameworks: "lit,web-components", clientLanguages: "typescript")` — leave Code Connect enabled (don't set `disableCodeConnect`). Today this will likely come back unresolved for most nodes since the JH Figma library has no Code Connect mappings yet — that's expected, not an error. If the design system team adds mappings later, this same call starts returning real `jh-*` code automatically, no changes needed here.
   - `get_screenshot(nodeId, fileKey)` for a visual reference to check fidelity against later.
   - `get_metadata(nodeId, fileKey)` for the layer tree, and `get_variable_defs(nodeId, fileKey)` for the raw color/spacing/typography variable values used in the frame.

4. **Now collect the remaining details, one field at a time, in this order: designer name → prototype name → tags → description.** Don't dump all of these into one message — give each its own turn, and pick the presentation that fits the field:
   - **Designer name.** Check for an existing designer profile first, but verify it against real folders before trusting it: look for `.designer.local.json` at the repo root. If it exists and its `name` field is non-empty, kebab-case it (lowercase, non-alphanumeric → `-`, collapse/trim hyphens) and list the folders under `src/prototypes/*/`. If the derived slug exactly matches one of those folders, use it and skip asking. If it doesn't match any existing folder (typo, name changed, or a stale profile), ask once with `AskUserQuestion`: offer the existing designer folders as options plus the derived slug itself (in case it's really a new designer), then use whichever they pick — don't silently create a new folder on a mismatch. If the file is missing or empty, list the folders under `src/prototypes/*/` and ask with the `AskUserQuestion` tool: offer the existing designer folder names as options (recommend whichever seems like a returning designer) so they reuse their folder, plus the built-in "Other" for a new name. If there are no prototypes yet, or `AskUserQuestion` isn't available in the current tool (e.g. Cursor), just ask directly: "What's your name? (used as the folder name, e.g. `jack-henry`)" Either way, once confirmed, write `.designer.local.json` as `{"name": "<name matching the confirmed folder>", "onboarded": true}` (create or overwrite) so future runs and the browser app pick it up without asking again. This file is gitignored and local to this machine — never commit it.
   - **Prototype name.** Ask directly as free text, e.g. "What should this prototype be called? (e.g. `account-transfer-flow`)". This has no meaningful fixed option set — don't force it into a picker.
   - **Tags.** Scan existing `meta.ts` files across `src/prototypes/` for tags already in use. Ask with `AskUserQuestion`, `multiSelect: true`, offering the most common existing tags as options plus "Other" for anything new. If `AskUserQuestion` isn't available, ask for comma-separated tags directly.
   - **Description.** Ask directly as free text, 1–2 sentences on what the prototype demonstrates. Since the Figma frame and screenshot are already fetched by this point (step 3), draft a one-sentence description from what's visible and offer it to the user to confirm or edit, rather than starting from a blank prompt.

6. Map every distinct element in the layer tree to a real `jh-*` component:
   - Use the same matching `/use-jh-component` does — layer/component names, structure, and the screenshot as evidence, cross-referenced against the component reference in `CLAUDE.md` and `src/data/components/`.
   - `search_design_system` can help confirm what a given Figma component instance actually is if its layer name is ambiguous.
   - If an element's role is ambiguous, resolve it to the closest reasonable `jh-*` component — don't guess wildly.
   - **If there's truly no reasonable `jh-*` match** (e.g. a decorative illustration or one-off shape with no component equivalent), stop and ask the user for explicit approval before writing any non-JH markup. Never invent custom HTML/CSS silently — this is a hard rule from the root `CLAUDE.md`.

7. Resolve colors, spacing, and typography from `get_variable_defs` to `--jh-*` tokens:
   - Match by variable name first (e.g. a Figma variable named like a JH token), nearest value second, using the JH Design Tokens table in `CLAUDE.md`.
   - Keep the `var(--jh-token, literal-fallback)` pattern used throughout the codebase (see `src/prototypes/example/login-flow/index.ts`), with the fallback matching the raw value from Figma.

8. Scaffold the prototype exactly like `/new-prototype`:
   - Create `src/prototypes/[designer]/[prototype-name]/` (with the first-time-designer `CLAUDE.md`/`.cursor/rules` scaffolding if this is their first prototype).
   - `meta.ts` — same shape as `/new-prototype`.
   - `index.ts` — build the markup and styles from the resolved Figma structure instead of freeform generation. Distinct frames/variants in the selection (e.g. separate screens for a flow) become `@state()`-driven render branches, matching the multi-step pattern already used in `login-flow`.

9. Tell the user:
   - The path to their new prototype and the `npm run dev` URL (same as `/new-prototype`).
   - To compare the running prototype against the Figma screenshot from step 3, and iterate with `/use-jh-component` for any prop-level fixes.

## Important rules

- Same hard rules as `/new-prototype`: no `@customElement`, no Tailwind/Bootstrap/external CSS libraries, no raw `<button>`/`<input>`/`<select>`, always `--jh-*` tokens.
- Never write markup for an element that has no `jh-*` equivalent without the user's explicit go-ahead first.
- Don't wait on Figma Code Connect mappings to exist — this command works today via heuristic matching, and gets more accurate for free if/when the design system team adds Code Connect for the JH library.

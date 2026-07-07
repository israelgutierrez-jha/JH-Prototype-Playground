# /figma-to-prototype

Scaffold a new prototype in the JH Prototype Playground **from a Figma design** instead of a text description — rebuilding it using only real JH web components.

## Prerequisites

This command needs the `figma` MCP server (pre-configured in this repo's `.mcp.json` / `.cursor/mcp.json`). If Figma tools aren't available, tell the user to authorize it first — in Claude Code, run `/mcp` and choose "Authenticate"; in Cursor, open Settings → MCP and authorize the `figma` server. This is a one-time step per machine.

## Steps

1. Ask the user for:
   - A Figma frame URL that includes a `node-id` (e.g. `https://figma.com/design/:fileKey/:fileName?node-id=1-2`). If the URL has no `node-id`, ask for a node-specific link — don't guess one.
   - Their name, a prototype name, and tags — same as `/new-prototype`.

2. Extract `fileKey` and `nodeId` from the URL.

3. Fetch the design:
   - `get_design_context(nodeId, fileKey, clientFrameworks: "lit,web-components", clientLanguages: "typescript")` — leave Code Connect enabled (don't set `disableCodeConnect`). Today this will likely come back unresolved for most nodes since the JH Figma library has no Code Connect mappings yet — that's expected, not an error. If the design system team adds mappings later, this same call starts returning real `jh-*` code automatically, no changes needed here.
   - `get_screenshot(nodeId, fileKey)` for a visual reference to check fidelity against later.
   - `get_metadata(nodeId, fileKey)` for the layer tree, and `get_variable_defs(nodeId, fileKey)` for the raw color/spacing/typography variable values used in the frame.

4. Map every distinct element in the layer tree to a real `jh-*` component:
   - Use the same matching `/use-jh-component` does — layer/component names, structure, and the screenshot as evidence, cross-referenced against the component reference in `CLAUDE.md` and `src/data/components/`.
   - `search_design_system` can help confirm what a given Figma component instance actually is if its layer name is ambiguous.
   - If an element's role is ambiguous, resolve it to the closest reasonable `jh-*` component — don't guess wildly.
   - **If there's truly no reasonable `jh-*` match** (e.g. a decorative illustration or one-off shape with no component equivalent), stop and ask the user for explicit approval before writing any non-JH markup. Never invent custom HTML/CSS silently — this is a hard rule from the root `CLAUDE.md`.

5. Resolve colors, spacing, and typography from `get_variable_defs` to `--jh-*` tokens:
   - Match by variable name first (e.g. a Figma variable named like a JH token), nearest value second, using the JH Design Tokens table in `CLAUDE.md`.
   - Keep the `var(--jh-token, literal-fallback)` pattern used throughout the codebase (see `src/prototypes/example/login-flow/index.ts`), with the fallback matching the raw value from Figma.

6. Scaffold the prototype exactly like `/new-prototype`:
   - Create `src/prototypes/[designer]/[prototype-name]/` (with the first-time-designer `CLAUDE.md`/`.cursor/rules` scaffolding if this is their first prototype).
   - `meta.ts` — same shape as `/new-prototype`.
   - `index.ts` — build the markup and styles from the resolved Figma structure instead of freeform generation. Distinct frames/variants in the selection (e.g. separate screens for a flow) become `@state()`-driven render branches, matching the multi-step pattern already used in `login-flow`.

7. Tell the user:
   - The path to their new prototype and the `npm run dev` URL (same as `/new-prototype`).
   - To compare the running prototype against the Figma screenshot from step 3, and iterate with `/use-jh-component` for any prop-level fixes.

## Important rules

- Same hard rules as `/new-prototype`: no `@customElement`, no Tailwind/Bootstrap/external CSS libraries, no raw `<button>`/`<input>`/`<select>`, always `--jh-*` tokens.
- Never write markup for an element that has no `jh-*` equivalent without the user's explicit go-ahead first.
- Don't wait on Figma Code Connect mappings to exist — this command works today via heuristic matching, and gets more accurate for free if/when the design system team adds Code Connect for the JH library.

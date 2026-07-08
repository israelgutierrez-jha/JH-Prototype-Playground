# /document-component

Scaffold or update a structured component doc in `src/data/components/`. This is
the on-ramp for documenting the JH component library one component at a time.

**The API is auto-derived.** Props, events, and slots come from the package's
Custom Elements Manifest (`custom-elements.json`) via `_api/<tag>.generated.ts` — you
do **not** transcribe them. Your job is to capture the *intent* the manifest
can't: when to use the component, anti-patterns, worked examples, and gotchas.

## Inputs to gather

If the user hasn't already provided them, ask for:

1. **Component name** — the human label, e.g. `Accordion`. Derive:
   - tag: `jh-[kebab-name]` (e.g. `jh-accordion`)
   - file: `src/data/components/jh-[kebab-name].ts`
2. **What it's for** — a one-line summary and the intent fields below. The user
   can paste Storybook prose to draft from, but you only keep the *intent*, not
   the API table.

## Confirm the manifest has it

The tag must exist in `@jack-henry/jh-elements`'s manifest, or the API will be
empty. Quick check:

```bash
node -e "const m=require('./node_modules/@jack-henry/jh-elements/custom-elements.json'); console.log(m.tags.some(t=>t.name==='jh-accordion')?'found':'MISSING')"
```

If it's missing, confirm the tag/import path with the user before proceeding.

## What to produce

Create `src/data/components/jh-[name].ts` exporting `const doc: ComponentDoc`,
following `src/data/components/types.ts` and matching the worked example
`src/data/components/jh-button.ts`. Author **only the intent fields** — omit
`props`, `events`, and `slots` entirely (they're merged from the manifest):

- `tag`, `name` — from the component name.
- `import` — `@jack-henry/jh-elements/components/[name]/[name].js`. Confirm if non-standard.
- `summary` — one sentence; what the component is for.
- `category` — best fit from the `ComponentCategory` union in `types.ts`.
- `status` — `stable` unless the user says otherwise.
- `examples[]` — one entry per meaningful usage. Each needs `title`, `useCase`,
  and a `code` string (see escaping rule). Use real attributes — if unsure,
  check the manifest entry rather than guessing.
- `whenToUse[]` (required), `whenNotToUse[]`, `gotchas[]`, `related[]`.
- `source` — `storybookUrl`, `importedAt` (today, YYYY-MM-DD), `componentVersion`.
- `featuredProps?` — optional: attribute names to promote from the `advanced`
  tier into the main props table (e.g. an a11y prop that's actually central).

## Fields the manifest does NOT provide — ask the human

The manifest documents the API, not the *intent*. These are the whole point:

- **`whenToUse[]`** (required) — when a designer should reach for this component.
- **`whenNotToUse[]`** — anti-patterns, each pointing at the component to prefer.
- **`gotchas[]`** — quirks the API alone won't reveal (token names, slotted vs.
  attribute content, event payloads).
- the per-example **`useCase`** — when to reach for that specific variant.

If the user can't supply these, draft proposals from the description and ask
them to confirm — never leave `whenToUse` empty.

## Escaping rule for `code` strings

Snippets are template-literal strings. Inside them:

- write `\${...}` not `${...}`
- write `` \` `` for any backtick inside the snippet

Match the style in `src/data/components/jh-button.ts`.

## Finish

1. Run `npx tsc --noEmit` and fix any errors (most often string escaping).
2. Run `npm run docs` — this derives the API from the manifest into
   `_api/<tag>.generated.ts`, projects everything into `CLAUDE.md`, and syncs
   `.cursorrules`. The component also appears in the hosted browser
   automatically (auto-discovery).
3. Run `npm run audit-docs` to confirm the new tag is covered and its intent
   is complete.
4. Tell the user the file path and list any intent fields you drafted for them
   to review (especially `whenToUse` / `gotchas`).

## Rules

- Never hand-author `props`/`events`/`slots` — they are generated. If the API
  looks wrong, the fix is the manifest/package version, not the doc.
- `whenToUse` must always be filled — it is the reason this dataset exists.
- Keep code snippets copy-paste correct and use only real attributes.
- If a doc for that tag already exists, ask whether to update it rather than
  overwriting silently.

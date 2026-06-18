# /add-component

Scaffold a structured component doc in `src/data/components/` from information pasted out of Storybook. This is the easy on-ramp for collaborators importing the JH component library one component at a time.

## Inputs to gather

If the user hasn't already provided them, ask for:

1. **Component name** — the human label, e.g. `Accordion`. Derive:
   - tag: `jh-[kebab-name]` (e.g. `jh-accordion`)
   - file: `src/data/components/jh-[kebab-name].ts`
2. **Pasted Storybook content** — whatever they can copy, in any format:
   - the component description/summary
   - the props / args / argTypes table (name, type, default, description)
   - events
   - slots
   - code examples / stories
   - the Storybook URL and component version, if shown

Accept a messy paste — your job is to structure it.

## What to produce

Create `src/data/components/jh-[name].ts` exporting `const doc: ComponentDoc`, following the schema in `src/data/components/types.ts` and matching the formatting of the worked example `src/data/components/jh-button.ts` exactly.

Map the pasted content onto the schema:

- `tag`, `name` — from the component name.
- `import` — infer as `@jack-henry/jh-elements/components/[name]/[name].js`. Confirm with the user if the path looks non-standard.
- `summary` — one sentence; what the component is for.
- `category` — pick the best fit from the `ComponentCategory` union in `types.ts`.
- `status` — `stable` unless the user says otherwise.
- `props`, `events`, `slots` — transcribe **only** what's in the pasted source. Do not invent props.
- `examples[]` — one entry per meaningful story/snippet. Each needs a `title`, a `useCase`, and a `code` string (see escaping rule below).
- `source` — `storybookUrl`, `importedAt` (today's date, YYYY-MM-DD), `componentVersion` if known.

## Fields Storybook does NOT provide — ask the human

Storybook documents the API, not the *intent*. These fields are the whole point of the dataset, so do not skip them:

- **`whenToUse[]`** (required) — when a designer should reach for this component.
- **`whenNotToUse[]`** — anti-patterns, each pointing at the component to prefer instead.
- **`gotchas[]`** — quirks the API alone won't reveal (token names, slotted vs. attribute content, event payloads).
- the per-example **`useCase`** — when to reach for that specific variant.

If the user can't supply these, draft proposals from the Storybook description and ask them to confirm or correct — never leave `whenToUse` empty.

## Escaping rule for `code` strings

Snippets are stored as strings so the same source feeds both the AI docs and the live browser. Inside the template literal, escape Lit interpolation and nested backticks:

- write `\${...}` not `${...}`
- write `` \` `` for any backtick inside the snippet

Match the style already used in `src/data/components/jh-button.ts`.

## Finish

1. Run `npx tsc --noEmit` and fix any errors (most often string escaping).
2. Run `npm run docs` to project the new doc into `CLAUDE.md` and sync `.cursorrules`. (This is the AI side; the file also appears in the hosted browser automatically via the auto-discovery index — no registration needed.)
3. Tell the user the file path and list any fields you drafted that they should review (especially `whenToUse` / `gotchas`).

## Rules

- Never invent props, events, or slots that aren't in the pasted source.
- `whenToUse` must always be filled — it is the reason this dataset exists.
- Keep code snippets copy-paste correct.
- If a doc for that tag already exists, ask whether to update it rather than overwriting silently.

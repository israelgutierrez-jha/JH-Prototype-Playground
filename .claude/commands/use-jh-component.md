# /use-jh-component

Help the user find and use the right JH component for a UI pattern.

## What to do

The user will describe a UI element they need (e.g. "I need a text field with validation", "what component should I use for a table?", "how do I show an error message?").

1. Identify which `jh-` component(s) from `@jack-henry/jh-elements` best match the need.
2. Provide:
   - The import statement
   - A minimal working example in a Lit `render()` method
   - The key props to know about
   - Common gotchas (e.g. how to read the value, how to listen for changes)

## Available components

Refer to the component reference in `CLAUDE.md`. Components available:

**Forms:** jh-input, jh-input-email, jh-input-password, jh-input-search, jh-input-telephone, jh-input-textarea, jh-select, jh-checkbox, jh-checkbox-group, jh-radio, jh-radio-group, jh-switch

**Actions:** jh-button (primary/secondary/tertiary/danger appearances, pending state)

**Layout:** jh-card, jh-divider

**Feedback:** jh-notification (type: alert/banner; appearance: positive/neutral/negative; message is slotted), jh-progress, jh-badge (count/dot only — use jh-tag for text labels), jh-toast, jh-tooltip

**Lists:** jh-list-group + jh-list-item, jh-menu

**Tags:** jh-tag, jh-tag-group

**Tables:** jh-table, jh-table-row, jh-table-header-cell, jh-table-data-cell

## If no JH component exists for the need

Say so clearly, then suggest the closest JH component and how to extend it with custom CSS using `--jh-*` tokens. Never suggest using a third-party component library.

## Event handling notes

JH components dispatch custom events with `jh-` prefix:
- `@jh-input` — fires as user types
- `@jh-change` — fires on blur/selection
- `@jh-select` — fires on item selection (lists, menus)

Read values via `(e.target as HTMLInputElement).value` inside the handler.

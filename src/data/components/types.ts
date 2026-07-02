/**
 * Structured documentation schema for a single JH component.
 *
 * This is the source of truth for one component. It is intentionally a
 * superset of two audiences:
 *
 *  1. AI context — projected into `CLAUDE.md` / `.cursorrules` so any cloner's
 *     assistant shares the same understanding of *intent*, not just API shape.
 *  2. Humans — rendered into the hosted component browser so designers
 *     unfamiliar with the system can learn *when* to reach for a component.
 *
 * Both projections read the same fields, so they can never drift apart.
 */

export type ComponentCategory =
  | 'actions'
  | 'forms'
  | 'layout'
  | 'feedback'
  | 'lists'
  | 'navigation'
  | 'tags'
  | 'data'
  | 'icons'

export type ComponentStatus = 'stable' | 'beta' | 'deprecated'

export interface ComponentProp {
  /** Attribute/property name as authored in markup, e.g. `appearance`. */
  name: string
  /** Type as a readable string, e.g. `'primary' | 'secondary'` or `boolean`. */
  type: string
  /** Default value, if any. Omit for required props with no default. */
  default?: string
  required?: boolean
  description: string
  /**
   * Curation tier (set by the API generator, not by hand):
   *  - `common` — the design-facing props most prototypes need.
   *  - `advanced` — a11y, native passthrough, and low-level props; hidden by
   *    default in the browser and demoted in the AI docs to reduce noise.
   */
  tier?: 'common' | 'advanced'
}

export interface ComponentEvent {
  /** Event name including the `jh-` prefix, e.g. `jh-input`. */
  name: string
  description: string
  /** How to read the meaningful value inside a handler, if applicable. */
  payload?: string
}

export interface ComponentSlot {
  /** Slot name; use an empty string for the default slot. */
  name: string
  description: string
}

export interface ComponentExample {
  title: string
  /** The heuristic payload: when a designer should reach for *this* usage. */
  useCase: string
  /**
   * A Lit `html`-template snippet. Rendered live in the browser and embedded
   * verbatim into the AI docs, so it must be copy-paste correct.
   */
  code: string
}

export interface ComponentDoc {
  /** Custom element tag, e.g. `jh-button`. Unique id across the dataset. */
  tag: string
  /** Human-friendly label, e.g. `Button`. */
  name: string
  /** Bare import specifier for the component. */
  import: string
  /** One-line summary used in indexes, cards, and the compact AI index. */
  summary: string
  category: ComponentCategory
  status?: ComponentStatus
  /** Intent heuristics — the core "use this when…" guidance for both audiences. */
  whenToUse: string[]
  /** Anti-patterns and the component to prefer instead. */
  whenNotToUse?: string[]
  /**
   * Attribute names to force into the `common` tier even if the curation
   * heuristic would otherwise demote them. Hand-authored; everything about the
   * API itself (the props/events/slots below) is generated from the manifest.
   */
  featuredProps?: string[]
  /**
   * API surface. Hand-authored intent files OMIT these — they are derived from
   * the package's Custom Elements Manifest and merged in at load/build time
   * (see `_api.generated.ts`). They remain here so consumers see one shape.
   */
  props?: ComponentProp[]
  events?: ComponentEvent[]
  slots?: ComponentSlot[]
  /** At least one worked example; each carries its own use-case note. */
  examples: ComponentExample[]
  /** Quirks the API surface alone won't reveal (token names, slot behavior…). */
  gotchas?: string[]
  /** Related/alternative component tags, e.g. `['jh-tag']` for a badge. */
  related?: string[]
  /** Provenance for the Storybook import pipeline and staleness checks. */
  source?: {
    storybookUrl?: string
    /** YYYY-MM-DD the doc was imported/last reconciled with Storybook. */
    importedAt?: string
    /** Version of `@jack-henry/jh-elements` the doc was verified against. */
    componentVersion?: string
  }
}

/**
 * The generated API surface for one component, derived from the Custom Elements
 * Manifest. Keyed by tag in `_api.generated.ts` and merged onto the matching
 * hand-authored intent doc.
 */
export interface ComponentApi {
  props: ComponentProp[]
  events: ComponentEvent[]
  slots: ComponentSlot[]
}

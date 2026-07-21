import { privilegeLevelLabel } from './store.js'

// jh-select only shows a value's label on first paint when the matching option
// is flagged `selected` — it does not re-derive the label from a later external
// `.value=` change. Building the list per current value (and re-keying the
// element at the call site) keeps the visible label in sync whenever the
// underlying value changes.
export function withSelected(options: { value: string; label: string }[], current: string) {
  return options.map(opt => ({ ...opt, selected: opt.value === current }))
}

export const PRIORITY_OPTIONS = [
  { value: '', label: 'Unset' },
  { value: 'Critical', label: 'Critical' },
  { value: 'High', label: 'High' },
  { value: 'Default', label: 'Default' },
]

export const TYPE_OPTIONS = [
  { value: '', label: 'Unset' },
  { value: 'Alert', label: 'Alert' },
  { value: 'Note', label: 'Note' },
  { value: 'Insight', label: 'Insight' },
]

export const VISIBILITY_OPTIONS = [
  { value: '', label: 'Unset' },
  { value: 'Global', label: 'Global' },
  { value: 'Account', label: 'Account' },
  { value: 'Product', label: 'Product' },
]

export const RESTRICTION_OPTIONS = [
  { value: '', label: 'Unset' },
  { value: 'Block', label: 'Block' },
  { value: 'Waive', label: 'Waive' },
  { value: 'Route', label: 'Route' },
  { value: 'Audit', label: 'Audit' },
]

export const DISPLAY_MODE_OPTIONS = [
  { value: '', label: 'Unset' },
  { value: 'Interrupt', label: 'Interrupt' },
  { value: 'Persistent', label: 'Persistent' },
  { value: 'Collapsed', label: 'Collapsed' },
]

export const EXPIRATION_MODE_OPTIONS = [
  { value: 'Indefinite', label: 'Indefinite' },
  { value: 'FixedDate', label: 'Fixed date' },
  { value: 'AutoManaged', label: 'Auto-managed by a system process' },
  { value: 'Regulatory', label: 'Regulatory (fixed renewal rules)' },
]

export const PRIVILEGE_LEVEL_OPTIONS = Array.from({ length: 10 }, (_, n) => ({
  value: String(n),
  label: `${n} — ${privilegeLevelLabel(n)}`,
}))

export const STATUS_BADGE_MAP: [string, string][] = [
  ['Needs conversion', 'primary'],
  ['Converted', 'positive'],
  ['New', 'secondary'],
]

export const RESTRICTION_BADGE_MAP: [string, string][] = [
  ['Block', 'negative'],
  ['Waive', 'positive'],
  ['Route', 'primary'],
  ['Audit', 'secondary'],
]

import raw from './features.json'

export type FeatureColumnId = 'requested' | 'planned' | 'in-progress' | 'shipped'

export interface FeatureCard {
  id: string
  title: string
  description: string
  /** Who suggested this feedback/request. */
  submittedBy: string
  /** Who's picking this up — set later via Edit, empty string when unassigned. */
  assignedTo: string
  votes: number
  tags: string[]
  column: FeatureColumnId
}

export interface FeatureColumn {
  id: FeatureColumnId
  label: string
}

export const FEATURE_COLUMNS: FeatureColumn[] = [
  { id: 'requested', label: 'Requested' },
  { id: 'planned', label: 'Planned' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'shipped', label: 'Shipped' },
]

/**
 * Feature requests / feedback cards. Added/removed/moved via the Features
 * page, which writes back to `features.json` through the dev-only
 * `/__proto-api/features` endpoint — committed like any other source file so
 * the whole team sees the same board.
 */
export const FEATURE_CARDS: FeatureCard[] = raw as FeatureCard[]

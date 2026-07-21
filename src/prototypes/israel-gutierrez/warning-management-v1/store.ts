export type WarningPriority = 'Critical' | 'High' | 'Default' | ''
export type MetadataType = 'Alert' | 'Note' | 'Insight' | ''
export type Visibility = 'Global' | 'Account' | 'Product' | ''
export type RestrictionType = 'Block' | 'Waive' | 'Route' | 'Audit' | ''
export type DisplayMode = 'Interrupt' | 'Persistent' | 'Collapsed' | ''
export type ExpirationMode = 'Indefinite' | 'FixedDate' | 'AutoManaged' | 'Regulatory'
export type LegacyRecordType = 'Account' | 'Share' | 'Loan' | 'Card' | 'External Loan' | ''
export type ConversionStatus = 'Needs conversion' | 'Converted' | 'New'

export interface WarningPrivileges {
  iq: number
  fm: number
  tr: number
}

export interface WarningExpiration {
  mode: ExpirationMode
  date?: string
  note?: string
}

export interface WarningMgmtRow {
  id: string
  codeNum?: number
  legacyDescription?: string
  priority: WarningPriority
  priorityRank: number
  metadataType: MetadataType
  visibility: Visibility
  restrictionType: RestrictionType
  displayMode: DisplayMode
  actionLabel: string
  displayAlias: string
  description: string
  usageCount: number
  privileges: WarningPrivileges
  legacyDisplayFlags?: { acctMgr: boolean; tlrTrn: boolean }
  legacyRecordType: LegacyRecordType
  expiration: WarningExpiration
  isNative: boolean
  conversionStatus: ConversionStatus
}

const PRIORITY_RANK: Record<WarningPriority, number> = {
  Critical: 3,
  High: 2,
  Default: 1,
  '': 0,
}

export function privilegeLevelLabel(n: number): string {
  return n === 0 ? 'No privilege required' : `Warning Level ${n}`
}

export function computeConversionStatus(
  row: Pick<WarningMgmtRow, 'isNative' | 'priority' | 'metadataType' | 'restrictionType' | 'displayMode'>
): ConversionStatus {
  if (row.isNative) return 'New'
  if (row.priority && row.metadataType && row.restrictionType && row.displayMode) return 'Converted'
  return 'Needs conversion'
}

export function deriveActionLabel(
  metadataType: MetadataType,
  priority: WarningPriority,
  restrictionType: RestrictionType
): string {
  if (!metadataType || !restrictionType) return '—'
  if (restrictionType === 'Block') {
    if (priority === 'Critical') return 'Escalate to compliance & block transaction'
    if (priority === 'High') return 'Notify & block pending review'
    return 'Block with note'
  }
  if (restrictionType === 'Waive') return 'Waive requirement, log only'
  if (restrictionType === 'Route') return 'Route to review queue'
  if (restrictionType === 'Audit') {
    if (metadataType === 'Insight') return 'Surface in analytics feed'
    return 'Log to account history'
  }
  return '—'
}

const INITIAL_ROWS: WarningMgmtRow[] = [
  {
    id: 'wm-001',
    codeNum: 105,
    legacyDescription: 'ACCT CLOSED - DO NOT PAY',
    priority: 'Critical',
    priorityRank: PRIORITY_RANK.Critical,
    metadataType: 'Alert',
    visibility: 'Global',
    restrictionType: 'Block',
    displayMode: 'Interrupt',
    actionLabel: deriveActionLabel('Alert', 'Critical', 'Block'),
    displayAlias: 'Account Closed',
    description:
      'Displays when a teller or officer accesses an account that has been closed. Prevents further transactions from being processed against this account.',
    usageCount: 1284,
    privileges: { iq: 2, fm: 0, tr: 2 },
    legacyDisplayFlags: { acctMgr: true, tlrTrn: true },
    legacyRecordType: 'Account',
    expiration: { mode: 'Indefinite' },
    isNative: false,
    conversionStatus: 'Converted',
  },
  {
    id: 'wm-002',
    codeNum: 110,
    legacyDescription: 'STOP PAYMT ON FILE',
    priority: 'High',
    priorityRank: PRIORITY_RANK.High,
    metadataType: 'Alert',
    visibility: 'Account',
    restrictionType: 'Block',
    displayMode: 'Interrupt',
    actionLabel: deriveActionLabel('Alert', 'High', 'Block'),
    displayAlias: 'Stop Payment Active',
    description: 'A stop payment order is active on one or more items associated with this account.',
    usageCount: 842,
    privileges: { iq: 2, fm: 1, tr: 1 },
    legacyDisplayFlags: { acctMgr: true, tlrTrn: true },
    legacyRecordType: 'Account',
    expiration: { mode: 'Indefinite' },
    isNative: false,
    conversionStatus: 'Converted',
  },
  {
    id: 'wm-003',
    codeNum: 118,
    legacyDescription: 'COURTESY PAY ENROLLED',
    priority: 'Default',
    priorityRank: PRIORITY_RANK.Default,
    metadataType: 'Note',
    visibility: 'Account',
    restrictionType: 'Audit',
    displayMode: 'Collapsed',
    actionLabel: deriveActionLabel('Note', 'Default', 'Audit'),
    displayAlias: 'Courtesy Pay Enrolled',
    description: 'Member is enrolled in the courtesy pay overdraft program.',
    usageCount: 3021,
    privileges: { iq: 1, fm: 0, tr: 0 },
    legacyDisplayFlags: { acctMgr: true, tlrTrn: false },
    legacyRecordType: 'Account',
    expiration: { mode: 'Indefinite' },
    isNative: false,
    conversionStatus: 'Converted',
  },
  {
    id: 'wm-004',
    codeNum: 122,
    legacyDescription: 'DORMANT ACCOUNT FLAG',
    priority: 'High',
    priorityRank: PRIORITY_RANK.High,
    metadataType: 'Alert',
    visibility: 'Global',
    restrictionType: 'Route',
    displayMode: 'Persistent',
    actionLabel: deriveActionLabel('Alert', 'High', 'Route'),
    displayAlias: 'Dormant Account',
    description: 'Account has had no member-initiated activity within the dormancy window defined by policy.',
    usageCount: 456,
    privileges: { iq: 2, fm: 2, tr: 2 },
    legacyDisplayFlags: { acctMgr: true, tlrTrn: true },
    legacyRecordType: 'Account',
    expiration: { mode: 'AutoManaged', note: 'Cleared automatically once member-initiated activity resumes.' },
    isNative: false,
    conversionStatus: 'Converted',
  },
  {
    id: 'wm-005',
    codeNum: 130,
    legacyDescription: 'MINOR ACCOUNT - REVIEW REQ',
    priority: 'Default',
    priorityRank: PRIORITY_RANK.Default,
    metadataType: 'Insight',
    visibility: 'Product',
    restrictionType: 'Audit',
    displayMode: 'Collapsed',
    actionLabel: deriveActionLabel('Insight', 'Default', 'Audit'),
    displayAlias: 'Minor Account Review',
    description: 'Account owner is a minor; flagged for periodic review ahead of the age-of-majority conversion.',
    usageCount: 198,
    privileges: { iq: 1, fm: 0, tr: 0 },
    legacyDisplayFlags: { acctMgr: true, tlrTrn: false },
    legacyRecordType: 'Account',
    expiration: { mode: 'AutoManaged', note: 'Cleared automatically at the age-of-majority conversion.' },
    isNative: false,
    conversionStatus: 'Converted',
  },
  {
    id: 'wm-006',
    codeNum: 145,
    legacyDescription: 'REG D LIMIT EXCEEDED',
    priority: '',
    priorityRank: PRIORITY_RANK[''],
    metadataType: '',
    visibility: '',
    restrictionType: '',
    displayMode: '',
    actionLabel: '—',
    displayAlias: '',
    description: '',
    usageCount: 2765,
    privileges: { iq: 2, fm: 1, tr: 0 },
    legacyDisplayFlags: { acctMgr: true, tlrTrn: false },
    legacyRecordType: 'Account',
    expiration: { mode: 'Indefinite' },
    isNative: false,
    conversionStatus: 'Needs conversion',
  },
  {
    id: 'wm-007',
    codeNum: 151,
    legacyDescription: 'IRS LEVY ON ACCOUNT',
    priority: '',
    priorityRank: PRIORITY_RANK[''],
    metadataType: '',
    visibility: '',
    restrictionType: '',
    displayMode: '',
    actionLabel: '—',
    displayAlias: '',
    description: '',
    usageCount: 34,
    privileges: { iq: 3, fm: 0, tr: 3 },
    legacyDisplayFlags: { acctMgr: false, tlrTrn: true },
    legacyRecordType: 'Account',
    expiration: { mode: 'Indefinite' },
    isNative: false,
    conversionStatus: 'Needs conversion',
  },
  {
    id: 'wm-008',
    codeNum: 160,
    legacyDescription: 'JOINT OWNER ADDED',
    priority: 'Default',
    priorityRank: PRIORITY_RANK.Default,
    metadataType: 'Note',
    visibility: 'Account',
    restrictionType: 'Audit',
    displayMode: 'Collapsed',
    actionLabel: deriveActionLabel('Note', 'Default', 'Audit'),
    displayAlias: 'Joint Owner Change',
    description: 'A joint owner was added to this account and the change has not yet been acknowledged.',
    usageCount: 612,
    privileges: { iq: 1, fm: 1, tr: 0 },
    legacyDisplayFlags: { acctMgr: true, tlrTrn: false },
    legacyRecordType: 'Account',
    expiration: { mode: 'FixedDate', date: '2026-08-15' },
    isNative: false,
    conversionStatus: 'Converted',
  },
  {
    id: 'wm-009',
    codeNum: 172,
    legacyDescription: 'OVERDRAFT LIMIT WARNING',
    priority: 'Critical',
    priorityRank: PRIORITY_RANK.Critical,
    metadataType: 'Alert',
    visibility: 'Global',
    restrictionType: 'Block',
    displayMode: 'Interrupt',
    actionLabel: deriveActionLabel('Alert', 'Critical', 'Block'),
    displayAlias: 'Overdraft Limit',
    description: 'Account balance is approaching or has exceeded the configured overdraft limit.',
    usageCount: 1902,
    privileges: { iq: 2, fm: 0, tr: 2 },
    legacyDisplayFlags: { acctMgr: true, tlrTrn: true },
    legacyRecordType: 'Account',
    expiration: { mode: 'Indefinite' },
    isNative: false,
    conversionStatus: 'Converted',
  },
  {
    id: 'wm-010',
    codeNum: 188,
    legacyDescription: 'POWER OF ATTORNEY ON FILE',
    priority: '',
    priorityRank: PRIORITY_RANK[''],
    metadataType: '',
    visibility: '',
    restrictionType: '',
    displayMode: '',
    actionLabel: '—',
    displayAlias: '',
    description: '',
    usageCount: 89,
    privileges: { iq: 2, fm: 1, tr: 1 },
    legacyDisplayFlags: { acctMgr: true, tlrTrn: false },
    legacyRecordType: 'Account',
    expiration: { mode: 'Indefinite' },
    isNative: false,
    conversionStatus: 'Needs conversion',
  },
  {
    id: 'wm-native-1',
    priority: 'Critical',
    priorityRank: PRIORITY_RANK.Critical,
    metadataType: 'Alert',
    visibility: 'Global',
    restrictionType: 'Block',
    displayMode: 'Interrupt',
    actionLabel: deriveActionLabel('Alert', 'Critical', 'Block'),
    displayAlias: 'Suspected Synthetic Identity',
    description:
      'Admin-flagged suspicion of synthetic identity fraud, based on cross-account pattern review. Created directly on the new platform.',
    usageCount: 0,
    privileges: { iq: 3, fm: 2, tr: 3 },
    legacyRecordType: '',
    expiration: { mode: 'Indefinite' },
    isNative: true,
    conversionStatus: 'New',
  },
  {
    id: 'wm-native-2',
    priority: 'Default',
    priorityRank: PRIORITY_RANK.Default,
    metadataType: 'Note',
    visibility: 'Account',
    restrictionType: 'Audit',
    displayMode: 'Collapsed',
    actionLabel: deriveActionLabel('Note', 'Default', 'Audit'),
    displayAlias: 'Digital Engagement Milestone',
    description:
      'Member has reached a notable digital engagement milestone worth surfacing to relationship staff. Created directly on the new platform.',
    usageCount: 0,
    privileges: { iq: 0, fm: 0, tr: 0 },
    legacyRecordType: '',
    expiration: { mode: 'Indefinite' },
    isNative: true,
    conversionStatus: 'New',
  },
]

class WarningStore {
  private _rows = new Map<string, WarningMgmtRow>(INITIAL_ROWS.map(row => [row.id, row]))
  private _nativeSeq = 3

  list(): WarningMgmtRow[] {
    return Array.from(this._rows.values())
  }

  get(id: string): WarningMgmtRow | undefined {
    return this._rows.get(id)
  }

  update(id: string, patch: Partial<WarningMgmtRow>) {
    const row = this._rows.get(id)
    if (!row) return
    const next: WarningMgmtRow = { ...row, ...patch }
    if (patch.priority !== undefined) next.priorityRank = PRIORITY_RANK[patch.priority]
    next.conversionStatus = computeConversionStatus(next)
    this._rows.set(id, next)
  }

  bulkUpdate(ids: string[], patch: Partial<WarningMgmtRow>) {
    ids.forEach(id => this.update(id, patch))
  }

  createNative(patch: Partial<WarningMgmtRow>): WarningMgmtRow {
    const id = `wm-native-${this._nativeSeq++}`
    const base: WarningMgmtRow = {
      id,
      priority: '',
      priorityRank: PRIORITY_RANK[''],
      metadataType: '',
      visibility: '',
      restrictionType: '',
      displayMode: '',
      actionLabel: '—',
      displayAlias: '',
      description: '',
      usageCount: 0,
      privileges: { iq: 0, fm: 0, tr: 0 },
      legacyRecordType: '',
      expiration: { mode: 'Indefinite' },
      isNative: true,
      conversionStatus: 'New',
    }
    const merged: WarningMgmtRow = { ...base, ...patch, id, isNative: true, codeNum: undefined, legacyDescription: undefined, legacyDisplayFlags: undefined }
    merged.priorityRank = PRIORITY_RANK[merged.priority]
    merged.conversionStatus = computeConversionStatus(merged)
    this._rows.set(id, merged)
    return merged
  }
}

export const warningStore = new WarningStore()

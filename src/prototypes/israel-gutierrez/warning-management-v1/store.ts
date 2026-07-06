export type WarningPriority = 'Critical' | 'High' | 'Default' | ''
export type MetadataType = 'Alert' | 'Note' | 'Insight' | ''
export type Visibility = 'Global' | 'Account' | 'Product' | ''

export interface WarningMgmtRow {
  id: string
  codeNum: number
  legacyDescription: string
  priority: WarningPriority
  priorityRank: number
  metadataType: MetadataType
  visibility: Visibility
  actionLabel: string
  displayAlias: string
  description: string
  usageCount: number
  privilegesSummary: string
}

const PRIORITY_RANK: Record<WarningPriority, number> = {
  Critical: 3,
  High: 2,
  Default: 1,
  '': 0,
}

export function deriveActionLabel(metadataType: MetadataType, priority: WarningPriority): string {
  if (!metadataType) return '—'
  if (metadataType === 'Alert') {
    if (priority === 'Critical') return 'Escalate to compliance'
    if (priority === 'High') return 'Notify account holder'
    return 'Flag for review'
  }
  if (metadataType === 'Note') return 'Log to account history'
  if (metadataType === 'Insight') return 'Surface in analytics feed'
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
    actionLabel: 'Escalate to compliance',
    displayAlias: 'Account Closed',
    description:
      'Displays when a teller or officer accesses an account that has been closed. Prevents further transactions from being processed against this account.',
    usageCount: 1284,
    privilegesSummary: 'IQ:2 | FM:0 | TR:2',
  },
  {
    id: 'wm-002',
    codeNum: 110,
    legacyDescription: 'STOP PAYMT ON FILE',
    priority: 'High',
    priorityRank: PRIORITY_RANK.High,
    metadataType: 'Alert',
    visibility: 'Account',
    actionLabel: 'Notify account holder',
    displayAlias: 'Stop Payment Active',
    description: 'A stop payment order is active on one or more items associated with this account.',
    usageCount: 842,
    privilegesSummary: 'IQ:2 | FM:1 | TR:1',
  },
  {
    id: 'wm-003',
    codeNum: 118,
    legacyDescription: 'COURTESY PAY ENROLLED',
    priority: 'Default',
    priorityRank: PRIORITY_RANK.Default,
    metadataType: 'Note',
    visibility: 'Account',
    actionLabel: 'Log to account history',
    displayAlias: 'Courtesy Pay Enrolled',
    description: 'Member is enrolled in the courtesy pay overdraft program.',
    usageCount: 3021,
    privilegesSummary: 'IQ:1 | FM:0 | TR:0',
  },
  {
    id: 'wm-004',
    codeNum: 122,
    legacyDescription: 'DORMANT ACCOUNT FLAG',
    priority: 'High',
    priorityRank: PRIORITY_RANK.High,
    metadataType: 'Alert',
    visibility: 'Global',
    actionLabel: 'Notify account holder',
    displayAlias: 'Dormant Account',
    description: 'Account has had no member-initiated activity within the dormancy window defined by policy.',
    usageCount: 456,
    privilegesSummary: 'IQ:2 | FM:2 | TR:2',
  },
  {
    id: 'wm-005',
    codeNum: 130,
    legacyDescription: 'MINOR ACCOUNT - REVIEW REQ',
    priority: 'Default',
    priorityRank: PRIORITY_RANK.Default,
    metadataType: 'Insight',
    visibility: 'Product',
    actionLabel: 'Surface in analytics feed',
    displayAlias: 'Minor Account Review',
    description: 'Account owner is a minor; flagged for periodic review ahead of the age-of-majority conversion.',
    usageCount: 198,
    privilegesSummary: 'IQ:1 | FM:0 | TR:0',
  },
  {
    id: 'wm-006',
    codeNum: 145,
    legacyDescription: 'REG D LIMIT EXCEEDED',
    priority: '',
    priorityRank: PRIORITY_RANK[''],
    metadataType: '',
    visibility: '',
    actionLabel: '—',
    displayAlias: '',
    description: '',
    usageCount: 2765,
    privilegesSummary: 'IQ:2 | FM:1 | TR:0',
  },
  {
    id: 'wm-007',
    codeNum: 151,
    legacyDescription: 'IRS LEVY ON ACCOUNT',
    priority: '',
    priorityRank: PRIORITY_RANK[''],
    metadataType: '',
    visibility: '',
    actionLabel: '—',
    displayAlias: '',
    description: '',
    usageCount: 34,
    privilegesSummary: 'IQ:3 | FM:0 | TR:3',
  },
  {
    id: 'wm-008',
    codeNum: 160,
    legacyDescription: 'JOINT OWNER ADDED',
    priority: 'Default',
    priorityRank: PRIORITY_RANK.Default,
    metadataType: 'Note',
    visibility: 'Account',
    actionLabel: 'Log to account history',
    displayAlias: 'Joint Owner Change',
    description: 'A joint owner was added to this account and the change has not yet been acknowledged.',
    usageCount: 612,
    privilegesSummary: 'IQ:1 | FM:1 | TR:0',
  },
  {
    id: 'wm-009',
    codeNum: 172,
    legacyDescription: 'OVERDRAFT LIMIT WARNING',
    priority: 'Critical',
    priorityRank: PRIORITY_RANK.Critical,
    metadataType: 'Alert',
    visibility: 'Global',
    actionLabel: 'Escalate to compliance',
    displayAlias: 'Overdraft Limit',
    description: 'Account balance is approaching or has exceeded the configured overdraft limit.',
    usageCount: 1902,
    privilegesSummary: 'IQ:2 | FM:0 | TR:2',
  },
  {
    id: 'wm-010',
    codeNum: 188,
    legacyDescription: 'POWER OF ATTORNEY ON FILE',
    priority: '',
    priorityRank: PRIORITY_RANK[''],
    metadataType: '',
    visibility: '',
    actionLabel: '—',
    displayAlias: '',
    description: '',
    usageCount: 89,
    privilegesSummary: 'IQ:2 | FM:1 | TR:1',
  },
]

class WarningStore {
  private _rows = new Map<string, WarningMgmtRow>(INITIAL_ROWS.map(row => [row.id, row]))

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
    this._rows.set(id, next)
  }

  bulkUpdate(ids: string[], patch: Partial<WarningMgmtRow>) {
    ids.forEach(id => this.update(id, patch))
  }
}

export const warningStore = new WarningStore()

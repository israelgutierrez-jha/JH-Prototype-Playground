import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { keyed } from 'lit/directives/keyed.js'
import '@jack-henry/jh-elements/components/button/button.js'
import '@jack-henry/jh-elements/components/select/select.js'
import '@jack-henry/jh-elements/components/notification/notification.js'
import '@banno/jha-wc/src/tables/advanced/jha-advanced-table/jha-advanced-table.js'
import { warningStore, type WarningMgmtRow, type WarningPriority, type MetadataType } from './store.js'
import { goToDetail } from './routing.js'

const COLUMNS = [
  { id: 'codeNum', label: 'Code #', sortBy: true, alignRight: true, dataType: 'number' },
  { id: 'legacyDescription', label: 'Legacy Description', sortBy: true, searchable: true },
  {
    id: 'priority',
    label: 'Priority',
    sortBy: true,
    dataType: 'badge',
    filterType: 'list',
    options: ['Critical', 'High', 'Default'],
    badgeMap: [
      ['Critical', 'negative'],
      ['High', 'primary'],
      ['Default', 'secondary'],
    ],
  },
  { id: 'metadataType', label: 'Type', sortBy: true, filterType: 'list', options: ['Alert', 'Note', 'Insight'] },
  { id: 'visibility', label: 'Visibility', filterType: 'list', options: ['Global', 'Account', 'Product'] },
  { id: 'displayAlias', label: 'Display Alias', searchable: true },
  { id: 'actionLabel', label: 'Action', searchable: true },
  { id: 'usageCount', label: 'Usage', sortBy: true, alignRight: true, dataType: 'number' },
  { id: 'privilegesSummary', label: 'Privileges', searchable: true },
] as const

const ROW_ACTIONS = [{ id: 'edit', label: 'Edit', icon: 'edit' }]

const PRIORITY_OPTIONS = [
  { value: 'Critical', label: 'Critical' },
  { value: 'High', label: 'High' },
  { value: 'Default', label: 'Default' },
]

const TYPE_OPTIONS = [
  { value: 'Alert', label: 'Alert' },
  { value: 'Note', label: 'Note' },
  { value: 'Insight', label: 'Insight' },
]

@customElement('wm-queue-view')
export class WarningManagementQueueView extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: var(--jh-dimension-600, 3rem);
    }

    .header {
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-100, 0.5rem);
      margin-bottom: var(--jh-dimension-500, 2rem);
    }

    h1 {
      font-size: var(--jh-font-size-600, 1.5rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled);
      margin: 0;
    }

    p.subtitle {
      font-size: var(--jh-font-size-400, 1rem);
      color: var(--jh-color-content-secondary-enabled);
      margin: 0;
      max-width: 60ch;
      line-height: 1.5;
    }

    .confirm {
      display: block;
      margin-bottom: var(--jh-dimension-400, 1rem);
    }

    .bulk-tools {
      display: flex;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: var(--jh-dimension-300, 0.75rem);
      padding: var(--jh-dimension-100, 0.5rem) 0;
    }

    .bulk-tools jh-select {
      width: 180px;
    }
  `

  @state() private _rows: WarningMgmtRow[] = warningStore.list()
  @state() private _selected: string[] = []
  @state() private _bulkPriority: WarningPriority = ''
  @state() private _bulkType: MetadataType = ''
  @state() private _confirm = ''
  // jh-select only shows a label on first paint (from an options[].selected flag);
  // it won't clear a stale label just because `.value` is reset externally, so
  // bump this to force fresh select instances after every bulk apply.
  @state() private _bulkResetKey = 0

  private _refresh() {
    this._rows = warningStore.list()
  }

  private _onBulkSelect(e: CustomEvent<{ items: string[] }>) {
    this._selected = e.detail.items
  }

  private _onCellClick(e: CustomEvent<{ item: WarningMgmtRow }>) {
    goToDetail(e.detail.item.id)
  }

  private _onRowAction(e: CustomEvent<{ item: WarningMgmtRow; action: { id: string } }>) {
    if (e.detail.action.id === 'edit') goToDetail(e.detail.item.id)
  }

  private _applyBulkPriority() {
    if (!this._bulkPriority || !this._selected.length) return
    const count = this._selected.length
    warningStore.bulkUpdate(this._selected, { priority: this._bulkPriority })
    this._confirm = `Priority set to "${this._bulkPriority}" for ${count} warning${count === 1 ? '' : 's'}.`
    this._selected = []
    this._bulkPriority = ''
    this._bulkResetKey++
    this._refresh()
  }

  private _applyBulkType() {
    if (!this._bulkType || !this._selected.length) return
    const count = this._selected.length
    warningStore.bulkUpdate(this._selected, { metadataType: this._bulkType })
    this._confirm = `Type set to "${this._bulkType}" for ${count} warning${count === 1 ? '' : 's'}.`
    this._selected = []
    this._bulkType = ''
    this._bulkResetKey++
    this._refresh()
  }

  render() {
    return html`
      <div class="header">
        <h1>Warning Management</h1>
        <p class="subtitle">
          Triage legacy Symitar warning codes and map them to the new alert, note, and insight metadata model.
          Select rows to apply a priority or type in bulk.
        </p>
      </div>

      ${this._confirm
        ? html`<jh-notification class="confirm" type="alert" appearance="positive">${this._confirm}</jh-notification>`
        : ''}

      <jha-advanced-table
        .columns=${COLUMNS}
        .data=${this._rows}
        .rowActions=${ROW_ACTIONS}
        .selectedItems=${this._selected}
        .selectedItemIdentifier=${'id'}
        .bulkActions=${true}
        .canEditColumns=${true}
        .noPagination=${true}
        .dataPlural=${'warnings'}
        .noContentMessage=${'No warnings match your filters.'}
        @bulk-select=${this._onBulkSelect}
        @table-cell-click=${this._onCellClick}
        @table-row-action=${this._onRowAction}
      >
        <div slot="table-actions" class="bulk-tools">
          ${keyed(
            `priority:${this._bulkResetKey}`,
            html`
              <jh-select
                label="Set priority"
                .options=${PRIORITY_OPTIONS}
                @jh-change=${(e: Event) => {
                  this._bulkPriority = (e.target as HTMLInputElement).value as WarningPriority
                }}
              ></jh-select>
            `
          )}
          <jh-button
            appearance="secondary"
            size="small"
            label="Apply"
            ?disabled=${!this._bulkPriority}
            @click=${this._applyBulkPriority}
          ></jh-button>
          ${keyed(
            `type:${this._bulkResetKey}`,
            html`
              <jh-select
                label="Set type"
                .options=${TYPE_OPTIONS}
                @jh-change=${(e: Event) => {
                  this._bulkType = (e.target as HTMLInputElement).value as MetadataType
                }}
              ></jh-select>
            `
          )}
          <jh-button
            appearance="secondary"
            size="small"
            label="Apply"
            ?disabled=${!this._bulkType}
            @click=${this._applyBulkType}
          ></jh-button>
        </div>
      </jha-advanced-table>
    `
  }
}

import { LitElement, html, css } from 'lit'
import { state } from 'lit/decorators.js'
import '@jack-henry/jh-elements/components/table/table.js'
import '@jack-henry/jh-elements/components/table-row/table-row.js'
import '@jack-henry/jh-elements/components/table-header-cell/table-header-cell.js'
import '@jack-henry/jh-elements/components/table-data-cell/table-data-cell.js'
import '@jack-henry/jh-elements/components/tag/tag.js'
import '@jack-henry/jh-elements/components/card/card.js'
import '@jack-henry/jh-elements/components/notification/notification.js'
import '@banno/jha-wc/src/tables/advanced/jha-advanced-table/jha-advanced-table.js'

interface AccountRow {
  id: string
  name: string
  type: string
  status: string
  balance: number
}

const ACCOUNTS: AccountRow[] = [
  { id: '1', name: 'Checking ···1234', type: 'Checking', status: 'Active', balance: 4200.55 },
  { id: '2', name: 'Savings ···5678', type: 'Savings', status: 'Active', balance: 12500.0 },
  { id: '3', name: 'Money Market ···9012', type: 'Savings', status: 'Frozen', balance: 38400.19 },
  { id: '4', name: 'Business ···3456', type: 'Checking', status: 'Closed', balance: 0 },
  { id: '5', name: 'Holiday Club ···7890', type: 'Savings', status: 'Active', balance: 1875.42 },
]

const ADVANCED_COLUMNS = [
  { id: 'name', label: 'Account', sortBy: true, searchable: true },
  { id: 'type', label: 'Type', sortBy: true, filterType: 'list', options: ['Checking', 'Savings'] },
  {
    id: 'status',
    label: 'Status',
    sortBy: true,
    dataType: 'badge',
    filterType: 'list',
    options: ['Active', 'Frozen', 'Closed'],
    badgeMap: [
      ['Active', 'positive'],
      ['Frozen', 'primary'],
      ['Closed', 'secondary'],
    ],
  },
  { id: 'balance', label: 'Balance', sortBy: true, alignRight: true, dataType: 'currency' },
] as const

const ROW_ACTIONS = [{ id: 'view', label: 'View details', icon: 'view' }]

function money(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export default class TableValidationPrototype extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .container {
      padding: var(--jh-dimension-600, 3rem);
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-800, 4rem);
      max-width: 960px;
    }

    section {
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-300, 1.5rem);
    }

    h2 {
      margin: 0;
      font-size: var(--jh-font-size-500, 1.5rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled);
    }

    p.note {
      margin: 0;
      font-size: var(--jh-font-size-350, 0.875rem);
      color: var(--jh-color-content-secondary-enabled);
      line-height: 1.5;
    }

    .card-body {
      padding: var(--jh-dimension-400, 2rem);
    }

    .selection {
      font-size: var(--jh-font-size-350, 0.875rem);
      color: var(--jh-color-content-secondary-enabled);
    }
  `

  @state() private _selected: string[] = []
  @state() private _lastAction = ''
  // jh-table is presentational: the sortable header only fires `jh-sort`; the
  // app owns the actual reordering. This tracks the Account column's direction.
  @state() private _sortDir: 'none' | 'ascending' | 'descending' = 'none'

  private get _sortedAccounts(): AccountRow[] {
    if (this._sortDir === 'none') return ACCOUNTS
    const sorted = [...ACCOUNTS].sort((a, b) => a.name.localeCompare(b.name))
    return this._sortDir === 'descending' ? sorted.reverse() : sorted
  }

  private _onSort = (e: CustomEvent) => {
    this._sortDir = e.detail.sorted
  }

  private _onBulkSelect = (e: CustomEvent) => {
    this._selected = e.detail.items ?? []
  }

  private _onRowAction = (e: CustomEvent) => {
    this._lastAction = `Row action "${e.detail.action?.id}" on ${e.detail.item?.name}`
  }

  render() {
    return html`
      <div class="container">
        <jh-notification type="alert" appearance="warning">
          Temporary validation prototype — delete once the table components are verified.
        </jh-notification>

        <section>
          <h2>1. Basic <code>jh-table</code> (static rows)</h2>
          <p class="note">
            Validates header row via <code>slot="jh-table-header"</code>, slotted header-cell
            labels, and slotted data-cell values — no <code>label</code> attribute.
          </p>
          <jh-card>
            <div class="card-body">
              <jh-table>
                <jh-table-row slot="jh-table-header">
                  <jh-table-header-cell>Account</jh-table-header-cell>
                  <jh-table-header-cell>Type</jh-table-header-cell>
                  <jh-table-header-cell horizontal-align="right">Balance</jh-table-header-cell>
                </jh-table-row>
                <jh-table-row>
                  <jh-table-data-cell>Checking ···1234</jh-table-data-cell>
                  <jh-table-data-cell>Checking</jh-table-data-cell>
                  <jh-table-data-cell horizontal-align="right">$4,200.55</jh-table-data-cell>
                </jh-table-row>
                <jh-table-row>
                  <jh-table-data-cell>Savings ···5678</jh-table-data-cell>
                  <jh-table-data-cell>Savings</jh-table-data-cell>
                  <jh-table-data-cell horizontal-align="right">$12,500.00</jh-table-data-cell>
                </jh-table-row>
              </jh-table>
            </div>
          </jh-card>
        </section>

        <section>
          <h2>2. <code>jh-table</code> with rows from data + a slotted tag</h2>
          <p class="note">
            Validates mapping rows from a list, a <code>sortable</code> header cell, and rich
            slotted cell content (a <code>jh-tag</code> status). Click the Account header to
            sort — <code>jh-table</code> is presentational, so the prototype reorders the data
            in response to the <code>jh-sort</code> event.
          </p>
          <jh-card>
            <div class="card-body">
              <jh-table striped @jh-sort=${this._onSort}>
                <jh-table-row slot="jh-table-header">
                  <jh-table-header-cell sortable>Account</jh-table-header-cell>
                  <jh-table-header-cell>Type</jh-table-header-cell>
                  <jh-table-header-cell>Status</jh-table-header-cell>
                  <jh-table-header-cell horizontal-align="right">Balance</jh-table-header-cell>
                </jh-table-row>
                ${this._sortedAccounts.map(a => html`
                  <jh-table-row>
                    <jh-table-data-cell>${a.name}</jh-table-data-cell>
                    <jh-table-data-cell>${a.type}</jh-table-data-cell>
                    <jh-table-data-cell>
                      <jh-tag label=${a.status}></jh-tag>
                    </jh-table-data-cell>
                    <jh-table-data-cell horizontal-align="right">${money(a.balance)}</jh-table-data-cell>
                  </jh-table-row>
                `)}
              </jh-table>
            </div>
          </jh-card>
        </section>

        <section>
          <h2>3. <code>jha-advanced-table</code> (sort, search, filter, badge)</h2>
          <p class="note">
            Validates the legacy advanced table with property-bound <code>.columns</code> /
            <code>.data</code>, a badge column, bulk selection, and a row action.
          </p>
          ${this._lastAction
            ? html`<p class="selection">${this._lastAction}</p>`
            : ''}
          ${this._selected.length
            ? html`<p class="selection">${this._selected.length} row(s) selected.</p>`
            : ''}
          <jh-card>
            <div class="card-body">
              <jha-advanced-table
                .columns=${ADVANCED_COLUMNS}
                .data=${ACCOUNTS}
                .rowActions=${ROW_ACTIONS}
                .selectedItems=${this._selected}
                .selectedItemIdentifier=${'id'}
                .bulkActions=${true}
                .canEditColumns=${true}
                .noPagination=${true}
                .dataPlural=${'accounts'}
                .noContentMessage=${'No accounts match your filters.'}
                @bulk-select=${this._onBulkSelect}
                @table-row-action=${this._onRowAction}
              ></jha-advanced-table>
            </div>
          </jh-card>
        </section>
      </div>
    `
  }
}

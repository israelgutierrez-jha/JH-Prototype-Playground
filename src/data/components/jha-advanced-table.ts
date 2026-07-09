import type { ComponentDoc } from './types.js'

// NOTE: `jha-advanced-table` ships from the legacy `@banno/jha-wc` package,
// which has no Custom Elements Manifest. Its props/events/slots below are
// hand-authored from the component's source
// (node_modules/@banno/jha-wc/src/tables/advanced/jha-advanced-table/), not
// derived — see the fallback in scripts/generate-component-docs.ts. Keep this
// in sync manually if the vendored `@banno/jha-wc` version changes.
export const doc: ComponentDoc = {
  tag: 'jha-advanced-table',
  name: 'Advanced Table (legacy)',
  import: '@banno/jha-wc/src/tables/advanced/jha-advanced-table/jha-advanced-table.js',
  summary:
    'A full-featured data table with sorting, filtering, search, pagination, bulk actions, and a column editor — the legacy component still used for anything a plain jh-table can\'t handle.',
  category: 'data',
  status: 'stable',
  whenToUse: [
    'Displaying a large, information-dense dataset that needs sorting, filtering, search, and pagination out of the box — transaction lists, admin queues, reporting grids.',
    'Letting users bulk-select rows and apply an action to all of them at once from a custom toolbar.',
    'Letting users show/hide or reorder columns, or save and switch between named views of the same data.',
  ],
  whenNotToUse: [
    'For a short, simple list of rows with no need for sorting/filtering/bulk actions — use `jh-table` instead; it is lighter and fully within the current JH Design System (this component predates it).',
    'As a general-purpose list of records rather than tabular data — use `jh-list-group` / `jh-list-item`.',
  ],
  props: [
    {
      name: 'columns',
      type: 'TableColumn[]',
      default: '[]',
      description:
        'Column definitions: id (matches a key/path on each row), label, sortBy, searchable, filterType, dataType (e.g. "badge", "currency", "date"), badgeMap, valueFormatter/valueRenderer.',
      tier: 'common',
    },
    {
      name: 'data',
      type: 'DataObject[]',
      default: '[]',
      description: 'The row data to render. Each object is matched to `columns` by the column `id`.',
      tier: 'common',
    },
    {
      name: 'tableConfig',
      type: 'DataConfiguration | null',
      default: 'null',
      description:
        'The single object that drives filters, sort, search query, column order, and groupings — this is the "config" prop that customizes most of the table\'s behavior. Pair with the `table-update` event to make it controlled.',
      tier: 'common',
    },
    {
      name: 'rowActions',
      type: 'RowAction[]',
      default: '[]',
      description:
        'Per-row overflow-menu actions: { id, label, icon?, hiddenCondition?, disabledCondition? }. Selecting one fires `table-row-action`.',
      tier: 'common',
    },
    {
      name: 'bulkActions',
      type: 'boolean',
      default: 'false',
      description: 'Shows a selection checkbox column and the bulk-action toolbar once one or more rows are selected.',
      tier: 'common',
    },
    {
      name: 'selectedItems',
      type: 'string[]',
      default: '[]',
      description: 'Controlled array of selected row identifiers (matched via `selectedItemIdentifier`). Update it on `bulk-select`.',
      tier: 'common',
    },
    {
      name: 'selectedItemIdentifier',
      type: 'string',
      default: "'id'",
      description: 'The row field used as each item\'s unique identifier for selection.',
      tier: 'common',
    },
    {
      name: 'canEditColumns',
      type: 'boolean',
      default: 'false',
      description: 'Shows the column editor (visibility + order) control in the toolbar.',
      tier: 'common',
    },
    {
      name: 'canEditViews',
      type: 'boolean',
      default: 'false',
      description: 'Enables creating/renaming/deleting saved views (paired with the `views` prop).',
      tier: 'common',
    },
    {
      name: 'views',
      type: 'TableView[]',
      default: '[]',
      description: 'Saved views: named, reusable filter/sort/column configurations the user can switch between.',
      tier: 'common',
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description: 'Shows the loading state in place of rows.',
      tier: 'common',
    },
    {
      name: 'allowRefresh',
      type: 'boolean',
      default: 'false',
      description: 'Shows a refresh button in the toolbar; clicking it fires `refresh-table-data`.',
      tier: 'common',
    },
    {
      name: 'noPagination',
      type: 'boolean',
      default: 'false',
      description: 'Disables pagination and renders every row from `data` at once.',
      tier: 'common',
    },
    {
      name: 'dataPlural',
      type: 'string',
      default: "'items'",
      description: 'Plural noun used in the row count and default empty-state text, e.g. "warnings".',
      tier: 'common',
    },
    {
      name: 'noContentMessage',
      type: 'string',
      default: "''",
      description: 'Custom empty-state message shown when there are no rows (and no `no-content-message` slot content).',
      tier: 'common',
    },
    {
      name: 'pageLimitOptions',
      type: 'number[]',
      default: '[10, 25, 50, 100]',
      description: 'Selectable page-size options, shown when `allowPageLimitChange` is true.',
      tier: 'advanced',
    },
    {
      name: 'pageLimit',
      type: 'number',
      default: '10',
      description: 'Rows per page.',
      tier: 'advanced',
    },
    {
      name: 'pageOffset',
      type: 'number',
      default: '0',
      description: 'Current pagination offset.',
      tier: 'advanced',
    },
    {
      name: 'allowPageChange',
      type: 'boolean',
      default: 'false',
      description: 'Shows pagination next/back controls.',
      tier: 'advanced',
    },
    {
      name: 'allowPageLimitChange',
      type: 'boolean',
      default: 'false',
      description: 'Shows the page-size selector.',
      tier: 'advanced',
    },
    {
      name: 'apiHasMoreData',
      type: 'boolean',
      default: 'false',
      description: 'For server-paginated data: signals more pages exist beyond what has been loaded.',
      tier: 'advanced',
    },
    {
      name: 'stickyRows',
      type: 'DataObject[]',
      default: '[]',
      description: 'Rows pinned above the scrollable body (e.g. totals or a highlighted record).',
      tier: 'advanced',
    },
    {
      name: 'stickyHeader',
      type: 'boolean',
      default: 'false',
      description: 'Keeps the column header row fixed while the body scrolls.',
      tier: 'advanced',
    },
    {
      name: 'fullWidthColumns',
      type: 'boolean',
      default: 'false',
      description: 'Stretches columns to fill the available width instead of sizing to content.',
      tier: 'advanced',
    },
    {
      name: 'hideAllView',
      type: 'boolean',
      default: 'false',
      description: 'Hides the built-in "All" view tab when `views` are configured.',
      tier: 'advanced',
    },
    {
      name: 'activeViewId',
      type: 'string | null',
      default: 'null',
      description: 'The currently active saved view id.',
      tier: 'advanced',
    },
    {
      name: 'maxVisibleFilters',
      type: 'number',
      default: 'undefined',
      description: 'Caps how many filter controls show before collapsing the rest into an overflow.',
      tier: 'advanced',
    },
    {
      name: 'searchPlaceholderText',
      type: 'string | null',
      default: 'null',
      description: 'Placeholder text for the built-in search input.',
      tier: 'advanced',
    },
    {
      name: 'collapsedGroupIds',
      type: 'string[]',
      default: '[]',
      description: 'Ids of currently collapsed groups, when row grouping is configured.',
      tier: 'advanced',
    },
    {
      name: 'loadingMore',
      type: 'boolean',
      default: 'false',
      description: 'Shows an inline loading indicator while appending more rows (infinite-scroll style loading).',
      tier: 'advanced',
    },
    {
      name: 'columnWidths',
      type: 'Record<string, number>',
      default: '{}',
      description: 'Internally-managed measured column widths; rarely set directly.',
      tier: 'advanced',
    },
    {
      name: 'actionPositionValues',
      type: 'RowActionsPositionValues | null',
      default: 'null',
      description: 'Internal layout measurements for positioning the row-actions overflow menu.',
      tier: 'advanced',
    },
    {
      name: 'componentWidth',
      type: 'string | null',
      default: 'null',
      description: 'Internally-measured component width; rarely set directly.',
      tier: 'advanced',
    },
    {
      name: 'tableHeaderWidth',
      type: 'number | null',
      default: 'null',
      description: 'Internally-measured header width; rarely set directly.',
      tier: 'advanced',
    },
    {
      name: 'headerFixed',
      type: 'boolean',
      default: 'false',
      description: 'Internal flag toggled while the sticky header is engaged.',
      tier: 'advanced',
    },
  ],
  events: [
    {
      name: 'bulk-select',
      description: 'Fires whenever the selection changes (row checkbox, select-all, deselect-all).',
      payload: 'e.detail.items — the full array of currently-selected item ids',
    },
    {
      name: 'table-row-action',
      description: 'Fires when a user chooses an item from a row\'s overflow-actions menu.',
      payload: 'e.detail.item, e.detail.action',
    },
    {
      name: 'table-cell-click',
      description: 'Fires when a data cell is clicked.',
      payload: 'e.detail.colId, e.detail.item',
    },
    {
      name: 'table-cell-double-click',
      description: 'Fires when a data cell is double-clicked.',
      payload: 'e.detail.colId, e.detail.item',
    },
    {
      name: 'bulk-action',
      description:
        'Fires when content slotted into `table-actions` dispatches its own bubbling `bulk-action` event — the table merges in the current selection before re-dispatching.',
      payload: 'e.detail.items, plus whatever detail the slotted trigger dispatched',
    },
    {
      name: 'refresh-table-data',
      description: 'Fires when the refresh button (shown via `allowRefresh`) is clicked.',
    },
    {
      name: 'table-update',
      description:
        'Fires when the user changes filters, sort, search, column order, or grouping — write `e.detail.config` back into `tableConfig` to keep it controlled.',
      payload: "e.detail.type ('filters' | 'sort' | 'columnOrder' | 'searchQuery' | 'view-reset' | 'grouping'), e.detail.config",
    },
    {
      name: 'view-change',
      description: 'Fires when the active saved view changes.',
    },
    {
      name: 'pagination-backward',
      description: 'Fires when the previous-page control is clicked.',
    },
    {
      name: 'pagination-forward',
      description: 'Fires when the next-page control is clicked.',
    },
    {
      name: 'page-limit-change',
      description: 'Fires when the page-size selector changes.',
    },
    {
      name: 'collapsed-groups-change',
      description: 'Fires when a row group is expanded or collapsed.',
    },
  ],
  slots: [
    {
      name: '',
      description: 'Content above the search/filter row in the toolbar area — typically a heading.',
    },
    {
      name: 'table-actions',
      description:
        'The bulk-action toolbar, rendered only while one or more rows are selected. Put buttons/menus here; dispatch a bubbling `bulk-action` event from them to receive the current selection.',
    },
    {
      name: 'table-controls',
      description: 'Extra controls appended next to the refresh button and column editor.',
    },
    {
      name: 'table-views-right',
      description: 'Extra controls appended next to the saved-views tab bar.',
    },
    {
      name: 'header-right',
      description: 'Content pinned to the right end of the column-header row.',
    },
    {
      name: 'no-content-message',
      description: 'Overrides the default empty-state message.',
    },
    {
      name: 'custom-footer',
      description: 'Content appended at the very bottom, after pagination and sticky rows.',
    },
  ],
  examples: [
    {
      title: 'Sortable, filterable table with a status badge column',
      useCase: 'The default case: a dense dataset that needs sorting, filtering, and search without any bulk editing.',
      code: `<jha-advanced-table
  .columns=\${[
    { id: 'codeNum', label: 'Code #', sortBy: true, alignRight: true, dataType: 'number' },
    { id: 'description', label: 'Description', sortBy: true, searchable: true },
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
  ]}
  .data=\${rows}
  .dataPlural=\${'warnings'}
></jha-advanced-table>`,
    },
    {
      title: 'Bulk selection with a custom action bar',
      useCase: 'Let users select many rows and apply one action (e.g. set a priority) to all of them at once.',
      code: `<jha-advanced-table
  .columns=\${columns}
  .data=\${rows}
  .rowActions=\${[{ id: 'edit', label: 'Edit', icon: 'edit' }]}
  .selectedItems=\${this._selected}
  .selectedItemIdentifier=\${'id'}
  .bulkActions=\${true}
  @bulk-select=\${(e) => { this._selected = e.detail.items }}
  @table-row-action=\${(e) => { if (e.detail.action.id === 'edit') this._openDetail(e.detail.item) }}
>
  <div slot="table-actions">
    <jh-button
      label="Mark critical"
      appearance="secondary"
      size="small"
      @click=\${() => this._applyPriorityToSelected('Critical')}
    ></jh-button>
  </div>
</jha-advanced-table>`,
    },
    {
      title: 'Controlled filters/sort via tableConfig',
      useCase: 'Persist or externally drive the table\'s filter, sort, or search state — e.g. to sync it with the URL.',
      code: `<jha-advanced-table
  .columns=\${columns}
  .data=\${rows}
  .tableConfig=\${this._config}
  @table-update=\${(e) => { this._config = e.detail.config }}
></jha-advanced-table>`,
    },
  ],
  gotchas: [
    'This is a legacy `@banno/jha-wc` component, not `@jack-henry/jh-elements` — it has no Custom Elements Manifest, so the props/events/slots here are hand-authored and verified against the vendored source rather than generated. Re-check them after a `@banno/jha-wc` version bump.',
    'Row identity is whatever field `selectedItemIdentifier` names (default `"id"`) — every row object must have a unique value there for selection and row actions to work.',
    'The `table-actions` slot content only renders once `selectedItems.length > 0`; keep it in the template unconditionally rather than conditionally rendering it yourself.',
    '`rowActions[].icon` names come from `jha-wc`\'s own internal icon set (e.g. `"edit"`), not `@jack-henry/jh-icons` `jh-icon-*` tags.',
    'Complex props (`columns`, `data`, `rowActions`, `tableConfig`, etc.) must be bound with Lit property syntax (`.columns=`), not as string attributes.',
    'A `dataType: "badge"` column with a falsy/empty value renders nothing (no badge, no error) — useful for representing "not yet set" rows without extra template logic.',
    'Do not nest inside a `jh-card`. This component already provides its own toolbar/surface treatment — wrapping it in a card doubles the surface (card padding + table\'s own chrome) and reads as an unintended extra layer. Place a heading above it in a plain container instead.',
  ],
  related: ['jh-table', 'jh-list-group'],
  source: { storybookUrl: '', importedAt: '2026-07-06', componentVersion: '@banno/jha-wc@13.20.1' },
}

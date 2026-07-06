import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { keyed } from 'lit/directives/keyed.js'
import '@jack-henry/jh-elements/components/card/card.js'
import '@jack-henry/jh-elements/components/button/button.js'
import '@jack-henry/jh-elements/components/input/input.js'
import '@jack-henry/jh-elements/components/input-textarea/input-textarea.js'
import '@jack-henry/jh-elements/components/select/select.js'
import '@jack-henry/jh-elements/components/notification/notification.js'
import '@jack-henry/jh-elements/components/divider/divider.js'
import {
  warningStore,
  deriveActionLabel,
  type WarningMgmtRow,
  type WarningPriority,
  type MetadataType,
  type Visibility,
} from './store.js'
import { goToQueue } from './routing.js'

// jh-select only shows a value's label on first paint when the matching option
// is flagged `selected` — it does not re-derive the label from a later external
// `.value=` change. Building the list per current value (and re-keying the
// element below) keeps the visible label in sync whenever the row changes.
function withSelected(options: { value: string; label: string }[], current: string) {
  return options.map(opt => ({ ...opt, selected: opt.value === current }))
}

const PRIORITY_OPTIONS = [
  { value: '', label: 'Unset' },
  { value: 'Critical', label: 'Critical' },
  { value: 'High', label: 'High' },
  { value: 'Default', label: 'Default' },
]

const TYPE_OPTIONS = [
  { value: '', label: 'Unset' },
  { value: 'Alert', label: 'Alert' },
  { value: 'Note', label: 'Note' },
  { value: 'Insight', label: 'Insight' },
]

const VISIBILITY_OPTIONS = [
  { value: '', label: 'Unset' },
  { value: 'Global', label: 'Global' },
  { value: 'Account', label: 'Account' },
  { value: 'Product', label: 'Product' },
]

@customElement('wm-detail-view')
export class WarningManagementDetailView extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: var(--jh-dimension-600, 3rem);
    }

    .back {
      margin-bottom: var(--jh-dimension-400, 1rem);
    }

    .header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--jh-dimension-300, 0.75rem);
      margin-bottom: var(--jh-dimension-500, 2rem);
      flex-wrap: wrap;
    }

    h1 {
      font-size: var(--jh-font-size-600, 1.5rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled);
      margin: 0;
    }

    .code-tag {
      color: var(--jh-color-content-secondary-enabled);
      font-size: var(--jh-font-size-400, 1rem);
    }

    .layout {
      display: grid;
      grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
      gap: var(--jh-dimension-500, 2rem);
      align-items: start;
    }

    @media (max-width: 860px) {
      .layout {
        grid-template-columns: 1fr;
      }
    }

    .form-body,
    .legacy-body {
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-400, 1rem);
      padding: var(--jh-dimension-400, 1rem);
    }

    .field-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--jh-dimension-300, 0.75rem);
    }

    @media (max-width: 640px) {
      .field-row {
        grid-template-columns: 1fr;
      }
    }

    .action-preview {
      font-size: var(--jh-font-size-350, 0.875rem);
      color: var(--jh-color-content-secondary-enabled);
      margin: 0;
    }

    .action-preview strong {
      color: var(--jh-color-content-primary-enabled);
      font-weight: var(--jh-font-weight-semibold, 600);
    }

    .legacy-title {
      font-size: var(--jh-font-size-450, 1.125rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled);
      margin: 0;
    }

    .legacy-row {
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-50, 2px);
    }

    .legacy-label {
      font-size: var(--jh-font-size-300, 0.75rem);
      color: var(--jh-color-content-secondary-enabled);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .legacy-value {
      font-size: var(--jh-font-size-400, 1rem);
      color: var(--jh-color-content-primary-enabled);
    }

    .footer-actions {
      display: flex;
      gap: var(--jh-dimension-300, 0.75rem);
      margin-top: var(--jh-dimension-200, 0.5rem);
    }

    .confirm {
      display: block;
      margin-bottom: var(--jh-dimension-400, 1rem);
    }

    .not-found {
      padding: var(--jh-dimension-600, 3rem) 0;
    }
  `

  @property() warningId = ''

  @state() private _draft: WarningMgmtRow | null = null
  @state() private _confirm = false

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has('warningId')) {
      const row = warningStore.get(this.warningId)
      this._draft = row ? { ...row } : null
      this._confirm = false
    }
  }

  private _update<K extends keyof WarningMgmtRow>(key: K, value: WarningMgmtRow[K]) {
    if (!this._draft) return
    this._draft = { ...this._draft, [key]: value }
    this._confirm = false
  }

  private _save() {
    if (!this._draft) return
    const actionLabel = deriveActionLabel(this._draft.metadataType, this._draft.priority)
    const finalRow = { ...this._draft, actionLabel }
    warningStore.update(finalRow.id, finalRow)
    this._draft = finalRow
    this._confirm = true
  }

  private _cancel() {
    const row = warningStore.get(this.warningId)
    this._draft = row ? { ...row } : null
    this._confirm = false
  }

  render() {
    if (!this._draft) {
      return html`
        <jh-button
          appearance="tertiary"
          size="small"
          label="← Back to queue"
          class="back"
          @click=${goToQueue}
        ></jh-button>
        <div class="not-found">
          <jh-notification type="alert" appearance="negative"> Warning "${this.warningId}" was not found. </jh-notification>
        </div>
      `
    }

    const row = this._draft
    const previewLabel = deriveActionLabel(row.metadataType, row.priority)

    return html`
      <jh-button appearance="tertiary" size="small" label="← Back to queue" class="back" @click=${goToQueue}></jh-button>

      <div class="header">
        <h1>${row.displayAlias || row.legacyDescription}</h1>
        <span class="code-tag">Warning ${row.id} · Legacy code ${row.codeNum}</span>
      </div>

      ${this._confirm
        ? html`<jh-notification class="confirm" type="alert" appearance="positive">Changes saved.</jh-notification>`
        : ''}

      <div class="layout">
        <jh-card>
          <div class="form-body">
            <jh-input
              label="Display alias"
              .value=${row.displayAlias}
              @jh-input=${(e: CustomEvent<{ value: string }>) => this._update('displayAlias', e.detail.value)}
            ></jh-input>

            <jh-input-textarea
              label="Description"
              .value=${row.description}
              @jh-input=${(e: CustomEvent<{ value: string }>) => this._update('description', e.detail.value)}
            ></jh-input-textarea>

            <div class="field-row">
              ${keyed(
                `priority:${row.id}:${row.priority}`,
                html`
                  <jh-select
                    label="Priority"
                    .options=${withSelected(PRIORITY_OPTIONS, row.priority)}
                    @jh-change=${(e: Event) =>
                      this._update('priority', (e.target as HTMLInputElement).value as WarningPriority)}
                  ></jh-select>
                `
              )}
              ${keyed(
                `type:${row.id}:${row.metadataType}`,
                html`
                  <jh-select
                    label="Metadata type"
                    .options=${withSelected(TYPE_OPTIONS, row.metadataType)}
                    @jh-change=${(e: Event) =>
                      this._update('metadataType', (e.target as HTMLInputElement).value as MetadataType)}
                  ></jh-select>
                `
              )}
              ${keyed(
                `visibility:${row.id}:${row.visibility}`,
                html`
                  <jh-select
                    label="Visibility"
                    .options=${withSelected(VISIBILITY_OPTIONS, row.visibility)}
                    @jh-change=${(e: Event) =>
                      this._update('visibility', (e.target as HTMLInputElement).value as Visibility)}
                  ></jh-select>
                `
              )}
            </div>

            <p class="action-preview">Action label on save: <strong>${previewLabel}</strong></p>

            <div class="footer-actions">
              <jh-button appearance="primary" label="Save changes" @click=${this._save}></jh-button>
              <jh-button appearance="secondary" label="Cancel" @click=${this._cancel}></jh-button>
            </div>
          </div>
        </jh-card>

        <jh-card>
          <div class="legacy-body">
            <p class="legacy-title">Legacy Symitar record</p>

            <div class="legacy-row">
              <span class="legacy-label">Legacy code</span>
              <span class="legacy-value">${row.codeNum}</span>
            </div>
            <jh-divider></jh-divider>

            <div class="legacy-row">
              <span class="legacy-label">Legacy description</span>
              <span class="legacy-value">${row.legacyDescription}</span>
            </div>
            <jh-divider></jh-divider>

            <div class="legacy-row">
              <span class="legacy-label">Usage count</span>
              <span class="legacy-value">${row.usageCount.toLocaleString()}</span>
            </div>
            <jh-divider></jh-divider>

            <div class="legacy-row">
              <span class="legacy-label">Privileges</span>
              <span class="legacy-value">${row.privilegesSummary}</span>
            </div>
            <jh-divider></jh-divider>

            <div class="legacy-row">
              <span class="legacy-label">Current action label</span>
              <span class="legacy-value">${row.actionLabel || '—'}</span>
            </div>
          </div>
        </jh-card>
      </div>
    `
  }
}

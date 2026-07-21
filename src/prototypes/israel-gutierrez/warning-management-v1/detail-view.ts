import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { keyed } from 'lit/directives/keyed.js'
import '@jkhy/platform-tools/components/jh-platform-content.js'
import '@jkhy/platform-tools/components/jh-platform-panel.js'
import '@jack-henry/jh-icons/icons-wc/icon-arrow-left.js'
import '@jack-henry/jh-elements/components/card/card.js'
import '@jack-henry/jh-elements/components/button/button.js'
import '@jack-henry/jh-elements/components/input/input.js'
import '@jack-henry/jh-elements/components/input-textarea/input-textarea.js'
import '@jack-henry/jh-elements/components/select/select.js'
import '@jack-henry/jh-elements/components/notification/notification.js'
import {
  warningStore,
  deriveActionLabel,
  privilegeLevelLabel,
  type WarningMgmtRow,
  type WarningPriority,
  type MetadataType,
  type Visibility,
  type RestrictionType,
  type DisplayMode,
  type ExpirationMode,
} from './store.js'
import { goToQueue, goToDetail, BASE_HASH } from './routing.js'
import {
  withSelected,
  PRIORITY_OPTIONS,
  TYPE_OPTIONS,
  VISIBILITY_OPTIONS,
  RESTRICTION_OPTIONS,
  DISPLAY_MODE_OPTIONS,
  EXPIRATION_MODE_OPTIONS,
  PRIVILEGE_LEVEL_OPTIONS,
} from './options.js'

function blankDraft(): WarningMgmtRow {
  return {
    id: 'new',
    priority: '',
    priorityRank: 0,
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
}

@customElement('wm-detail-view')
export class WarningManagementDetailView extends LitElement {
  static styles = css`
    /* height: 100% (not 100vh) resolves against the definite height
       proto-shell.ts gives the mounted prototype element — see CLAUDE.md's
       "Full-height split-pane layout" pattern. jh-platform-content needs
       this to size its own 100%-height right-panel slot correctly. */
    :host {
      display: block;
      height: 100%;
    }

    .main-pane {
      padding: var(--jh-dimension-600, 3rem);
    }

    /* Hand-built to match production's actual jh-page-back-button/jh-link-button
       result (brand-blue link at rest, icon+label+"/"+current-page all on one
       baseline) — neither component exists in this repo's vendored
       @jack-henry/jh-elements version, so jh-platform-back-button (available,
       but styled muted-at-rest/blue-on-hover-only, and shadow-encapsulated so
       its own internal spacing can't be corrected from outside) isn't a
       faithful match. Revisit once the vendor is updated with the real ones. */
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: var(--jh-dimension-200, 0.5rem);
      margin-bottom: var(--jh-dimension-400, 1rem);
      font-size: var(--jh-font-size-400, 1rem);
    }

    .breadcrumb-back {
      display: flex;
      align-items: center;
      gap: var(--jh-dimension-100, 0.25rem);
      color: var(--jh-color-content-brand-enabled);
      text-decoration: none;
    }

    .breadcrumb-back:hover {
      text-decoration: underline;
    }

    .breadcrumb-back jh-icon-arrow-left {
      --jh-icon-color-fill: var(--jh-color-content-brand-enabled);
    }

    .breadcrumb-sep,
    .breadcrumb-current {
      color: var(--jh-color-content-secondary-enabled);
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
      font-weight: var(--jh-font-weight-500, 600);
      color: var(--jh-color-content-primary-enabled);
      margin: 0;
    }

    .code-tag {
      color: var(--jh-color-content-secondary-enabled);
      font-size: var(--jh-font-size-400, 1rem);
    }

    .status-line {
      color: var(--jh-color-content-secondary-enabled);
      font-size: var(--jh-font-size-350, 0.875rem);
      margin: 0;
    }

    .form-body {
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-400, 1rem);
      padding: var(--jh-dimension-400, 1rem);
    }

    /* auto-fit + minmax (not a fixed repeat(3, 1fr)) lets the grid's own
       min-content width shrink freely — needed now that the right panel
       permanently claims space via jh-platform-content's flex row, since a
       fixed 3-up grid's min-content size was overflowing past the panel
       divider at moderate viewport widths instead of wrapping. */
    .field-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: var(--jh-dimension-300, 0.75rem);
    }

    .field-hint {
      font-size: var(--jh-font-size-350, 0.875rem);
      color: var(--jh-color-content-secondary-enabled);
      margin: 0;
      line-height: 1.5;
    }

    .action-preview {
      font-size: var(--jh-font-size-350, 0.875rem);
      color: var(--jh-color-content-secondary-enabled);
      margin: 0;
    }

    .action-preview strong {
      color: var(--jh-color-content-primary-enabled);
      font-weight: var(--jh-font-weight-500, 600);
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

    /* Right panel — rendered via jh-platform-panel slotted into
       jh-platform-content's slot="right-panel" (not jh-platform-drawer):
       this panel is a permanent companion to the form, with no way to
       reopen it once closed, so it shouldn't have a close button at all —
       jh-platform-drawer always renders one, jh-platform-panel does not.
       Provides the border, page background, height, heading, and scrollable
       content area for free either way. */
    .legacy-content {
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-300, 0.75rem);
    }

    .group-label {
      font-size: var(--jh-font-size-300, 0.75rem);
      color: var(--jh-color-content-secondary-enabled);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      margin: var(--jh-dimension-300, 0.75rem) 0 0;
    }

    .detail-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--jh-dimension-300, 0.75rem);
    }

    .row-label {
      color: var(--jh-color-content-secondary-enabled);
    }

    .row-value {
      color: var(--jh-color-content-primary-enabled);
      text-align: right;
    }

    .native-empty {
      font-size: var(--jh-font-size-400, 1rem);
      color: var(--jh-color-content-secondary-enabled);
      line-height: 1.5;
      margin: 0;
    }
  `

  @property() warningId = ''

  @state() private _draft: WarningMgmtRow | null = null
  @state() private _confirm = false

  private get _isNew() {
    return this.warningId === 'new'
  }

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has('warningId')) {
      if (this._isNew) {
        this._draft = blankDraft()
      } else {
        const row = warningStore.get(this.warningId)
        this._draft = row ? { ...row } : null
      }
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
    const actionLabel = deriveActionLabel(this._draft.metadataType, this._draft.priority, this._draft.restrictionType)
    const finalRow = { ...this._draft, actionLabel }
    if (this._isNew) {
      const created = warningStore.createNative(finalRow)
      goToDetail(created.id)
      return
    }
    warningStore.update(finalRow.id, finalRow)
    this._draft = warningStore.get(finalRow.id) ?? finalRow
    this._confirm = true
  }

  private _cancel() {
    if (this._isNew) {
      goToQueue()
      return
    }
    const row = warningStore.get(this.warningId)
    this._draft = row ? { ...row } : null
    this._confirm = false
  }

  render() {
    if (!this._draft) {
      return html`
        <div class="breadcrumb">
          <a class="breadcrumb-back" href="${BASE_HASH}/queue">
            <jh-icon-arrow-left size="small"></jh-icon-arrow-left>
            Warnings
          </a>
        </div>
        <div class="not-found">
          <jh-notification type="alert" appearance="negative"> Warning "${this.warningId}" was not found. </jh-notification>
        </div>
      `
    }

    const row = this._draft
    const previewLabel = deriveActionLabel(row.metadataType, row.priority, row.restrictionType)
    const displayModeHelper =
      !row.isNative && row.legacyDisplayFlags
        ? `Derived from Display in Acct Mgr = ${row.legacyDisplayFlags.acctMgr ? 'Yes' : 'No'} and Display in Tlr Trn = ${
            row.legacyDisplayFlags.tlrTrn ? 'Yes' : 'No'
          } — confirm or override.`
        : ''

    return html`
      <jh-platform-content hide-header>
        <div class="main-pane">
          <div class="breadcrumb">
            <a class="breadcrumb-back" href="${BASE_HASH}/queue">
              <jh-icon-arrow-left size="small"></jh-icon-arrow-left>
              Warnings
            </a>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-current">Warning details</span>
          </div>

          <div class="header">
            <div>
              <h1>${row.displayAlias || row.legacyDescription || 'New warning'}</h1>
              <div class="code-tag">
                ${this._isNew
                  ? 'Draft — not yet saved'
                  : html`Warning ${row.id} · ${row.isNative ? 'No legacy code' : `Legacy code ${row.codeNum}`}`}
              </div>
            </div>
            <p class="status-line">Status: ${row.conversionStatus}</p>
          </div>

          ${this._confirm
            ? html`<jh-notification class="confirm" type="alert" appearance="positive">Changes saved.</jh-notification>`
            : ''}

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

              <jh-notification type="alert" appearance="neutral">
                New: Restriction type. This is the single biggest gap between the legacy record and the new platform —
                pick how this warning should behave.
              </jh-notification>

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
                  `restriction:${row.id}:${row.restrictionType}`,
                  html`
                    <jh-select
                      label="Restriction type"
                      helper-text="No legacy equivalent — choose based on how staff currently treat this code."
                      .options=${withSelected(RESTRICTION_OPTIONS, row.restrictionType)}
                      @jh-change=${(e: Event) =>
                        this._update('restrictionType', (e.target as HTMLInputElement).value as RestrictionType)}
                    ></jh-select>
                  `
                )}
              </div>
              <p class="field-hint">
                Restrict blocks or limits an action · Waive exempts the account from another rule · Route redirects
                the account into or out of a workflow · Audit logs only, with no functional effect.
              </p>

              <div class="field-row">
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
                ${keyed(
                  `displayMode:${row.id}:${row.displayMode}`,
                  html`
                    <jh-select
                      label="Display mode"
                      helper-text=${displayModeHelper}
                      .options=${withSelected(DISPLAY_MODE_OPTIONS, row.displayMode)}
                      @jh-change=${(e: Event) =>
                        this._update('displayMode', (e.target as HTMLInputElement).value as DisplayMode)}
                    ></jh-select>
                  `
                )}
                ${keyed(
                  `expirationMode:${row.id}:${row.expiration.mode}`,
                  html`
                    <jh-select
                      label="Expiration"
                      .options=${withSelected(EXPIRATION_MODE_OPTIONS, row.expiration.mode)}
                      @jh-change=${(e: Event) =>
                        this._update('expiration', {
                          ...row.expiration,
                          mode: (e.target as HTMLInputElement).value as ExpirationMode,
                        })}
                    ></jh-select>
                  `
                )}
              </div>

              ${row.expiration.mode === 'FixedDate'
                ? html`
                    <jh-input
                      label="Expiration date"
                      helper-text="Format: YYYY-MM-DD — the warning is removed automatically once this date passes."
                      .value=${row.expiration.date || ''}
                      @jh-input=${(e: CustomEvent<{ value: string }>) =>
                        this._update('expiration', { ...row.expiration, date: e.detail.value })}
                    ></jh-input>
                  `
                : ''}
              ${row.expiration.mode === 'AutoManaged' || row.expiration.mode === 'Regulatory'
                ? html`
                    <p class="field-hint">
                      ${row.expiration.note || "This warning's lifecycle is managed automatically rather than by a fixed date."}
                    </p>
                  `
                : ''}

              ${row.isNative
                ? html`
                    <p class="field-hint">
                      This warning has no Symitar record to source security levels from — set them directly.
                    </p>
                    <div class="field-row">
                      ${keyed(
                        `iq:${row.id}:${row.privileges.iq}`,
                        html`
                          <jh-select
                            label="Inquiry (IQ)"
                            .options=${withSelected(PRIVILEGE_LEVEL_OPTIONS, String(row.privileges.iq))}
                            @jh-change=${(e: Event) =>
                              this._update('privileges', { ...row.privileges, iq: Number((e.target as HTMLInputElement).value) })}
                          ></jh-select>
                        `
                      )}
                      ${keyed(
                        `fm:${row.id}:${row.privileges.fm}`,
                        html`
                          <jh-select
                            label="File Maintenance (FM)"
                            .options=${withSelected(PRIVILEGE_LEVEL_OPTIONS, String(row.privileges.fm))}
                            @jh-change=${(e: Event) =>
                              this._update('privileges', { ...row.privileges, fm: Number((e.target as HTMLInputElement).value) })}
                          ></jh-select>
                        `
                      )}
                      ${keyed(
                        `tr:${row.id}:${row.privileges.tr}`,
                        html`
                          <jh-select
                            label="Transactions (TR)"
                            .options=${withSelected(PRIVILEGE_LEVEL_OPTIONS, String(row.privileges.tr))}
                            @jh-change=${(e: Event) =>
                              this._update('privileges', { ...row.privileges, tr: Number((e.target as HTMLInputElement).value) })}
                          ></jh-select>
                        `
                      )}
                    </div>
                  `
                : ''}

              <p class="action-preview">Action label on save: <strong>${previewLabel}</strong></p>

              <div class="footer-actions">
                <jh-button appearance="primary" label="Save changes" @click=${this._save}></jh-button>
                <jh-button appearance="secondary" label="Cancel" @click=${this._cancel}></jh-button>
              </div>
            </div>
          </jh-card>
        </div>

        <jh-platform-panel slot="right-panel" heading="Legacy Symitar record">
          <div class="legacy-content">
            ${row.isNative
              ? html`
                  <p class="native-empty">
                    No legacy Symitar record — this warning was created directly on the new platform.
                  </p>
                `
              : html`
                <div class="detail-row">
                  <span class="row-label">Code</span>
                  <span class="row-value">${row.codeNum}</span>
                </div>
                <div class="detail-row">
                  <span class="row-label">Description</span>
                  <span class="row-value">${row.legacyDescription}</span>
                </div>
                <div class="detail-row">
                  <span class="row-label">Record type</span>
                  <span class="row-value">${row.legacyRecordType || '—'}</span>
                </div>

                <p class="group-label">Privilege levels</p>
                <div class="detail-row">
                  <span class="row-label">Inquiry</span>
                  <span class="row-value">${row.privileges.iq} — ${privilegeLevelLabel(row.privileges.iq)}</span>
                </div>
                <div class="detail-row">
                  <span class="row-label">File maintenance</span>
                  <span class="row-value">${row.privileges.fm} — ${privilegeLevelLabel(row.privileges.fm)}</span>
                </div>
                <div class="detail-row">
                  <span class="row-label">Transaction</span>
                  <span class="row-value">${row.privileges.tr} — ${privilegeLevelLabel(row.privileges.tr)}</span>
                </div>

                <p class="group-label">Display</p>
                <div class="detail-row">
                  <span class="row-label">Acct Mgr</span>
                  <span class="row-value">${row.legacyDisplayFlags?.acctMgr ? 'Yes' : 'No'}</span>
                </div>
                <div class="detail-row">
                  <span class="row-label">Tlr Trn</span>
                  <span class="row-value">${row.legacyDisplayFlags?.tlrTrn ? 'Yes' : 'No'}</span>
                </div>

                <p class="group-label">Usage</p>
                <div class="detail-row">
                  <span class="row-label">Instances</span>
                  <span class="row-value">${row.usageCount.toLocaleString()}</span>
                </div>

                <p class="group-label">Action</p>
                <div class="detail-row">
                  <span class="row-label">Current label</span>
                  <span class="row-value">${row.actionLabel || '—'}</span>
                </div>
              `}
          </div>
        </jh-platform-panel>
      </jh-platform-content>
    `
  }
}

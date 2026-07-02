import { LitElement, html, css } from 'lit'
import { state } from 'lit/decorators.js'
import '@jack-henry/jh-elements/components/card/card.js'
import '@jack-henry/jh-elements/components/select/select.js'
import '@jack-henry/jh-elements/components/list-item/list-item.js'
import '@jack-henry/jh-elements/components/input/input.js'
import '@jack-henry/jh-elements/components/input-textarea/input-textarea.js'
import '@jack-henry/jh-elements/components/switch/switch.js'
import '@jack-henry/jh-elements/components/button/button.js'
import '@jack-henry/jh-elements/components/notification/notification.js'
import '@jack-henry/jh-elements/components/divider/divider.js'
import '@jack-henry/jh-elements/components/tag/tag.js'
import { getComponentDoc } from '../../../data/components/index.js'

interface Annotation {
  /** Marker number shown in the form and legend. */
  n: number
  /** The JH component tag this annotation explains. */
  tag: string
  /** Why this component was chosen *for this screen*. */
  whyHere: string
}

/**
 * The "why" for each component on the screen. The screen-specific reason lives
 * here; the canonical "when to use" guidance is pulled from the component
 * dataset at render time, so the two can never disagree.
 */
const ANNOTATIONS: Annotation[] = [
  { n: 1, tag: 'jh-notification', whyHere: 'A persistent banner sets context (cutoff time) and later confirms success — state the user should not miss.' },
  { n: 2, tag: 'jh-select', whyHere: 'Accounts are a known, short list, so a select beats free text and prevents typos.' },
  { n: 3, tag: 'jh-input', whyHere: 'The amount is free-form, so a single-line text field with helper text fits.' },
  { n: 4, tag: 'jh-input-textarea', whyHere: 'A memo can run long, so a multi-line field gives room without truncation.' },
  { n: 5, tag: 'jh-switch', whyHere: 'Recurring is a single on/off setting that applies immediately — a switch, not a checkbox.' },
  { n: 6, tag: 'jh-button', whyHere: 'One primary action moves the flow forward; everything else stays lower-emphasis.' },
]

const ACCOUNTS = [
  { value: 'chk', label: 'Checking ···4821 — $4,218.45' },
  { value: 'sav', label: 'Savings ···2934 — $12,030.88' },
  { value: 'mm', label: 'Money Market ···7651 — $8,500.00' },
]

export default class AnnotatedTransferFlow extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .page {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 400px;
      gap: var(--jh-dimension-500, 2.5rem);
      align-items: start;
      max-width: 1100px;
      margin: 0 auto;
      padding: var(--jh-dimension-500, 2.5rem);
    }

    @media (max-width: 900px) {
      .page {
        grid-template-columns: 1fr;
      }
    }

    .card-inner {
      padding: var(--jh-dimension-500, 2.5rem);
    }

    .title {
      margin: 0 0 var(--jh-dimension-100, 0.5rem);
      font-size: var(--jh-font-size-400, 1.25rem);
      font-weight: var(--jh-font-weight-bold, 700);
      color: var(--jh-color-content-primary-enabled);
    }

    .subtitle {
      margin: 0 0 var(--jh-dimension-500, 2.5rem);
      font-size: var(--jh-font-size-100, 0.875rem);
      color: var(--jh-color-content-secondary-enabled);
    }

    .fields {
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-400, 2rem);
    }

    /* A field paired with its numbered marker. */
    .anno {
      display: flex;
      gap: var(--jh-dimension-300, 1.5rem);
      align-items: flex-start;
    }

    .anno-body {
      flex: 1;
      min-width: 0;
    }

    .marker {
      flex-shrink: 0;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: 1px solid var(--jh-color-divider-primary);
      background: var(--jh-color-container-page);
      color: var(--jh-color-content-secondary-enabled);
      font-size: var(--jh-font-size-100, 0.875rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      transition: background 0.1s, color 0.1s, border-color 0.1s;
    }

    .marker:focus-visible {
      outline: 2px solid var(--jh-color-content-brand-enabled);
      outline-offset: 2px;
    }

    .marker.active {
      background: var(--jh-color-content-brand-enabled);
      color: white;
      border-color: var(--jh-color-content-brand-enabled);
    }

    .two-amounts {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--jh-dimension-300, 1.5rem);
    }

    .recurring-row {
      margin-top: var(--jh-dimension-200, 1rem);
    }

    .submit-row {
      margin-top: var(--jh-dimension-200, 1rem);
    }

    /* ── Legend ─────────────────────────────── */
    .legend-title {
      margin: 0 0 var(--jh-dimension-100, 0.5rem);
      font-size: var(--jh-font-size-450, 1.125rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled);
    }

    .legend-subtitle {
      margin: 0 0 var(--jh-dimension-400, 2rem);
      font-size: var(--jh-font-size-100, 0.875rem);
      color: var(--jh-color-content-secondary-enabled);
    }

    .legend-stack {
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-200, 1rem);
    }

    .legend-item {
      display: flex;
      gap: var(--jh-dimension-300, 1.5rem);
      padding: var(--jh-dimension-300, 1.5rem);
      border: 1px solid var(--jh-color-divider-primary);
      border-radius: var(--jh-border-radius-200, 8px);
      cursor: pointer;
      background: var(--jh-color-container-page);
      transition: border-color 0.1s, background 0.1s;
    }

    .legend-item:focus-visible {
      outline: 2px solid var(--jh-color-content-brand-enabled);
      outline-offset: 2px;
    }

    .legend-item.active {
      border-color: var(--jh-color-content-brand-enabled);
      background: var(--jh-color-container-primary-enabled);
    }

    .legend-body {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-100, 0.5rem);
    }

    .legend-head {
      display: flex;
      align-items: center;
      gap: var(--jh-dimension-200, 1rem);
    }

    .legend-why {
      margin: 0;
      font-size: var(--jh-font-size-100, 0.875rem);
      color: var(--jh-color-content-primary-enabled);
      line-height: 1.5;
    }

    .legend-guidance {
      margin: 0;
      padding-left: var(--jh-dimension-300, 1.5rem);
      border-left: 2px solid var(--jh-color-content-brand-enabled);
      font-size: var(--jh-font-size-100, 0.875rem);
      color: var(--jh-color-content-secondary-enabled);
      line-height: 1.5;
    }

    .legend-guidance-label {
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-secondary-enabled);
    }
  `

  @state() private _active: number | null = null
  @state() private _submitted = false

  private _toggle(n: number) {
    this._active = this._active === n ? null : n
  }

  private _marker(n: number) {
    return html`
      <span
        class="marker ${this._active === n ? 'active' : ''}"
        role="button"
        tabindex="0"
        aria-label="Annotation ${n}"
        @click=${(e: Event) => { e.stopPropagation(); this._toggle(n) }}
        @keydown=${(e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            e.stopPropagation()
            this._toggle(n)
          }
        }}
      >${n}</span>
    `
  }

  private _field(n: number, content: unknown) {
    return html`
      <div class="anno">
        ${this._marker(n)}
        <div class="anno-body">${content}</div>
      </div>
    `
  }

  private _submit() {
    this._submitted = true
    this._active = 1
  }

  private _renderForm() {
    return html`
      <jh-card>
        <div class="card-inner">
          <h2 class="title">Transfer funds</h2>
          <p class="subtitle">Move money between your accounts.</p>

          <div class="fields">
            ${this._field(
              1,
              this._submitted
                ? html`<jh-notification type="alert" appearance="positive">Transfer scheduled — funds will move today.</jh-notification>`
                : html`<jh-notification type="alert" appearance="neutral">Transfers submitted before 5:00 PM CT post the same business day.</jh-notification>`
            )}

            ${this._field(
              2,
              html`
                <jh-select label="From account" required>
                  ${ACCOUNTS.map(a => html`<jh-list-item value=${a.value} label=${a.label}></jh-list-item>`)}
                </jh-select>
              `
            )}

            ${this._field(
              2,
              html`
                <jh-select label="To account" required>
                  ${ACCOUNTS.map(a => html`<jh-list-item value=${a.value} label=${a.label}></jh-list-item>`)}
                </jh-select>
              `
            )}

            ${this._field(
              3,
              html`<jh-input label="Amount" helper-text="Enter a dollar amount, e.g. 250.00"></jh-input>`
            )}

            ${this._field(
              4,
              html`<jh-input-textarea label="Memo (optional)" rows="3" helper-text="Add a note for your records"></jh-input-textarea>`
            )}

            ${this._field(
              5,
              html`<div class="recurring-row"><jh-switch label="Make this a recurring transfer"></jh-switch></div>`
            )}

            ${this._field(
              6,
              html`
                <div class="submit-row">
                  <jh-button
                    label=${this._submitted ? 'Transfer scheduled' : 'Review transfer'}
                    appearance="primary"
                    ?disabled=${this._submitted}
                    @click=${this._submit}
                  ></jh-button>
                </div>
              `
            )}
          </div>
        </div>
      </jh-card>
    `
  }

  private _renderLegend() {
    return html`
      <jh-card>
        <div class="card-inner">
          <h2 class="legend-title">Why these components</h2>
          <p class="legend-subtitle">
            Select a number to highlight it on the form. The design-system guidance is pulled live from the component library.
          </p>
          <div class="legend-stack">
            ${ANNOTATIONS.map(a => {
              const doc = getComponentDoc(a.tag)
              const guidance = doc?.whenToUse?.[0]
              return html`
                <div
                  class="legend-item ${this._active === a.n ? 'active' : ''}"
                  role="button"
                  tabindex="0"
                  @click=${() => this._toggle(a.n)}
                  @keydown=${(e: KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), this._toggle(a.n))}
                >
                  ${this._marker(a.n)}
                  <div class="legend-body">
                    <div class="legend-head">
                      <jh-tag label=${a.tag}></jh-tag>
                    </div>
                    <p class="legend-why">${a.whyHere}</p>
                    ${guidance
                      ? html`<p class="legend-guidance"><span class="legend-guidance-label">Design system: </span>${guidance}</p>`
                      : ''}
                  </div>
                </div>
              `
            })}
          </div>
        </div>
      </jh-card>
    `
  }

  render() {
    return html`
      <div class="page">
        ${this._renderForm()}
        ${this._renderLegend()}
      </div>
    `
  }
}
